import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { OrgClassService } from "../services/org.class.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class OrgClassController {
  static createClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { className, sections } = req.body;
    const result = await OrgClassService.createClassWithSections(schoolId, className, sections);

    return res.status(201).json({
      success: true,
      message: `Class '${className}' with initial sections created successfully.`,
      data: result,
    });
  });

  static getAllClasses = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const data = await OrgClassService.getAllClasses(schoolId);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });

  static updateClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { oldClassName, newClassName } = req.body;
    const result = await OrgClassService.updateClass(schoolId, oldClassName, newClassName);

    return res.status(200).json({
      success: true,
      message: `Class structural reference updated successfully.`,
      data: result,
    });
  });

  static deleteClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { className } = req.body;
    await OrgClassService.deleteClass(schoolId, className);

    return res.status(200).json({
      success: true,
      message: `Class configuration blueprint permanently purged from system memory.`,
    });
  });
}