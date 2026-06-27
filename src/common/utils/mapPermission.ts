// common/utils/mapPermission.ts
import type { Permission, RolePermission } from "@prisma/client";

export type RolePermissionWithPermission = RolePermission & {
  permission: Permission;
};

// Returns a map of "module:feature" -> canRead boolean
export function buildPermissionMap(
  rolePermissions: RolePermissionWithPermission[],
): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const rp of rolePermissions) {
    const key = `${rp.permission.module}:${rp.permission.feature}`;
    map.set(key, rp.canRead);
  }
  return map;
}
