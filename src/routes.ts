import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import sidebarRoutes from "./modules/sidebar/sidebar.routes.js";
import organizationRoutes from "./modules/organization/org.routes.js";
import permissionRoutes from "./modules/permissions/permission.routes.js";
import managementRoutes from "./modules/management/management.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/sidebar", sidebarRoutes);
router.use("/permissions", permissionRoutes);
router.use("/organization", organizationRoutes);
router.use("/management", managementRoutes);

export default router;
