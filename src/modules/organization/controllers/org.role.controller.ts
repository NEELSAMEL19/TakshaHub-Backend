// org.role.controller.ts
import prisma from "../../../config/prisma.js";
import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { OrgRoleService } from "../services/org.role.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { PortalType } from "@prisma/client";

export class OrgRoleController {
  static createRole = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const updatedBy = req.user?.id ? BigInt(req.user.id) : undefined;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const { name, portalType, permissions } = req.body;
    const result = await OrgRoleService.createRole({
      schoolId,
      name,
      portalType,
      permissions,
      updatedBy,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: result,
    });
  });

  static updateRole = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const updatedBy = req.user?.id ? BigInt(req.user.id) : undefined;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const { oldName, newName, oldPortalType, newPortalType, permissions } =
      req.body;
    const result = await OrgRoleService.updateRole(
      schoolId,
      oldName,
      newName,
      oldPortalType,
      newPortalType,
      updatedBy,
      permissions,
    );

    return res.status(200).json({
      success: true,
      message: `Role '${oldName}' updated successfully.`,
      data: result,
    });
  });

  static getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const { id } = req.params;
    const data = await OrgRoleService.getRoleById(
      schoolId,
      Array.isArray(id) ? id[0] : id,
    );

    return res.status(200).json({ success: true, data });
  });

  static getRolesByPortalType = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;
      if (!schoolId)
        throw new AppError("Unauthorized: School context missing.", 401);

      const portalType = req.query.portalType as PortalType | undefined;
      const data = await OrgRoleService.getRolesByPortalType(
        schoolId,
        portalType,
      );
      return res.status(200).json({ success: true, data });
    },
  );

  static getAllRoles = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const data = await OrgRoleService.getAllRoles(schoolId);
    return res.status(200).json({ success: true, count: data.length, data });
  });

  static deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId)
      throw new AppError("Unauthorized: School context missing.", 401);

    const { name, portalType } = req.body;
    await OrgRoleService.deleteRole(schoolId, name, portalType);

    return res.status(200).json({
      success: true,
      message: `Role '${name}' deleted successfully.`,
    });
  });
}
