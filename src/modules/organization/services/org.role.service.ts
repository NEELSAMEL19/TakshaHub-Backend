// org.role.service.ts
import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType } from "@prisma/client";
import { VALID_STAFF_PERMISSIONS } from "../../sidebar/menu.registry.js";
import {
  buildValidPermissionSet,
  getAllowedActionsMap,
} from "../../permissions/permission.registry.js";

export interface CreateRoleInput {
  schoolId: string | bigint;
  name: string;
  portalType: PortalType;
  updatedBy?: bigint; // userId performing the action
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
  // ✅ Shared helper — batch fetch permissions, no N+1
  // Replace resolvePermissions in org.role.service.ts with this

  private static async resolvePermissions(
    permissions: NonNullable<CreateRoleInput["permissions"]>,
    portalType: PortalType,
  ) {
    const validSet = buildValidPermissionSet(portalType);
    const allowedActionsMap = getAllowedActionsMap(portalType);

    // ✅ Validate module:feature exists in registry
    for (const item of permissions) {
      const key = `${item.module}:${item.feature}`;

      if (!validSet.has(key)) {
        throw new AppError(
          `'${item.module} -> ${item.feature}' is not a valid permission.`,
          400,
        );
      }

      // ✅ Validate that only allowed actions are being set to true
      const allowedActions = allowedActionsMap.get(key) ?? [];
      const actionsToCheck = [
        "canRead",
        "canCreate",
        "canUpdate",
        "canDelete",
      ] as const;

      for (const action of actionsToCheck) {
        if (item[action] === true && !allowedActions.includes(action)) {
          throw new AppError(
            `Action '${action}' is not allowed for '${item.module} -> ${item.feature}'.`,
            400,
          );
        }
      }
    }

    // ✅ Single batch query — no N+1
    const globalPerms = await prisma.permission.findMany({
      where: {
        portalType,
        OR: permissions.map((p) => ({ module: p.module, feature: p.feature })),
      },
    });

    const permMap = new Map(
      globalPerms.map((p) => [`${p.module}:${p.feature}`, p]),
    );

    return permissions.map((item) => {
      const globalPerm = permMap.get(`${item.module}:${item.feature}`);
      if (!globalPerm) {
        throw new AppError(
          `Permission '${item.module} -> ${item.feature}' not seeded in DB.`,
          404,
        );
      }
      return {
        permissionId: globalPerm.id,
        canRead: item.canRead ?? false,
        canCreate: item.canCreate ?? false,
        canUpdate: item.canUpdate ?? false,
        canDelete: item.canDelete ?? false,
      };
    });
  }

  static async createRole(data: CreateRoleInput) {
    if (data.portalType === PortalType.ADMIN) {
      throw new AppError("Creating ADMIN roles is forbidden.", 403);
    }

    const schoolId = BigInt(data.schoolId);
    const roleName = data.name.trim();

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
        `Role '${roleName}' already exists under '${data.portalType}'.`,
        409,
      );
    }

    // ✅ Resolve permissions in one batch — only for STAFF
    const permissionDataToInsert =
      data.portalType === PortalType.STAFF && data.permissions?.length
        ? await OrgRoleService.resolvePermissions(
            data.permissions,
            data.portalType,
          )
        : [];

    const newRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: { schoolId, name: roleName, portalType: data.portalType },
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
            updatedBy: data.updatedBy ?? null,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: role.id },
        include: { permissions: { include: { permission: true } } },
      });
    });

    return serializeBigInt(newRole);
  }

  static async updateRole(
    schoolId: string | bigint,
    oldName: string,
    newName: string,
    oldPortalType: PortalType,
    newPortalType: PortalType,
    updatedBy?: bigint,
    permissions?: CreateRoleInput["permissions"],
  ) {
    const sId = BigInt(schoolId);
    const formattedOldName = oldName.trim();
    const formattedNewName = newName.trim();

    // Find using OLD values
    const role = await prisma.role.findUnique({
      where: {
        schoolId_name_portalType: {
          schoolId: sId,
          name: formattedOldName,
          portalType: oldPortalType,
        },
      },
    });

    if (!role) {
      throw new AppError(`Role '${formattedOldName}' not found.`, 404);
    }

    // Check duplicate using NEW values
    if (
      formattedOldName !== formattedNewName ||
      oldPortalType !== newPortalType
    ) {
      const existing = await prisma.role.findUnique({
        where: {
          schoolId_name_portalType: {
            schoolId: sId,
            name: formattedNewName,
            portalType: newPortalType,
          },
        },
      });

      if (existing && existing.id !== role.id) {
        throw new AppError(
          `Role '${formattedNewName}' already exists under '${newPortalType}'.`,
          409,
        );
      }
    }

    const permissionDataToInsert =
      newPortalType === PortalType.STAFF && permissions?.length
        ? await OrgRoleService.resolvePermissions(permissions, newPortalType)
        : [];

    const updatedRole = await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id: role.id },
        data: {
          name: formattedNewName,
          portalType: newPortalType,
        },
      });

      await tx.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      if (
        newPortalType === PortalType.STAFF &&
        permissionDataToInsert.length > 0
      ) {
        await tx.rolePermission.createMany({
          data: permissionDataToInsert.map((p) => ({
            roleId: role.id,
            permissionId: p.permissionId,
            canRead: p.canRead,
            canCreate: p.canCreate,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
            updatedBy: updatedBy ?? null,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: role.id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });

    return serializeBigInt(updatedRole);
  }

  static async getRoleById(schoolId: string | bigint, id: string) {
    const sId = BigInt(schoolId);
    const role = await prisma.role.findUnique({
      where: { id: BigInt(id), schoolId: sId },
      include: { permissions: { include: { permission: true } } },
    });

    if (!role) throw new AppError(`Role not found.`, 404);

    return serializeBigInt(role);
  }

  static async getRoleDropdownOptions(schoolId: string | bigint) {
    const id = BigInt(schoolId);
    const roles = await prisma.role.findMany({
      where: { schoolId: id },
      select: { name: true },
      orderBy: { name: "asc" },
    });
    return roles.map((role) => ({ label: role.name, value: role.name }));
  }

  static async getAllRoles(schoolId: string | bigint) {
    const sId = BigInt(schoolId);
    const roles = await prisma.role.findMany({
      where: { schoolId: sId },
      orderBy: { name: "asc" },
    });
    return serializeBigInt(roles);
  }

  static async deleteRole(
    schoolId: string | bigint,
    name: string,
    portalType: PortalType,
  ) {
    const sId = BigInt(schoolId);
    const role = await prisma.role.findUnique({
      where: { schoolId_name_portalType: { schoolId: sId, name, portalType } },
    });

    if (!role) {
      throw new AppError(`Role '${name}' not found.`, 404);
    }

    // ✅ Cascade delete handles RolePermission automatically via schema
    await prisma.role.delete({ where: { id: role.id } });

    return { deleted: true };
  }
}
