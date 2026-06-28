import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { ManagementClassService } from "../service/managemet.class.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class ManagementClassController {
  static createClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { className, sections } = req.body;
    const result = await ManagementClassService.createClassWithSections(
      schoolId,
      className,
      sections,
    );

    return res.status(201).json({
      success: true,
      message: `Class '${className}' created successfully.`,
      data: result,
    });
  });

  static getAllClasses = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const data = await ManagementClassService.getAllClasses(schoolId);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });

  static getClassById = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { classId } = req.params;
    if (!classId || Array.isArray(classId)) {
      throw new AppError("Invalid class ID.", 400);
    }

    const result = await ManagementClassService.getClassById(schoolId, classId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  });

  static updateClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { oldClassName, newClassName } = req.body;
    const result = await ManagementClassService.updateClass(
      schoolId,
      oldClassName,
      newClassName,
    );

    return res.status(200).json({
      success: true,
      message: `Class '${oldClassName}' renamed to '${newClassName}' successfully.`,
      data: result,
    });
  });

  static deleteClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { className } = req.body;
    await ManagementClassService.deleteClass(schoolId, className);

    return res.status(200).json({
      success: true,
      message: `Class '${className}' deleted successfully.`,
    });
  });
}
