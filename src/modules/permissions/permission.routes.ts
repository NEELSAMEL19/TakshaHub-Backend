// modules/permissions/permission.routes.ts
import { Router } from "express";
import { permissionController } from "./permission.controller.js";
import { authMiddleware, isAdmin } from "../../common/middlewares/auth.js";

const router = Router();

// GET /permissions/template?portalType=STAFF
router.get("/template", authMiddleware, isAdmin, permissionController.getTemplate);

export default router;