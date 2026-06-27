// sidebar.controller.ts
import type { Request, Response } from "express";
import { sidebarService } from "./sidebar.service.js";
import type { SidebarUser } from "./sidebar.service.js";

// ✅ Single controller method — role type handled inside service
export const sidebarController = {
  async getSidebar(req: Request, res: Response) {
    try {
      const user = req.user as SidebarUser | undefined;
      console.log("req.user →", req.user); // add this
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
      return res
        .status(500)
        .json({ code: 500, message: "Failed to fetch sidebar" });
    }
  },
};
