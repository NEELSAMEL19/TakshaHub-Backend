import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType } from "@prisma/client";

export class ManagementSubjectTeacherService {
  /**
   * READ: Get all subject-teacher assignments for a school
   */
  static async getSubjectTeachers(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const assignments = await prisma.teacherAssignment.findMany({
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
        subject: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeBigInt(assignments);
  }

  /**
   * READ: Get all subject assignments for a specific section
   */
  static async getSubjectTeachersBySection(
    schoolId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const secId = BigInt(sectionId);

    const assignments = await prisma.teacherAssignment.findMany({
      where: { schoolId: sId, sectionId: secId },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
      orderBy: { subject: { name: "asc" } },
    });

    return serializeBigInt(assignments);
  }

  /**
   * CREATE: Assign a teacher to teach a subject for a class + section
   */
  static async assignSubjectTeacher(
    schoolId: string | bigint,
    teacherId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
    subjectId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const tId = BigInt(teacherId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);
    const subId = BigInt(subjectId);

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

      // 4. Verify subject belongs to this school
      const subject = await tx.subject.findFirst({
        where: { id: subId, schoolId: sId },
      });
      if (!subject) throw new AppError("Subject not found.", 404);

      // 5. Prevent duplicate (teacher, class, section, subject) assignment
      const alreadyAssigned = await tx.teacherAssignment.findUnique({
        where: {
          teacherId_classId_sectionId_subjectId: {
            teacherId: tId,
            classId: cId,
            sectionId: secId,
            subjectId: subId,
          },
        },
      });
      if (alreadyAssigned) {
        throw new AppError(
          "Teacher is already assigned to this class, section and subject.",
          409,
        );
      }

      // 6. Create assignment
      return tx.teacherAssignment.create({
        data: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          subjectId: subId,
          schoolId: sId,
        },
        include: {
          teacher: { select: { id: true, fullName: true, email: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
        },
      });
    });

    return serializeBigInt(result);
  }

  /**
   * DELETE: Remove a subject-teacher assignment
   */
  static async unassignSubjectTeacher(
    schoolId: string | bigint,
    teacherId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
    subjectId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const tId = BigInt(teacherId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);
    const subId = BigInt(subjectId);

    const assignment = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_classId_sectionId_subjectId: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          subjectId: subId,
        },
      },
    });

    if (!assignment || assignment.schoolId !== sId) {
      throw new AppError("Assignment not found.", 404);
    }

    await prisma.teacherAssignment.delete({
      where: {
        teacherId_classId_sectionId_subjectId: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          subjectId: subId,
        },
      },
    });

    return { deleted: true };
  }
}
