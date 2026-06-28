import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { TeacherAttendanceService } from "./attendance.teachers.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class TeacherAttendanceController {
  static getTeachersForAttendance = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { date } = req.query as Record<string, string>;
    const data = await TeacherAttendanceService.getTeachersForAttendance(schoolId, date);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });

  static markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { date, attendance } = req.body;
    const result = await TeacherAttendanceService.markAttendance(schoolId, date, attendance);

    return res.status(201).json({
      success: true,
      message: `Attendance marked for ${result.total} teachers.`,
      data: result,
    });
  });

  static updateAttendance = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { teacherId, date, status } = req.body;
    const result = await TeacherAttendanceService.updateAttendance(
      schoolId, teacherId, date, status,
    );

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      data: result,
    });
  });

  static getAttendanceByDate = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { date } = req.query as Record<string, string>;
    const data = await TeacherAttendanceService.getAttendanceByDate(schoolId, date);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });
}