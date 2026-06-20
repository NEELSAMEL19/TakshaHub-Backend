import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType } from "@prisma/client";

export interface CreateRoleInput {
  schoolId: string | bigint;
  name: string;
  portalType: PortalType;
  permissions?: {
    module: string;
    feature: string;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  }[];
}

export class OrgRoleService {
  static async createRole(data: CreateRoleInput) {
    // 🔥 CRITICAL SECURITY GUARD: Block any attempt to create another ADMIN role
    if (data.portalType === PortalType.ADMIN) {
      throw new AppError(
        "Security Restriction: Creating additional ADMIN portal roles is strictly forbidden.",
        403,
      );
    }

    const schoolId = BigInt(data.schoolId);
    const roleName = data.name.trim();

    // 1. Enforce unique multi-tenant constraints
    const existingRole = await prisma.role.findUnique({
      where: {
        schoolId_name_portalType: {
          schoolId,
          name: roleName,
          portalType: data.portalType,
        },
      },
    });

    if (existingRole) {
      throw new AppError(
        `Role '${roleName}' already exists under portal '${data.portalType}'.`,
        409,
      );
    }

    const permissionDataToInsert: {
      permissionId: bigint;
      canRead: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }[] = [];

    // Process permissions ONLY for STAFF portal types
    if (
      data.portalType === PortalType.STAFF &&
      data.permissions &&
      data.permissions.length > 0
    ) {
      for (const item of data.permissions) {
        const globalPerm = await prisma.permission.findUnique({
          where: {
            module_feature: {
              module: item.module,
              feature: item.feature,
            },
          },
        });

        if (!globalPerm) {
          throw new AppError(
            `System permission mapping not found for ${item.module} -> ${item.feature}`,
            404,
          );
        }

        permissionDataToInsert.push({
          permissionId: globalPerm.id,
          canRead: item.canRead ?? false,
          canCreate: item.canCreate ?? false,
          canUpdate: item.canUpdate ?? false,
          canDelete: item.canDelete ?? false,
        });
      }
    }

    // 2. Persist data transactionally
    const newRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          schoolId,
          name: roleName,
          portalType: data.portalType,
        },
      });

      if (permissionDataToInsert.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionDataToInsert.map((p) => ({
            roleId: role.id,
            permissionId: p.permissionId,
            canRead: p.canRead,
            canCreate: p.canCreate,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: role.id },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });
    });

    return serializeBigInt(newRole);
  }

  static async getRoleDropdownOptions(schoolId: string | bigint) {
    const id = BigInt(schoolId);

    const roles = await prisma.role.findMany({
      where: {
        schoolId: id,
      },
      select: {
        name: true, // We don't even need the internal database ID anymore!
      },
      orderBy: {
        name: "asc",
      },
    });

    // 🔥 Map so both frontend properties use the exact same string
    return roles.map((role) => ({
      label: role.name,
      value: role.name, // Now the name string is passed to the backend form submission
    }));
  }

  static async getAllRoles(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const roles = await prisma.role.findMany({
      where: {
        schoolId: sId,
      },
      // 🔥 No includes here! Keeps the response light and clean.
      orderBy: {
        name: "asc",
      },
    });

    return serializeBigInt(roles);
  }
  
  static async updateRole(
    schoolId: string | bigint,
    oldName: string,
    newName: string,
    portalType: PortalType,
    permissions?: CreateRoleInput["permissions"],
  ) {
    const sId = BigInt(schoolId);
    const formattedOldName = oldName.trim();
    const formattedNewName = newName.trim();

    // 1. Find the target existing role
    const role = await prisma.role.findUnique({
      where: {
        schoolId_name_portalType: {
          schoolId: sId,
          name: formattedOldName,
          portalType,
        },
      },
    });

    if (!role) {
      throw new AppError(
        `Role '${formattedOldName}' under portal '${portalType}' not found.`,
        404,
      );
    }

    // 2. Check name collisions if the name is changing
    if (formattedOldName !== formattedNewName) {
      const nameTaken = await prisma.role.findUnique({
        where: {
          schoolId_name_portalType: {
            schoolId: sId,
            name: formattedNewName,
            portalType,
          },
        },
      });
      if (nameTaken) {
        throw new AppError(
          `A role named '${formattedNewName}' already exists under portal '${portalType}'.`,
          409,
        );
      }
    }

    const permissionDataToInsert: {
      permissionId: bigint;
      canRead: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }[] = [];

    // 3. Map permission structures strictly for STAFF types
    if (
      portalType === PortalType.STAFF &&
      permissions &&
      permissions.length > 0
    ) {
      for (const item of permissions) {
        const globalPerm = await prisma.permission.findUnique({
          where: {
            module_feature: { module: item.module, feature: item.feature },
          },
        });

        if (!globalPerm) {
          throw new AppError(
            `System permission mapping not found for ${item.module} -> ${item.feature}`,
            404,
          );
        }

        permissionDataToInsert.push({
          permissionId: globalPerm.id,
          canRead: item.canRead ?? false,
          canCreate: item.canCreate ?? false,
          canUpdate: item.canUpdate ?? false,
          canDelete: item.canDelete ?? false,
        });
      }
    }

    // 4. Atomically persist changes within an isolated transaction block
    const updatedRole = await prisma.$transaction(async (tx) => {
      // Step A: Update base role data attributes
      const updatedBaseRole = await tx.role.update({
        where: { id: role.id },
        data: { name: formattedNewName },
      });

      // Step B: Manage dynamic permissions matrix if portal type is STAFF
      if (portalType === PortalType.STAFF) {
        // Drop all existing relation rows completely to prevent duplicates/orphans
        await tx.rolePermission.deleteMany({
          where: { roleId: role.id },
        });

        // Insert incoming structured matrices if they were passed
        if (permissionDataToInsert.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionDataToInsert.map((p) => ({
              roleId: role.id,
              permissionId: p.permissionId,
              canRead: p.canRead,
              canCreate: p.canCreate,
              canUpdate: p.canUpdate,
              canDelete: p.canDelete,
            })),
          });
        }
      }

      // Return unified object tree state representation
      return tx.role.findUnique({
        where: { id: role.id },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });
    });

    return serializeBigInt(updatedRole);
  }
  /**
   * Deletes a role and cleans up its linked permissions transactionally
   */
  static async deleteRole(
    schoolId: string | bigint,
    name: string,
    portalType: PortalType,
  ) {
    const sId = BigInt(schoolId);

    const role = await prisma.role.findUnique({
      where: {
        schoolId_name_portalType: { schoolId: sId, name, portalType },
      },
    });

    if (!role) {
      throw new AppError(
        `Role '${name}' under portal '${portalType}' not found.`,
        404,
      );
    }

    // Execute deletion within a transaction block to safely clean up relational records
    await prisma.$transaction(async (tx) => {
      // 1. Delete linked role permissions first (Foreign key constraint cleanup)
      await tx.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      // 2. Delete the base role
      await tx.role.delete({
        where: { id: role.id },
      });
    });

    return { deleted: true };
  }
}
