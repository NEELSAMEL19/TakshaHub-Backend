import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";

export class ManagementClassService {
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

      await tx.section.createMany({
        data: safeSections.map((sectionName) => ({
          classId: newClass.id,
          name: sectionName.trim(),
        })),
      });

      return tx.class.findUnique({
        where: { id: newClass.id },
        include: { sections: true },
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
   * UPDATE: Renames a class. No-ops if the name is unchanged.
   */
  static async updateClass(
    schoolId: string | bigint,
    oldClassName: string,
    newClassName: string,
  ) {
    const sId = BigInt(schoolId);
    const formattedOld = oldClassName.trim();
    const formattedNew = newClassName.trim();

    const targetClass = await prisma.class.findUnique({
      where: { schoolId_name: { schoolId: sId, name: formattedOld } },
    });

    if (!targetClass) {
      throw new AppError(`Class '${formattedOld}' not found.`, 404);
    }

    if (formattedOld === formattedNew) {
      return serializeBigInt(targetClass);
    }

    const nameTaken = await prisma.class.findUnique({
      where: { schoolId_name: { schoolId: sId, name: formattedNew } },
    });

    if (nameTaken) {
      throw new AppError(`Class '${formattedNew}' already exists.`, 409);
    }

    const updated = await prisma.class.update({
      where: { id: targetClass.id },
      data: { name: formattedNew },
    });

    return serializeBigInt(updated);
  }

  static async getSectionsByClassId(
    schoolId: string | bigint,
    classId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const cId = BigInt(classId);

    const targetClass = await prisma.class.findFirst({
      where: { id: cId, schoolId: sId },
    });

    if (!targetClass) {
      throw new AppError("Class not found.", 404);
    }

    const sections = await prisma.section.findMany({
      where: { classId: cId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return serializeBigInt(sections);
  }

  /**
   * DELETE: Removes a class. Sections are dropped automatically via cascade.
   */
  static async deleteClass(schoolId: string | bigint, className: string) {
    const sId = BigInt(schoolId);
    const formattedName = className.trim();

    const targetClass = await prisma.class.findUnique({
      where: { schoolId_name: { schoolId: sId, name: formattedName } },
    });

    if (!targetClass) {
      throw new AppError(`Class '${formattedName}' not found.`, 404);
    }

    await prisma.class.delete({ where: { id: targetClass.id } });

    return { deleted: true };
  }
}
