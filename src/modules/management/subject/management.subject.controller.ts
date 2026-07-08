import type { Request, Response } from "express";
import { asString, asyncHandler } from "../../../common/utils/utils.js";
import { ManagementSubjectService } from "./management.subject.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";


export class ManagementSubjectController {
  static createSubject = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { name } = req.body;
    const result = await ManagementSubjectService.createSubject(schoolId, name);

    return res.status(201).json({
      success: true,
      message: `Subject '${name}' created successfully.`,
      data: result,
    });
  });

  static getAllSubjects = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const data = await ManagementSubjectService.getAllSubjects(schoolId);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  });

  static getSubjectById = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const id = asString(req.params.id);
    if (!id) throw new AppError("Subject id is required.", 400);

    const data = await ManagementSubjectService.getSubjectById(schoolId, id);

    return res.status(200).json({
      success: true,
      data,
    });
  });

  static getSubjectsForDropdown = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId) throw new AppError("Unauthorized context.", 401);

      const data =
        await ManagementSubjectService.getSubjectsForDropdown(schoolId);

      return res.status(200).json({
        success: true,
        data,
      });
    },
  );

  static updateSubject = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { oldName, newName } = req.body;
    const result = await ManagementSubjectService.updateSubject(
      schoolId,
      oldName,
      newName,
    );

    return res.status(200).json({
      success: true,
      message: `Subject '${oldName}' renamed to '${newName}' successfully.`,
      data: result,
    });
  });

  static deleteSubject = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { name } = req.body;
    await ManagementSubjectService.deleteSubject(schoolId, name);

    return res.status(200).json({
      success: true,
      message: `Subject '${name}' deleted successfully.`,
    });
  });
}
