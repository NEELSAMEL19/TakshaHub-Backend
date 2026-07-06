import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType } from "@prisma/client";

export class ManagementClassTeacherService {
  /**
   * READ: Get all class teacher assignments for a school
   */
  static async getClassTeachers(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const classTeachers = await prisma.classTeacher.findMany({
      where: { schoolId: sId },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
            isActive: true,
          },
        },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeBigInt(classTeachers);
  }

  /**
   * READ: Get the class teacher for a specific section
   */
  static async getClassTeacherBySection(
    schoolId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const secId = BigInt(sectionId);

    const classTeacher = await prisma.classTeacher.findFirst({
      where: { sectionId: secId, schoolId: sId },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
    });

    if (!classTeacher)
      throw new AppError("Class teacher not found for this section.", 404);

    return serializeBigInt(classTeacher);
  }

  /**
   * CREATE/UPDATE: Assign (or reassign) the class teacher for a section.
   * Upsert on sectionId — a section can only have one class teacher.
   */
  static async assignClassTeacher(
    schoolId: string | bigint,
    teacherId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const tId = BigInt(teacherId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify teacher belongs to this school
      const teacher = await tx.user.findFirst({
        where: {
          id: tId,
          schoolId: sId,
          deletedAt: null,
          role: { portalType: PortalType.TEACHER },
        },
      });
      if (!teacher) throw new AppError("Teacher not found.", 404);

      // 2. Verify class belongs to this school
      const targetClass = await tx.class.findFirst({
        where: { id: cId, schoolId: sId },
      });
      if (!targetClass) throw new AppError("Class not found.", 404);

      // 3. Verify section belongs to this class
      const section = await tx.section.findFirst({
        where: { id: secId, classId: cId },
      });
      if (!section) throw new AppError("Section not found.", 404);

      // 4. Upsert — replaces existing class teacher for this section if any
      return tx.classTeacher.upsert({
        where: { sectionId: secId },
        update: { teacherId: tId },
        create: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          schoolId: sId,
        },
        include: {
          teacher: { select: { id: true, fullName: true, email: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      });
    });

    return serializeBigInt(result);
  }

  /**
   * DELETE: Remove the class teacher assigned to a section
   */
  static async unassignClassTeacher(
    schoolId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const secId = BigInt(sectionId);

    const existing = await prisma.classTeacher.findUnique({
      where: { sectionId: secId },
    });

    if (!existing || existing.schoolId !== sId) {
      throw new AppError("Class teacher not found.", 404);
    }

    await prisma.classTeacher.delete({ where: { sectionId: secId } });

    return { deleted: true };
  }
}
