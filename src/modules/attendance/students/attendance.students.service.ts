import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { AttendanceStatus } from "@prisma/client";

export class StudentAttendanceService {
  /**
   * READ: Get students of a class+section to mark attendance
   */
  static async getStudentsForAttendance(
    schoolId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
    date: string,
  ) {
    const sId = BigInt(schoolId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);

    // get all enrolled students in this class+section
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { schoolId: sId, classId: cId, sectionId: secId },
      include: {
        student: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { student: { fullName: "asc" } },
    });

    if (enrollments.length === 0) {
      throw new AppError("No students found for this class and section.", 404);
    }

    // get already marked attendance for this date
    const parsedDate = new Date(date);
    const existingAttendance = await prisma.studentAttendance.findMany({
      where: {
        schoolId: sId,
        classId: cId,
        sectionId: secId,
        date: parsedDate,
      },
    });

    const attendanceMap = new Map(
      existingAttendance.map((a) => [a.studentId.toString(), a.status]),
    );

    const result = enrollments.map((e) => ({
      studentId: e.studentId.toString(),
      fullName: e.student.fullName,
      email: e.student.email,
      status: attendanceMap.get(e.studentId.toString()) ?? null, // null = not marked yet
    }));

    return result;
  }

  /**
   * CREATE: Mark attendance for entire class+section (bulk)
   */
  static async markAttendance(
    schoolId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
    date: string,
    attendance: { studentId: bigint; status: AttendanceStatus }[],
  ) {
    const sId = BigInt(schoolId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);
    const parsedDate = new Date(date);

    await prisma.$transaction(async (tx) => {
      // verify class belongs to school
      const targetClass = await tx.class.findFirst({
        where: { id: cId, schoolId: sId },
      });
      if (!targetClass) throw new AppError("Class not found.", 404);

      // verify section belongs to class
      const section = await tx.section.findFirst({
        where: { id: secId, classId: cId },
      });
      if (!section) throw new AppError("Section not found.", 404);

      // upsert each student attendance record
      await Promise.all(
        attendance.map((a) =>
          tx.studentAttendance.upsert({
            where: {
              studentId_date: {
                studentId: BigInt(a.studentId),
                date: parsedDate,
              },
            },
            update: { status: a.status },
            create: {
              studentId: BigInt(a.studentId),
              classId: cId,
              sectionId: secId,
              schoolId: sId,
              date: parsedDate,
              status: a.status,
            },
          }),
        ),
      );
    });

    return { marked: true, date, total: attendance.length };
  }

  /**
   * UPDATE: Update a single student attendance record
   */
  static async updateAttendance(
    schoolId: string | bigint,
    studentId: string | bigint,
    date: string,
    status: AttendanceStatus,
  ) {
    const sId = BigInt(schoolId);
    const stId = BigInt(studentId);
    const parsedDate = new Date(date);

    const existing = await prisma.studentAttendance.findUnique({
      where: { studentId_date: { studentId: stId, date: parsedDate } },
    });

    if (!existing || existing.schoolId !== sId) {
      throw new AppError("Attendance record not found.", 404);
    }

    const updated = await prisma.studentAttendance.update({
      where: { studentId_date: { studentId: stId, date: parsedDate } },
      data: { status },
    });

    return serializeBigInt(updated);
  }

  /**
   * READ: Get attendance report for a class+section by date
   */
  static async getAttendanceByDate(
    schoolId: string | bigint,
    classId: string | bigint,
    sectionId: string | bigint,
    date: string,
  ) {
    const sId = BigInt(schoolId);
    const cId = BigInt(classId);
    const secId = BigInt(sectionId);
    const parsedDate = new Date(date);

    const records = await prisma.studentAttendance.findMany({
      where: { schoolId: sId, classId: cId, sectionId: secId, date: parsedDate },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { student: { fullName: "asc" } },
    });

    return serializeBigInt(records);
  }
}