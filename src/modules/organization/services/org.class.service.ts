import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";

export class OrgClassService {
  /**
   * CREATE: Adds a class and mappings for its starting sections
   */
  static async createClassWithSections(
    schoolId: string | bigint,
    className: string,
    sections: string[],
  ) {
    const sId = BigInt(schoolId);
    const formattedClassName = className.trim();

    const existingClass = await prisma.class.findUnique({
      where: { schoolId_name: { schoolId: sId, name: formattedClassName } },
    });

    if (existingClass) {
      throw new AppError(
        `Class '${formattedClassName}' already exists in this school.`,
        409,
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const newClass = await tx.class.create({
        data: { schoolId: sId, name: formattedClassName },
      });

      await tx.section.createMany({
        data: sections.map((sectionName) => ({
          classId: newClass.id,
          name: sectionName.trim(),
        })),
      });

      return tx.class.findUnique({
        where: { id: newClass.id },
        include: { sections: true },
      });
    });

    // 🔥 FIXED: Wrap the final transaction output before returning to the controller
    return serializeBigInt(result);
  }

  /**
   * READ: Fetches all classes with their related sections included
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
   * UPDATE: Renames a class standard name smoothly
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

    if (formattedOld !== formattedNew) {
      const nameTaken = await prisma.class.findUnique({
        where: { schoolId_name: { schoolId: sId, name: formattedNew } },
      });
      if (nameTaken) {
        throw new AppError(`Class '${formattedNew}' already exists.`, 409);
      }
    }

    const updated = await prisma.class.update({
      where: { id: targetClass.id },
      data: { name: formattedNew },
    });

    return serializeBigInt(updated);
  }

  /**
   * DELETE: Removes a class and cascades through its sections transactionally
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

    await prisma.$transaction(async (tx) => {
      // 1. Manually clean up downstream section rows first to respect foreign constraints safely
      await tx.section.deleteMany({
        where: { classId: targetClass.id },
      });

      // 2. Drop parent class configuration record
      await tx.class.delete({
        where: { id: targetClass.id },
      });
    });

    return { deleted: true };
  }
}
