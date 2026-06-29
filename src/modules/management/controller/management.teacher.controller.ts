import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { ManagementTeacherService } from "../service/management.teacher.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class ManagementTeacherController {
  static getAvailableTeachers = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const data = await ManagementTeacherService.getAvailableTeachers(schoolId);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });

  static getAssignedTeachers = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const data = await ManagementTeacherService.getAssignedTeachers(schoolId);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });

  static getTeacherById = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const teacherId = req.params.teacherId as string;
    const data = await ManagementTeacherService.getTeacherById(schoolId, teacherId);

    return res.status(200).json({
      success: true,
      data,
    });
  });

  static assignTeacher = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { teacherId, classId, sectionId, subjectId } = req.body;
    const result = await ManagementTeacherService.assignTeacher(
      schoolId,
      teacherId,
      classId,
      sectionId,
      subjectId,
    );

    return res.status(201).json({
      success: true,
      message: "Teacher assigned successfully.",
      data: result,
    });
  });

  static unassignTeacher = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { teacherId, classId, sectionId, subjectId } = req.body;
    await ManagementTeacherService.unassignTeacher(
      schoolId,
      teacherId,
      classId,
      sectionId,
      subjectId,
    );

    return res.status(200).json({
      success: true,
      message: "Teacher unassigned successfully.",
    });
  });
}