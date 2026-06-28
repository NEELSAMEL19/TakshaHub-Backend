import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { AttendanceStatus, PortalType } from "@prisma/client";

export class TeacherAttendanceService {
  /**
   * READ: Get all teachers to mark attendance
   */
  static async getTeachersForAttendance(
    schoolId: string | bigint,
    date: string,
  ) {
    const sId = BigInt(schoolId);
    const parsedDate = new Date(date);

    const teachers = await prisma.user.findMany({
      where: {
        schoolId: sId,
        isActive: true,
        deletedAt: null,
        role: { portalType: PortalType.TEACHER },
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });

    if (teachers.length === 0) {
      throw new AppError("No teachers found.", 404);
    }

    const existingAttendance = await prisma.teacherAttendance.findMany({
      where: { schoolId: sId, date: parsedDate },
    });

    const attendanceMap = new Map(
      existingAttendance.map((a) => [a.teacherId.toString(), a.status]),
    );

    return teachers.map((t) => ({
      teacherId: t.id.toString(),
      fullName: t.fullName,
      email: t.email,
      status: attendanceMap.get(t.id.toString()) ?? null,
    }));
  }

  /**
   * CREATE: Mark attendance for all teachers (bulk)
   */
  static async markAttendance(
    schoolId: string | bigint,
    date: string,
    attendance: { teacherId: bigint; status: AttendanceStatus }[],
  ) {
    const sId = BigInt(schoolId);
    const parsedDate = new Date(date);

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        attendance.map((a) =>
          tx.teacherAttendance.upsert({
            where: {
              teacherId_date: {
                teacherId: BigInt(a.teacherId),
                date: parsedDate,
              },
            },
            update: { status: a.status },
            create: {
              teacherId: BigInt(a.teacherId),
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
   * UPDATE: Update a single teacher attendance record
   */
  static async updateAttendance(
    schoolId: string | bigint,
    teacherId: string | bigint,
    date: string,
    status: AttendanceStatus,
  ) {
    const sId = BigInt(schoolId);
    const tId = BigInt(teacherId);
    const parsedDate = new Date(date);

    const existing = await prisma.teacherAttendance.findUnique({
      where: { teacherId_date: { teacherId: tId, date: parsedDate } },
    });

    if (!existing || existing.schoolId !== sId) {
      throw new AppError("Attendance record not found.", 404);
    }

    const updated = await prisma.teacherAttendance.update({
      where: { teacherId_date: { teacherId: tId, date: parsedDate } },
      data: { status },
    });

    return serializeBigInt(updated);
  }

  /**
   * READ: Get attendance report by date
   */
  static async getAttendanceByDate(schoolId: string | bigint, date: string) {
    const sId = BigInt(schoolId);
    const parsedDate = new Date(date);

    const records = await prisma.teacherAttendance.findMany({
      where: { schoolId: sId, date: parsedDate },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { teacher: { fullName: "asc" } },
    });

    return serializeBigInt(records);
  }
}