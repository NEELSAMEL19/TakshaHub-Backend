import express from "express";
import { sidebarController } from "./sidebar.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.js";

const router = express.Router();

// Admin / Staff sidebar (permission-gated)
router.get("/", authMiddleware, sidebarController.getSidebar);

// Teacher sidebar (no permissions)
router.get("/teacher", authMiddleware, sidebarController.getTeacherSidebar);

// Student sidebar (no permissions)
router.get("/student", authMiddleware, sidebarController.getStudentSidebar);

export default router;
