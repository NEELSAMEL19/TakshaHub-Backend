// common/utils/validateRegistries.ts

import { MENU_REGISTRY } from "../../modules/sidebar/menu.registry.js";
import { PERMISSION_REGISTRY } from "../../modules/permissions/permission.registry.js";

export function validateRegistries() {
  const errors: string[] = [];

  for (const [portalType, permModules] of Object.entries(PERMISSION_REGISTRY)) {
    const menuItems =
      MENU_REGISTRY[portalType as keyof typeof MENU_REGISTRY] ?? [];

    // Build menu set for this portalType
    const menuSet = new Set(
      menuItems
        .filter((item) => item.module && item.feature)
        .map((item) => `${item.module}:${item.feature}`),
    );

    // Every permission registry entry must exist in menu registry
    for (const mod of permModules) {
      for (const feat of mod.features) {
        const key = `${mod.id}:${feat.id}`;
        if (!menuSet.has(key)) {
          errors.push(
            `[permission.registry] '${key}' for ${portalType} has no matching menu item`,
          );
        }
      }
    }

    // Every menu item must exist in permission registry
    const permSet = new Set(
      permModules.flatMap((mod) =>
        mod.features.map((feat) => `${mod.id}:${feat.id}`),
      ),
    );

    for (const item of menuItems) {
      if (!item.module || !item.feature) continue;
      const key = `${item.module}:${item.feature}`;
      if (!permSet.has(key)) {
        errors.push(
          `[menu.registry] '${key}' for ${portalType} has no matching permission entry`,
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error("❌ Registry mismatch detected:");
    errors.forEach((e) => console.error("  →", e));
    process.exit(1); // crash on startup — catch it early
  }

  console.log("✅ Registries validated successfully.");
}
