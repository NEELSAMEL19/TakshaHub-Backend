import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/utils/utils.js";
import { OrgRoleService } from "../services/org.role.service.js";
import { AppError } from "../../../common/middlewares/AppError.js";

export class OrgRoleController {
  static createRole = asyncHandler(async (req: Request, res: Response) => {
    // Guaranteed to exist and be an ADMIN because of your middleware pipeline
    const schoolId = req.user!.schoolId;

    if (!schoolId) {
      throw new AppError(
        "Unauthorized: School identification context missing.",
        401,
      );
    }

    const { name, portalType } = req.body;

    const result = await OrgRoleService.createRole({
      schoolId,
      name,
      portalType,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully with default system permissions.",
      data: result,
    });
  });

  static getRolesForDropdown = asyncHandler(
    async (req: Request, res: Response) => {
      const schoolId = req.user?.schoolId;

      if (!schoolId) {
        throw new AppError(
          "Unauthorized: School identification context missing.",
          401,
        );
      }

      const dropdownOptions =
        await OrgRoleService.getRoleDropdownOptions(schoolId);

      return res.status(200).json({
        success: true,
        data: dropdownOptions,
      });
    },
  );

  static getAllRoles = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      throw new AppError("Unauthorized: School identification context missing.", 401);
    }

    const rolesList = await OrgRoleService.getAllRoles(schoolId);

    return res.status(200).json({
      success: true,
      count: rolesList.length,
      data: rolesList,
    });
  });
  
  static updateRole = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { oldName, newName, portalType, permissions } = req.body;

    const result = await OrgRoleService.updateRole(
      schoolId,
      oldName,
      newName,
      portalType,
      permissions,
    );

    return res.status(200).json({
      success: true,
      message: `Role '${oldName}' successfully updated.`,
      data: result,
    });
  });

  static deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError("Unauthorized context.", 401);

    const { name, portalType } = req.body;

    await OrgRoleService.deleteRole(schoolId, name, portalType);

    return res.status(200).json({
      success: true,
      message: `Role '${name}' and its permissions were permanently deleted.`,
    });
  });
}
