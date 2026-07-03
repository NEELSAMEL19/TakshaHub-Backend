import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";

interface SectionInput {
  id?: string | bigint; // present => update existing section, absent => create new
  name: string;
}

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

      const trimmedSections = safeSections.map((s) => s.trim()).filter(Boolean);

      // Guard against duplicate section names within the same payload
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
   *
   * sections behavior:
   *  - item with `id`   -> rename that existing section (if name changed)
   *  - item without `id`-> create a new section
   *  - any existing section NOT present in the payload -> deleted
   *
   * Pass `sections: undefined` to skip touching sections entirely
   * (only rename the class).
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

      // --- rename class (if changed) ---
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

      // --- sync sections (only if payload provided) ---
      if (sections !== undefined) {
        const safeSections = Array.isArray(sections) ? sections : [];

        const existingSections = await tx.section.findMany({
          where: { classId: targetClass.id },
        });
        const existingById = new Map(
          existingSections.map((s) => [s.id.toString(), s]),
        );

        const incomingIds = new Set(
          safeSections
            .filter((s) => s.id !== undefined)
            .map((s) => s.id!.toString()),
        );

        // Duplicate name guard within payload
        const trimmedNames = safeSections.map((s) =>
          s.name.trim().toLowerCase(),
        );
        if (new Set(trimmedNames).size !== trimmedNames.length) {
          throw new AppError("Duplicate section names in request.", 400);
        }

        // 1. Delete sections that exist in DB but were omitted from payload
        const toDelete = existingSections.filter(
          (s) => !incomingIds.has(s.id.toString()),
        );
        if (toDelete.length) {
          await tx.section.deleteMany({
            where: { id: { in: toDelete.map((s) => s.id) } },
          });
        }

        // 2. Create or update sections from payload
        for (const item of safeSections) {
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
        sections: {
          orderBy: { name: "asc" },
        },
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
      where: {
        id: cId,
        schoolId: sId, // ✅ scoped to school — prevents cross-school access
      },
      include: {
        sections: {
          orderBy: { name: "asc" },
        },
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

    return serializeBigInt(classes);
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
