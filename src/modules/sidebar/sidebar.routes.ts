// sidebar.routes.ts
import express from "express";
import { sidebarController } from "./sidebar.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.js";

const router = express.Router();

router.get("/", authMiddleware, sidebarController.getSidebar);

export default router;
