import type { Request, Response } from "express";
import { sidebarService } from "./sidebar.service.js";
import type { SidebarUser } from "./sidebar.service.js";
import { buildSidebarDirect } from "./sidebar.builder.js";
import type { PortalType } from "@prisma/client";

export const sidebarController = {
  // ─── Admin / Staff sidebar (permission-gated) ───

  async getSidebar(req: Request, res: Response) {
    try {
      const user = req.user as SidebarUser | undefined;

      if (!user) {
        return res.status(401).json({ code: 401, message: "Unauthorized" });
      }

      const data = await sidebarService.getSidebar(user);

      return res.status(200).json({
        code: 200,
        message: "Request processed successfully",
        data,
      });
    } catch {
      return res.status(500).json({ code: 500, message: "Failed to fetch sidebar" });
    }
  },

  // ─── Teacher sidebar (no permissions) ───

  async getTeacherSidebar(req: Request, res: Response) {
    try {
      const role = req.user?.role as PortalType | undefined;

      if (!role) {
        return res.status(401).json({ code: 401, message: "Unauthorized" });
      }

      const data = buildSidebarDirect("TEACHER");

      return res.status(200).json({
        code: 200,
        message: "Request processed successfully",
        data,
      });
    } catch {
      return res.status(500).json({ code: 500, message: "Failed to fetch teacher sidebar" });
    }
  },

  // ─── Student sidebar (no permissions) ───

  async getStudentSidebar(req: Request, res: Response) {
    try {
      const role = req.user?.role as PortalType | undefined;

      if (!role) {
        return res.status(401).json({ code: 401, message: "Unauthorized" });
      }

      const data = buildSidebarDirect("STUDENT");

      return res.status(200).json({
        code: 200,
        message: "Request processed successfully",
        data,
      });
    } catch {
      return res.status(500).json({ code: 500, message: "Failed to fetch student sidebar" });
    }
  },
};
