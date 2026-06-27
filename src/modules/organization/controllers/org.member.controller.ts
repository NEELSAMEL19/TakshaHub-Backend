import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { OrgMemberService } from "../services/org.member.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class OrgMemberController {
  static addMember = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const data = await OrgMemberService.addMember(schoolId, req.body);
    return res.status(201).json({
      success: true,
      message: `Member added successfully as '${req.body.roleName}' (${req.body.portalType}).`,
      data,
    });
  });

  static getAllMembers = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const data = await OrgMemberService.getAllMembers(schoolId);
    return res.status(200).json({ success: true, count: data.length, data });
  });

  static getMemberById = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const { id } = req.params;
    const data = await OrgMemberService.getMemberById(
      schoolId,
      Array.isArray(id) ? id[0] : id,
    );
    return res.status(200).json({ success: true, data });
  });

  static updateMember = asyncHandler(async (req: Request, res: Response) => {
    console.log("req.body", req.body); // 👈 add this

    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const { id, ...updateFields } = req.body;
    console.log("id", id); // 👈 add this

    const data = await OrgMemberService.updateMember(
      schoolId,
      id,
      updateFields,
    );

    return res.status(200).json({
      success: true,
      message: "Member updated successfully.",
      data,
    });
  });

  static deleteMember = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const requestingUserId = req.user?.id ? BigInt(req.user.id) : undefined; // ✅ add this

    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    if (!requestingUserId)
      throw new AppError("Unauthorized: User context missing.", 401);

    await OrgMemberService.deleteMember(
      schoolId,
      req.body.email,
      requestingUserId,
    ); // ✅ pass it

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully.",
    });
  });
}
