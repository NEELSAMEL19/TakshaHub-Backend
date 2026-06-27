// sidebar.builder.ts
import { getMenuRegistry } from "./menu.registry.js";
import {
  buildPermissionMap,
  RolePermissionWithPermission,
} from "../../common/utils/mapPermission.js";
import type { SidebarResponse } from "./sidebar.types.js";
import type { PortalType } from "@prisma/client";

// ✅ Single unified builder — no duplication
// skipPermissionCheck = true for TEACHER and STUDENT
export function buildSidebar(
  role: PortalType | null,
  rolePermissions: RolePermissionWithPermission[],
  options: { skipPermissionCheck: boolean } = { skipPermissionCheck: false },
): SidebarResponse {
  const isAdmin = role === "ADMIN";
  const skip = isAdmin || options.skipPermissionCheck;

  const menuItems = getMenuRegistry(role);
  const permissionMap = skip ? null : buildPermissionMap(rolePermissions);

  const result: SidebarResponse = {};

  for (const item of menuItems) {
    if (!result[item.group]) result[item.group] = {};

    // Items with no module/feature are always visible (e.g. Dashboard)
    if (!item.module || !item.feature) {
      result[item.group][item.id] = item.label;
      continue;
    }

    // Permission check for STAFF only
    if (!skip && !permissionMap!.get(`${item.module}:${item.feature}`)) {
      continue;
    }

    result[item.group][item.id] = item.label;
  }

  // Clean up empty groups
  for (const group of Object.keys(result)) {
    if (Object.keys(result[group]).length === 0) delete result[group];
  }

  return result;
}
