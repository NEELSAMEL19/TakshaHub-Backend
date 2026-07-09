import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { getActiveAcademicYearId } from "../../../common/utils/academicYear.js";
import { PortalType } from "@prisma/client";

export class ManagementStudentService {
  /**
   * READ: Get all users with portalType STUDENT not yet enrolled in any
   * class FOR THE ACTIVE ACADEMIC YEAR. A student enrolled last year but
   * not yet re-enrolled this year now correctly shows as "available" —
   * otherwise they'd be permanently invisible to the enroll flow once
   * this year's roster rolls over.
   */
  static async getAvailableStudents(schoolId: string | bigint) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);

    const students = await prisma.user.findMany({
      where: {
        schoolId: sId,
        isActive: true,
        deletedAt: null,
        role: { portalType: PortalType.STUDENT },
        enrollments: { none: { academicYearId } }, // ✅ not enrolled THIS year
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { fullName: "asc" },
    });

    const data = students.map((s) => ({
      label: s.fullName,
      value: s.id,
    }));

    return serializeBigInt(data);
  }

  /**
   * READ: Get all enrolled students with their class and section, for
   * the active academic year.
   */
  static async getEnrolledStudents(schoolId: string | bigint) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { schoolId: sId, academicYearId },
      include: {
        student: {
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

    return serializeBigInt(enrollments);
  }

  /**
   * READ: Get enrollment(s) for a single student by student ID.
   * NOT year-scoped — returns full enrollment history across all years,
   * since this is used for a student's record view, not "current class".
   * Use getEnrolledStudents (or filter client-side) for "this year only".
   */
  static async getEnrolledStudentById(
    schoolId: string | bigint,
    studentId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const stId = BigInt(studentId);

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { schoolId: sId, studentId: stId },
      include: {
        student: {
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
        academicYear: { select: { id: true, label: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!enrollments.length) {
      throw new AppError("Enrollment not found for this student.", 404);
    }

    return serializeBigInt(enrollments);
  }

  /**
   * CREATE: Enroll a student into a class and section, for the active
   * academic year.
   */
  static async enrollStudent(
    schoolId: string | bigint,
    studentId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);
    const stId = BigInt(studentId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);

    await prisma.$transaction(async (tx) => {
      // 1. Verify student belongs to this school and is a STUDENT
      const student = await tx.user.findFirst({
        where: {
          id: stId,
          schoolId: sId,
          deletedAt: null,
          role: { portalType: PortalType.STUDENT },
        },
      });
      if (!student) throw new AppError("Student not found.", 404);

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

      // 4. Check already enrolled in this class FOR THIS YEAR
      const alreadyEnrolled = await tx.studentEnrollment.findUnique({
        where: {
          studentId_classId_academicYearId: {
            studentId: stId,
            classId: cId,
            academicYearId,
          },
        },
      });
      if (alreadyEnrolled) {
        throw new AppError(
          "Student is already enrolled in this class for the current academic year.",
          409,
        );
      }

      // 5. Enroll
      return tx.studentEnrollment.create({
        data: {
          studentId: stId,
          classId: cId,
          sectionId: secId,
          schoolId: sId,
          academicYearId,
        },
      });
    });

    return serializeBigInt(
      await prisma.studentEnrollment.findUnique({
        where: {
          studentId_classId_academicYearId: {
            studentId: stId,
            classId: cId,
            academicYearId,
          },
        },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      }),
    );
  }

  /**
   * UPDATE: Change a student's class and/or section, within the active
   * academic year. currentClassId identifies which of the student's
   * (possibly multiple, across years) enrollment rows to update — this
   * assumes the caller is updating THIS year's enrollment.
   */
  static async updateStudentEnrollment(
    schoolId: string | bigint,
    studentId: string | bigint,
    currentClassId: string | bigint,
    newClassId: string | bigint,
    newSectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);
    const stId = BigInt(studentId);
    const currentCId = BigInt(currentClassId);
    const newCId = BigInt(newClassId);
    const newSecId = BigInt(newSectionId);

    await prisma.$transaction(async (tx) => {
      // 1. Verify the existing enrollment belongs to this school + year
      const existingEnrollment = await tx.studentEnrollment.findUnique({
        where: {
          studentId_classId_academicYearId: {
            studentId: stId,
            classId: currentCId,
            academicYearId,
          },
        },
      });
      if (!existingEnrollment || existingEnrollment.schoolId !== sId) {
        throw new AppError(
          "Enrollment not found for the current academic year.",
          404,
        );
      }

      // 2. Verify new class belongs to this school
      const targetClass = await tx.class.findFirst({
        where: { id: newCId, schoolId: sId },
      });
      if (!targetClass) throw new AppError("Class not found.", 404);

      // 3. Verify new section belongs to the new class
      const section = await tx.section.findFirst({
        where: { id: newSecId, classId: newCId },
      });
      if (!section) throw new AppError("Section not found.", 404);

      // 4. If class is changing, make sure student isn't already
      // enrolled there THIS year
      if (newCId !== currentCId) {
        const conflict = await tx.studentEnrollment.findUnique({
          where: {
            studentId_classId_academicYearId: {
              studentId: stId,
              classId: newCId,
              academicYearId,
            },
          },
        });
        if (conflict) {
          throw new AppError(
            "Student is already enrolled in the target class for the current academic year.",
            409,
          );
        }
      }

      // 5. Update — classId is part of the composite key, so this changes
      // which row is uniquely identified; sectionId is a plain field update.
      return tx.studentEnrollment.update({
        where: {
          studentId_classId_academicYearId: {
            studentId: stId,
            classId: currentCId,
            academicYearId,
          },
        },
        data: {
          classId: newCId,
          sectionId: newSecId,
        },
      });
    });

    return serializeBigInt(
      await prisma.studentEnrollment.findUnique({
        where: {
          studentId_classId_academicYearId: {
            studentId: stId,
            classId: newCId,
            academicYearId,
          },
        },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      }),
    );
  }

  /**
   * DELETE: Remove a student's enrollment for the active academic year.
   */
  static async unenrollStudent(
    schoolId: string | bigint,
    studentId: string | bigint,
    classId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);
    const stId = BigInt(studentId);
    const cId = BigInt(classId);

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: {
        studentId_classId_academicYearId: {
          studentId: stId,
          classId: cId,
          academicYearId,
        },
      },
    });

    if (!enrollment || enrollment.schoolId !== sId) {
      throw new AppError(
        "Enrollment not found for the current academic year.",
        404,
      );
    }

    await prisma.studentEnrollment.delete({
      where: {
        studentId_classId_academicYearId: {
          studentId: stId,
          classId: cId,
          academicYearId,
        },
      },
    });

    return { deleted: true };
  }
}
