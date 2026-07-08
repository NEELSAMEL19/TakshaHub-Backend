import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";

interface SectionInput {
  id?: string | bigint; // present => update existing section, absent => create new
  name: string;
}

// Splits "A,B,C" -> ["A", "B", "C"]; leaves "A" -> ["A"]. Guards against
// section names ever being stored as one comma-joined string going forward.
const splitSectionNames = (names: string[]): string[] => {
  return names
    .flatMap((n) => n.split(","))
    .map((n) => n.trim())
    .filter(Boolean);
};

export class ManagementClassService {
  /**
   * CREATE: Creates a class along with its initial sections in one call.
   */
  static async createClassWithSections(
    schoolId: string | bigint,
    className: string,
    sections: string[],
  ) {
    const sId = BigInt(schoolId);
    const formattedClassName = className.trim();
    const safeSections = Array.isArray(sections) ? sections : [];

    const result = await prisma.$transaction(async (tx) => {
      const existingClass = await tx.class.findUnique({
        where: { schoolId_name: { schoolId: sId, name: formattedClassName } },
      });

      if (existingClass) {
        throw new AppError(
          `Class '${formattedClassName}' already exists in this school.`,
          409,
        );
      }

      const newClass = await tx.class.create({
        data: { schoolId: sId, name: formattedClassName },
      });

      // Defensively split any comma-joined names before storing, so a bad
      // "A,B,C" row can never be created again.
      const trimmedSections = splitSectionNames(safeSections);

      const uniqueNames = new Set(trimmedSections.map((s) => s.toLowerCase()));
      if (uniqueNames.size !== trimmedSections.length) {
        throw new AppError("Duplicate section names in request.", 400);
      }

      if (trimmedSections.length) {
        await tx.section.createMany({
          data: trimmedSections.map((sectionName) => ({
            classId: newClass.id,
            name: sectionName,
          })),
        });
      }

      return tx.class.findUnique({
        where: { id: newClass.id },
        include: { sections: { orderBy: { name: "asc" } } },
      });
    });

    return serializeBigInt(result);
  }

  /**
   * UPDATE: Renames a class AND syncs its sections in a single transaction.
   */
  static async updateClassWithSections(
    schoolId: string | bigint,
    classId: string | bigint,
    newClassName: string,
    sections?: SectionInput[],
  ) {
    const sId = BigInt(schoolId);
    const cId = BigInt(classId);
    const formattedNew = newClassName.trim();

    const result = await prisma.$transaction(async (tx) => {
      const targetClass = await tx.class.findFirst({
        where: { id: cId, schoolId: sId },
      });

      if (!targetClass) {
        throw new AppError("Class not found.", 404);
      }

      if (targetClass.name !== formattedNew) {
        const nameTaken = await tx.class.findUnique({
          where: { schoolId_name: { schoolId: sId, name: formattedNew } },
        });

        if (nameTaken) {
          throw new AppError(`Class '${formattedNew}' already exists.`, 409);
        }

        await tx.class.update({
          where: { id: targetClass.id },
          data: { name: formattedNew },
        });
      }

      if (sections !== undefined) {
        const safeSections = Array.isArray(sections) ? sections : [];

        // Expand any item whose name contains commas into multiple items.
        // Items with an `id` are left as single updates (renaming one
        // existing section shouldn't silently multiply it).
        const expandedSections: SectionInput[] = safeSections.flatMap(
          (item) => {
            if (item.id !== undefined) {
              return [{ ...item, name: item.name.trim() }];
            }
            return splitSectionNames([item.name]).map((name) => ({ name }));
          },
        );

        const existingSections = await tx.section.findMany({
          where: { classId: targetClass.id },
        });
        const existingById = new Map(
          existingSections.map((s) => [s.id.toString(), s]),
        );

        const incomingIds = new Set(
          expandedSections
            .filter((s) => s.id !== undefined)
            .map((s) => s.id!.toString()),
        );

        const trimmedNames = expandedSections.map((s) =>
          s.name.trim().toLowerCase(),
        );
        if (new Set(trimmedNames).size !== trimmedNames.length) {
          throw new AppError("Duplicate section names in request.", 400);
        }

        const toDelete = existingSections.filter(
          (s) => !incomingIds.has(s.id.toString()),
        );
        if (toDelete.length) {
          await tx.section.deleteMany({
            where: { id: { in: toDelete.map((s) => s.id) } },
          });
        }

        for (const item of expandedSections) {
          const formattedName = item.name.trim();

          if (item.id !== undefined) {
            const existing = existingById.get(item.id.toString());

            if (!existing) {
              throw new AppError(
                `Section with id '${item.id}' not found in this class.`,
                404,
              );
            }

            if (existing.name !== formattedName) {
              await tx.section.update({
                where: { id: existing.id },
                data: { name: formattedName },
              });
            }
          } else {
            await tx.section.create({
              data: { classId: targetClass.id, name: formattedName },
            });
          }
        }
      }

      return tx.class.findUnique({
        where: { id: targetClass.id },
        include: { sections: { orderBy: { name: "asc" } } },
      });
    });

    return serializeBigInt(result);
  }

  /**
   * READ: Fetches all classes with their sections, ordered alphabetically.
   */
  static async getAllClasses(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const classes = await prisma.class.findMany({
      where: { schoolId: sId },
      include: {
        sections: { orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    return serializeBigInt(classes);
  }

  /**
   * READ: Fetches a single class (scoped to school) with its sections.
   */
  static async getClassById(
    schoolId: string | bigint,
    classId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const cId = BigInt(classId);

    const targetClass = await prisma.class.findFirst({
      where: { id: cId, schoolId: sId },
      include: {
        sections: { orderBy: { name: "asc" } },
      },
    });

    if (!targetClass) {
      throw new AppError(`Class not found.`, 404);
    }

    return serializeBigInt(targetClass);
  }

  /**
   * READ: Lightweight list of classes for dropdown UI.
   */
  static async getClassesForDropdown(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const classes = await prisma.class.findMany({
      where: { schoolId: sId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const formatted = classes.map((c) => ({
      label: c.name,
      value: c.id,
    }));

    return serializeBigInt(formatted);
  }

  /**
   * READ: Lightweight list of sections (for a given class) for dropdown UI.
   * Scoped to schoolId + classId so users can't fetch another school's
   * sections by guessing a classId. Each section has its own distinct id.
   */
  static async getSectionsForDropdown(
    schoolId: string | bigint,
    classId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const cId = BigInt(classId);

    const targetClass = await prisma.class.findFirst({
      where: { id: cId, schoolId: sId },
      select: { id: true },
    });

    if (!targetClass) {
      throw new AppError("Class not found.", 404);
    }

    const sections = await prisma.section.findMany({
      where: { classId: cId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return serializeBigInt(
      sections.map((s) => ({
        label: s.name,
        value: s.id,
      })),
    );
  }

  /**
   * DELETE: Removes a class. Sections are dropped automatically via cascade.
   */
  static async deleteClass(
    schoolId: string | bigint,
    classId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const cId = BigInt(classId);

    const targetClass = await prisma.class.findFirst({
      where: { id: cId, schoolId: sId },
    });

    if (!targetClass) {
      throw new AppError(`Class not found.`, 404);
    }

    await prisma.class.delete({ where: { id: targetClass.id } });

    return { deleted: true };
  }
}
