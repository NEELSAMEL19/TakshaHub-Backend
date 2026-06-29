import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType } from "@prisma/client";

export class ManagementStudentService {
  /**
   * READ: Get all users with portalType STUDENT not yet enrolled in any class
   */
  static async getAvailableStudents(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const students = await prisma.user.findMany({
      where: {
        schoolId: sId,
        isActive: true,
        deletedAt: null,
        role: { portalType: PortalType.STUDENT },
        enrollments: { none: {} }, // ✅ not enrolled anywhere yet
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

    return serializeBigInt(students);
  }

  /**
   * READ: Get all enrolled students with their class and section
   */
  static async getEnrolledStudents(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { schoolId: sId },
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
   * CREATE: Enroll a student into a class and section
   */
  static async enrollStudent(
    schoolId: string | bigint,
    studentId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
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

      // 4. Check already enrolled in this class
      const alreadyEnrolled = await tx.studentEnrollment.findUnique({
        where: { studentId_classId: { studentId: stId, classId: cId } },
      });
      if (alreadyEnrolled) {
        throw new AppError("Student is already enrolled in this class.", 409);
      }

      // 5. Enroll
      return tx.studentEnrollment.create({
        data: {
          studentId: stId,
          classId: cId,
          sectionId: secId,
          schoolId: sId,
        },
      });
    });

    return serializeBigInt(
      await prisma.studentEnrollment.findUnique({
        where: { studentId_classId: { studentId: stId, classId: cId } },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      }),
    );
  }

  /**
   * DELETE: Remove a student's enrollment
   */
  static async unenrollStudent(
    schoolId: string | bigint,
    studentId: string | bigint,
    classId: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const stId = BigInt(studentId);
    const cId = BigInt(classId);

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { studentId_classId: { studentId: stId, classId: cId } },
    });

    if (!enrollment || enrollment.schoolId !== sId) {
      throw new AppError("Enrollment not found.", 404);
    }

    await prisma.studentEnrollment.delete({
      where: { studentId_classId: { studentId: stId, classId: cId } },
    });

    return { deleted: true };
  }
}
