import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { getActiveAcademicYearId } from "../../../common/utils/academicYear.js";
import { AttendanceStatus, PortalType } from "@prisma/client";

export class TeacherAttendanceService {
  /**
   * READ: Get roster of all teachers for a school, with attendance
   * status for a given date, within the active academic year.
   * status: null means not marked yet.
   * "Teacher" = User whose Role has portalType TEACHER.
   */
  static async getTeachersForAttendance(
    schoolId: string | bigint,
    date: string,
  ) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);
    const parsedDate = new Date(date);

    const teachers = await prisma.user.findMany({
      where: {
        schoolId: sId,
        role: { portalType: PortalType.TEACHER },
        deletedAt: null,
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });

    // Empty roster is a valid state (e.g. no teachers yet), not an error.
    if (teachers.length === 0) {
      return [];
    }

    const existingAttendance = await prisma.teacherAttendance.findMany({
      where: { schoolId: sId, academicYearId, date: parsedDate },
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
   * TOGGLE: Single-row upsert (or delete when cycling back to unmarked).
   * Scoped to the active academic year.
   */
  static async upsertAttendance(
    schoolId: string | bigint,
    teacherId: string | bigint,
    date: string,
    status: AttendanceStatus | null,
  ) {
    const sId = BigInt(schoolId);
    const academicYearId = await getActiveAcademicYearId(sId);
    const tId = BigInt(teacherId);
    const parsedDate = new Date(date);

    const teacher = await prisma.user.findFirst({
      where: {
        id: tId,
        schoolId: sId,
        role: { portalType: PortalType.TEACHER },
        deletedAt: null,
      },
    });
    if (!teacher) throw new AppError("Teacher not found.", 404);

    if (status === null) {
      await prisma.teacherAttendance.deleteMany({
        where: { teacherId: tId, date: parsedDate, academicYearId },
      });
      return {
        teacherId: tId.toString(),
        date,
        status: null,
      };
    }

    const updated = await prisma.teacherAttendance.upsert({
      where: { teacherId_date: { teacherId: tId, date: parsedDate } },
      update: { status, academicYearId },
      create: {
        teacherId: tId,
        schoolId: sId,
        academicYearId,
        date: parsedDate,
        status,
      },
    });

    return serializeBigInt(updated);
  }
}
