// seed.ts
import prisma from "../src/config/prisma.js";
import { PERMISSION_REGISTRY } from "../src/modules/permissions/permission.registry.js";
import type { PortalType } from "@prisma/client";

async function main() {
  const entries: {
    module: string;
    feature: string;
    portalType: PortalType;
    label: string;
  }[] = [];

  for (const [portalType, modules] of Object.entries(PERMISSION_REGISTRY)) {
    for (const mod of modules) {
      for (const feat of mod.features) {
        entries.push({
          module: mod.id,
          feature: feat.id,
          portalType: portalType as PortalType,
          label: feat.name,
        });
      }
    }
  }

  await prisma.permission.createMany({
    data: entries,
    skipDuplicates: true,
  });

  console.log(`Seeded ${entries.length} permissions from registry.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
