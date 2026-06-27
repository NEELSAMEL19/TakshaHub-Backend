// modules/permissions/permission.controller.ts
import type { Request, Response } from "express";
import { getPermissionRegistry } from "./permission.registry.js";
import type { PortalType } from "@prisma/client";

export const permissionController = {
  getTemplate(req: Request, res: Response) {
    const portalType = req.query.portalType as PortalType | undefined;

    if (!portalType) {
      return res.status(400).json({ code: 400, message: "portalType query param is required" });
    }

    const template = getPermissionRegistry(portalType);

    if (template.length === 0) {
      return res.status(200).json({
        code: 200,
        message: "No permission template for this portal type.",
        data: [],
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Permission template fetched successfully.",
      data: template,
    });
  },
};