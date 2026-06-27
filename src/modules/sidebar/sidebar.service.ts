// sidebar.service.ts
import prisma from "../../config/prisma.js";
import { buildSidebar } from "./sidebar.builder.js";
import type { RolePermissionWithPermission } from "../../common/utils/mapPermission.js";

export interface SidebarUser {
  roleId: bigint;
}

export const sidebarService = {
  async getSidebar(user: SidebarUser) {
    const role = await prisma.role.findUnique({
      where: { id: user.roleId },
      select: {
        portalType: true,
        permissions: {
          include: { permission: true },
        },
      },
    });

    console.log("role →", JSON.stringify(role, null, 2)); // add this
    console.log("portalType →", role?.portalType); // add this
    console.log("rolePermissions →", role?.permissions); // add this

    const portalType = role?.portalType ?? null;
    const rolePermissions = (role?.permissions ??
      []) as RolePermissionWithPermission[];

    const skipPermissionCheck =
      portalType === "TEACHER" || portalType === "STUDENT";

    return buildSidebar(portalType, rolePermissions, { skipPermissionCheck });
  },
};
