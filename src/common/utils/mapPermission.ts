export interface RolePermissionWithPermission {
  permission: {
    module: string;
    feature: string;
  };
  canRead: boolean;
}

export function buildPermissionMap(rolePermissions: RolePermissionWithPermission[]) {
  const map = new Map<string, boolean>();

  for (const rp of rolePermissions) {
    const key = `${rp.permission.module}:${rp.permission.feature}`;
    map.set(key, rp.canRead);
  }

  return map;
}