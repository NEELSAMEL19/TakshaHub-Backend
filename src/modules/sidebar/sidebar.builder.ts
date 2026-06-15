import { getMenuRegistry } from "./menu.registry.js";
import { buildPermissionMap, RolePermissionWithPermission } from "../../common/utils/mapPermission.js";
import { SidebarResponse } from "./sidebar.types.js";
import type { PortalType } from "@prisma/client";

// ─── Admin / Staff: permission-gated sidebar ───

export function buildSidebar(
  role: PortalType | null,
  rolePermissions: RolePermissionWithPermission[]
): SidebarResponse {
  const isAdmin = role === "ADMIN";

  const menuItems = getMenuRegistry(role);
  const permissionMap = isAdmin ? null : buildPermissionMap(rolePermissions);

  const result: SidebarResponse = {};

  for (const item of menuItems) {
    if (!result[item.group]) {
      result[item.group] = {};
    }

    if (!item.module) {
      result[item.group][item.id] = item.label;
      continue;
    }

    if (!isAdmin && !permissionMap!.get(`${item.module}:${item.feature}`)) {
      continue;
    }

    result[item.group][item.id] = item.label;
  }

  for (const group of Object.keys(result)) {
    if (Object.keys(result[group]).length === 0) {
      delete result[group];
    }
  }

  return result;
}

// ─── Teacher / Student: no permission checks, direct registry ───

export function buildSidebarDirect(role: PortalType): SidebarResponse {
  const menuItems = getMenuRegistry(role);
  const result: SidebarResponse = {};

  for (const item of menuItems) {
    if (!result[item.group]) {
      result[item.group] = {};
    }
    result[item.group][item.id] = item.label;
  }

  for (const group of Object.keys(result)) {
    if (Object.keys(result[group]).length === 0) {
      delete result[group];
    }
  }

  return result;
}
