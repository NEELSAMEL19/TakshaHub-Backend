import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType, type Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

export class ManagementSubjectTeacherService {
  /**
   * Resolve the currently active academic year for a school.
   * Assignments are scoped per-year, so any create/lookup that doesn't
   * receive an explicit academicYearId falls back to this.
   */
  private static async getActiveAcademicYearId(
    client: TxClient | typeof prisma,
    schoolId: bigint,
  ): Promise<bigint> {
    const activeYear = await client.academicYear.findFirst({
      where: { schoolId, isActive: true },
      select: { id: true },
    });
    if (!activeYear) {
      throw new AppError("No active academic year set for this school.", 409);
    }
    return activeYear.id;
  }

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
   * READ: Get a single subject-teacher assignment by its own ID
   */
  static async getSubjectTeacherById(
    schoolId: string | bigint,
    id: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const taId = BigInt(id);

    const assignment = await prisma.teacherAssignment.findFirst({
      where: { id: taId, schoolId: sId },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    if (!assignment) throw new AppError("Assignment not found.", 404);

    return serializeBigInt(assignment);
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
   * CREATE: Assign a teacher to teach a subject for a class + section,
   * scoped to the school's active academic year.
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

      // 5. Resolve the active academic year for this school
      const academicYearId = await this.getActiveAcademicYearId(tx, sId);

      // 6. Prevent duplicate (teacher, class, section, subject, year) assignment
      const alreadyAssigned = await tx.teacherAssignment.findUnique({
        where: {
          teacherId_classId_sectionId_subjectId_academicYearId: {
            teacherId: tId,
            classId: cId,
            sectionId: secId,
            subjectId: subId,
            academicYearId,
          },
        },
      });
      if (alreadyAssigned) {
        throw new AppError(
          "Teacher is already assigned to this class, section and subject for the current academic year.",
          409,
        );
      }

      // 7. Create assignment
      return tx.teacherAssignment.create({
        data: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          subjectId: subId,
          schoolId: sId,
          academicYearId,
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
   * UPDATE: Change an existing subject-teacher assignment (by its own ID) —
   * teacher, class, section, and/or subject. The assignment's academic
   * year is left untouched — editing an assignment doesn't move it to a
   * different year.
   */
  static async updateSubjectTeacher(
    schoolId: string | bigint,
    id: string | bigint,
    teacherId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
    subjectId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const taId = BigInt(id);
    const tId = BigInt(teacherId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);
    const subId = BigInt(subjectId);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify the existing assignment belongs to this school
      const existing = await tx.teacherAssignment.findFirst({
        where: { id: taId, schoolId: sId },
      });
      if (!existing) throw new AppError("Assignment not found.", 404);

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

      // 5. Verify subject belongs to this school
      const subject = await tx.subject.findFirst({
        where: { id: subId, schoolId: sId },
      });
      if (!subject) throw new AppError("Subject not found.", 404);

      // 6. If the composite key is changing, make sure it doesn't collide
      // with a different existing assignment in the same academic year
      const keyChanged =
        tId !== existing.teacherId ||
        cId !== existing.classId ||
        secId !== existing.sectionId ||
        subId !== existing.subjectId;

      if (keyChanged) {
        const conflict = await tx.teacherAssignment.findUnique({
          where: {
            teacherId_classId_sectionId_subjectId_academicYearId: {
              teacherId: tId,
              classId: cId,
              sectionId: secId,
              subjectId: subId,
              academicYearId: existing.academicYearId,
            },
          },
        });
        if (conflict) {
          throw new AppError(
            "Teacher is already assigned to this class, section and subject for this academic year.",
            409,
          );
        }
      }

      // 7. Update (academicYearId intentionally left unchanged)
      return tx.teacherAssignment.update({
        where: { id: taId },
        data: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          subjectId: subId,
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
   * DELETE: Remove a subject-teacher assignment for the school's active
   * academic year.
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

    const academicYearId = await this.getActiveAcademicYearId(prisma, sId);

    const assignment = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_classId_sectionId_subjectId_academicYearId: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          subjectId: subId,
          academicYearId,
        },
      },
    });

    if (!assignment || assignment.schoolId !== sId) {
      throw new AppError("Assignment not found.", 404);
    }

    await prisma.teacherAssignment.delete({
      where: {
        teacherId_classId_sectionId_subjectId_academicYearId: {
          teacherId: tId,
          classId: cId,
          sectionId: secId,
          subjectId: subId,
          academicYearId,
        },
      },
    });

    return { deleted: true };
  }
}
