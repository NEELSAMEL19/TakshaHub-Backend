import { Router } from "express";
import { ManagementClassTeacherController } from "./management.classTeacher.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  AssignClassTeacherSchema,
  UpdateClassTeacherSchema,
  GetClassTeacherByIdSchema,
  UnassignClassTeacherSchema,
} from "./management.classTeacher.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get("/", ManagementClassTeacherController.getClassTeachers);
router.get(
  "/section/:sectionId",
  ManagementClassTeacherController.getClassTeacherBySection,
);
router.post(
  "/assign",
  validate(AssignClassTeacherSchema),
  ManagementClassTeacherController.assignClassTeacher,
);
router.delete(
  "/unassign/:sectionId",
  validate(UnassignClassTeacherSchema),
  ManagementClassTeacherController.unassignClassTeacher,
);
router.get(
  "/:id",
  validate(GetClassTeacherByIdSchema),
  ManagementClassTeacherController.getClassTeacherById,
);
router.put(
  "/:id",
  validate(UpdateClassTeacherSchema),
  ManagementClassTeacherController.updateClassTeacher,
);

export default router;
