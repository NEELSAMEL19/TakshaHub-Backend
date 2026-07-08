// scripts/fix-sections.ts
import prisma from "../src/config/prisma.js";

async function main() {
  const badSection = await prisma.section.findUnique({ where: { id: 2n } });
  if (!badSection) return console.log("Already fixed or not found.");

  console.log("Found bad section:", badSection);

  const names = badSection.name
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.section.update({
      where: { id: badSection.id },
      data: { name: names[0] },
    });

    if (names.length > 1) {
      await tx.section.createMany({
        data: names.slice(1).map((name) => ({
          classId: badSection.classId,
          name,
        })),
      });
    }
  });

  console.log(
    "Fixed. Sections for class",
    badSection.classId,
    "are now separate rows.",
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
