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
      select: { portalType: true },
    });

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true },
    });

    return buildSidebar(role?.portalType ?? null, rolePermissions);
  },
};