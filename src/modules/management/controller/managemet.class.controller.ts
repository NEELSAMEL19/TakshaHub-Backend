import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { ManagementClassService } from "../service/management.class.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class ManagementClassController {
  static createClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { className, sections } = req.body;
    if (!className || typeof className !== "string") {
      throw new AppError("Class name is required.", 400);
    }

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

  static getClassesDropdown = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      const data = await ManagementClassService.getClassesForDropdown(schoolId);

      return res.status(200).json({
        success: true,
        data,
      });
    },
  );

  /**
   * Lightweight sections list scoped to a class, for the cascading
   * dropdown on the enrollment form. Route param: classId.
   */
  static getSectionsDropdown = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      const { classId } = req.params;
      if (!classId || Array.isArray(classId)) {
        throw new AppError("Invalid class ID.", 400);
      }

      const data = await ManagementClassService.getSectionsForDropdown(
        schoolId,
        classId,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    },
  );

  static updateClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { classId } = req.params;
    if (!classId || Array.isArray(classId)) {
      throw new AppError("Invalid class ID.", 400);
    }

    const { className, sections } = req.body;
    if (!className || typeof className !== "string") {
      throw new AppError("Class name is required.", 400);
    }

    const result = await ManagementClassService.updateClassWithSections(
      schoolId,
      classId,
      className,
      sections,
    );

    return res.status(200).json({
      success: true,
      message: `Class updated successfully.`,
      data: result,
    });
  });

  static deleteClass = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { classId } = req.params;
    if (!classId || Array.isArray(classId)) {
      throw new AppError("Invalid class ID.", 400);
    }

    await ManagementClassService.deleteClass(schoolId, classId);

    return res.status(200).json({
      success: true,
      message: `Class deleted successfully.`,
    });
  });
}
