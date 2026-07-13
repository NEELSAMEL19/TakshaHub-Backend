import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { TeacherAttendanceService } from "./attendance.teachers.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class TeacherAttendanceController {
  static getTeachersForAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      // academicYearId is optional — omitted means "use active year" (default,
      // same as before). When the frontend's "Select Academic Year" dropdown
      // sends a specific year, that year's attendance is returned instead.
      const { date, academicYearId } = req.query as Record<string, string>;
      const data = await TeacherAttendanceService.getTeachersForAttendance(
        schoolId,
        date,
        academicYearId,
      );

      return res.status(200).json({ success: true, count: data.length, data });
    },
  );

  static toggleAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      // No academicYearId here by design — marking/toggling attendance is
      // always scoped to the active year only; past years are view-only.
      const { teacherId, date, status } = req.body;
      const result = await TeacherAttendanceService.upsertAttendance(
        schoolId,
        teacherId,
        date,
        status,
      );

      return res.status(200).json({
        success: true,
        message:
          status === null ? "Attendance unmarked." : "Attendance updated.",
        data: result,
      });
    },
  );
}
