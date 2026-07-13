import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import {
  getActiveAcademicYearId,
  resolveAcademicYearId,
} from "../../../common/utils/academicYear.js";
import { AttendanceStatus, PortalType } from "@prisma/client";

export class TeacherAttendanceService {
  /**
   * READ: Get the list of teachers for a school, with attendance status
   * for a given date, within a given academic year. status: null means
   * not marked yet.
   *
   * Unlike students, TeacherAttendance has no classId/sectionId — a
   * teacher's attendance is a single school-wide record per day, not
   * scoped to a class/section (that scoping lives separately, on
   * TeacherAssignment / ClassTeacher). So there's no classId/sectionId
   * filter here; this always returns the full teacher roster for the
   * school.
   *
   * academicYearId is optional — when omitted, defaults to the school's
   * currently active year (same behavior as before). When provided
   * (e.g. from a "Select Academic Year" dropdown), attendance is read
   * from that year instead, so past/inactive years can be viewed. This
   * method is READ-ONLY with respect to year choice — marking/toggling
   * attendance is still restricted to the active year only, in
   * upsertAttendance below.
   */
  static async getTeachersForAttendance(
    schoolId: string | bigint,
    date: string,
    academicYearId?: string | bigint,
  ) {
    const sId = BigInt(schoolId);
    const ayId = await resolveAcademicYearId(
      sId,
      academicYearId ? BigInt(academicYearId) : undefined,
    );
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

    // Empty roster is a valid state (e.g. no teachers yet), not an error.
    if (teachers.length === 0) {
      return [];
    }

    const existingAttendance = await prisma.teacherAttendance.findMany({
      where: {
        schoolId: sId,
        academicYearId: ayId,
        date: parsedDate,
      },
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
   * The only write operation — fires per click on the status circle.
   * Scoped to the active academic year — attendance can't be marked
   * against a stale/inactive year. Deliberately does NOT accept an
   * academicYearId override: past/inactive years are view-only, so
   * historical attendance can't be accidentally edited.
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
        isActive: true,
        deletedAt: null,
        role: { portalType: PortalType.TEACHER },
      },
    });
    if (!teacher) {
      throw new AppError(
        "Teacher not found in this school, or user is not a teacher.",
        404,
      );
    }

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
