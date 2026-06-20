import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { OrgMemberService } from "../services/org.member.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class OrgMemberController {
  static addMember = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized context scope missing.", 401);

    const data = await OrgMemberService.addMember(schoolId, req.body);
    return res.status(201).json({
      success: true,
      message: `${req.body.portalType} member successfully configured into organizational pool.`,
      data,
    });
  });

  static getAllMembers = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized context scope missing.", 401);

    const data = await OrgMemberService.getAllMembers(schoolId);
    return res.status(200).json({ success: true, count: data.length, data });
  });

  static updateMember = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized context scope missing.", 401);

    const { email, ...updateFields } = req.body;
    const data = await OrgMemberService.updateMember(
      schoolId,
      email,
      updateFields,
    );

    return res.status(200).json({
      success: true,
      message:
        "Member credentials and profile configurations updated successfully.",
      data,
    });
  });

  static deleteMember = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized context scope missing.", 401);

    await OrgMemberService.deleteMember(schoolId, req.body.email);
    return res.status(200).json({
      success: true,
      message: "User account safely cleared from system registries.",
    });
  });
  
}
