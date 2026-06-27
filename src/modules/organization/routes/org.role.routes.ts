import { Router } from "express";
import { OrgRoleController } from "../controllers/org.role.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  CreateRoleSchema,
  DeleteRoleSchema,
  UpdateRoleSchema,
} from "../schemas/org.role.schema.js";

const router = Router();

router.post(
  "/create_role",
  authMiddleware,
  isAdmin,
  validate(CreateRoleSchema),
  OrgRoleController.createRole,
);

router.get("/all", authMiddleware, isAdmin, OrgRoleController.getAllRoles);

router.get("/:id", authMiddleware, isAdmin, OrgRoleController.getRoleById);

router.put(
  "/update_role",
  authMiddleware,
  isAdmin,
  validate(UpdateRoleSchema),
  OrgRoleController.updateRole,
);

router.delete(
  "/delete_role",
  authMiddleware,
  isAdmin,
  validate(DeleteRoleSchema),
  OrgRoleController.deleteRole,
);

export default router;
