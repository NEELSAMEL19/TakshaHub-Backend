import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { getActiveAcademicYearId } from "../../../common/utils/academicYear.js";
import { PortalType } from "@prisma/client";

export class ManagementClassTeacherService {
  /**
   * READ: Get all class teacher assignments for a school, for the
   * active academic year.
   */
  static async getClassTeachers(schoolId: string | bigint) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);

    const classTeachers = await prisma.classTeacher.findMany({
      where: { schoolId: sId, academicYearId },
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
   * READ: Get a single class teacher assignment by its own ID.
   * Not year-scoped — an id is already unique, and admins may need to
   * view a past year's assignment record directly.
   */
  static async getClassTeacherById(
    schoolId: string | bigint,
    id: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const ctId = BigInt(id);

    const classTeacher = await prisma.classTeacher.findFirst({
      where: { id: ctId, schoolId: sId },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
    });

    if (!classTeacher)
      throw new AppError("Class teacher assignment not found.", 404);

    return serializeBigInt(classTeacher);
  }

  /**
   * READ: Get the class teacher for a specific section, for the active
   * academic year.
   */
  static async getClassTeacherBySection(
    schoolId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const secId = BigInt(sectionId);
    const academicYearId = await getActiveAcademicYearId(sId);

    const classTeacher = await prisma.classTeacher.findFirst({
      where: { sectionId: secId, schoolId: sId, academicYearId },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
    });

    if (!classTeacher)
      throw new AppError(
        "Class teacher not found for this section in the current academic year.",
        404,
      );

    return serializeBigInt(classTeacher);
  }

  /**
   * CREATE/UPDATE: Assign (or reassign) the class teacher for a section,
   * for the active academic year. Upsert on [sectionId, academicYearId] —
   * a section can only have one class teacher per year.
   */
  static async assignClassTeacher(
    schoolId: string | bigint,
    teacherId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);
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

      // 4. Upsert — replaces existing class teacher for this
      // section+year if any
      return tx.classTeacher.upsert({
        where: {
          sectionId_academicYearId: { sectionId: secId, academicYearId },
        },
        update: { teacherId: tId },
        create: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          schoolId: sId,
          academicYearId,
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
   * UPDATE: Change an existing class teacher assignment (by its own ID) —
   * teacher, class, and/or section. Stays within the assignment's
   * original academic year (you don't move an assignment across years,
   * you'd create a new one for the new year instead).
   */
  static async updateClassTeacher(
    schoolId: string | bigint,
    id: string | bigint,
    teacherId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const ctId = BigInt(id);
    const tId = BigInt(teacherId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify the existing assignment belongs to this school
      const existing = await tx.classTeacher.findFirst({
        where: { id: ctId, schoolId: sId },
      });
      if (!existing)
        throw new AppError("Class teacher assignment not found.", 404);

      // 2. Verify teacher belongs to this school
      const teacher = await tx.user.findFirst({
        where: {
          id: tId,
          schoolId: sId,
          deletedAt: null,
          role: { portalType: PortalType.TEACHER },
        },
      });
      if (!teacher) throw new AppError("Teacher not found.", 404);

      // 3. Verify class belongs to this school
      const targetClass = await tx.class.findFirst({
        where: { id: cId, schoolId: sId },
      });
      if (!targetClass) throw new AppError("Class not found.", 404);

      // 4. Verify section belongs to this class
      const section = await tx.section.findFirst({
        where: { id: secId, classId: cId },
      });
      if (!section) throw new AppError("Section not found.", 404);

      // 5. If section is changing, make sure the target section doesn't
      // already have a different class teacher in the SAME year as this
      // assignment (sectionId+academicYearId is @@unique)
      if (secId !== existing.sectionId) {
        const conflict = await tx.classTeacher.findUnique({
          where: {
            sectionId_academicYearId: {
              sectionId: secId,
              academicYearId: existing.academicYearId,
            },
          },
        });
        if (conflict) {
          throw new AppError(
            "Target section already has a class teacher assigned for this academic year.",
            409,
          );
        }
      }

      // 6. Update
      return tx.classTeacher.update({
        where: { id: ctId },
        data: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
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
   * DELETE: Remove the class teacher assigned to a section for the
   * active academic year.
   */
  static async unassignClassTeacher(
    schoolId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const secId = BigInt(sectionId);
    const academicYearId = await getActiveAcademicYearId(sId);

    const existing = await prisma.classTeacher.findUnique({
      where: {
        sectionId_academicYearId: { sectionId: secId, academicYearId },
      },
    });

    if (!existing || existing.schoolId !== sId) {
      throw new AppError(
        "Class teacher not found for this section in the current academic year.",
        404,
      );
    }

    await prisma.classTeacher.delete({ where: { id: existing.id } });

    return { deleted: true };
  }
}
