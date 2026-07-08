import { Router } from "express";
import { ManagementSubjectTeacherController } from "./management.subjectTeacher.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  AssignSubjectTeacherSchema,
  UpdateSubjectTeacherSchema,
  GetSubjectTeacherByIdSchema,
  UnassignSubjectTeacherSchema,
} from "./management.subjectTeacher.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get("/", ManagementSubjectTeacherController.getSubjectTeachers);
router.get(
  "/section/:sectionId",
  ManagementSubjectTeacherController.getSubjectTeachersBySection,
);
router.post(
  "/assign",
  validate(AssignSubjectTeacherSchema),
  ManagementSubjectTeacherController.assignSubjectTeacher,
);
router.delete(
  "/unassign",
  validate(UnassignSubjectTeacherSchema),
  ManagementSubjectTeacherController.unassignSubjectTeacher,
);
router.get(
  "/:id",
  validate(GetSubjectTeacherByIdSchema),
  ManagementSubjectTeacherController.getSubjectTeacherById,
);
router.put(
  "/:id",
  validate(UpdateSubjectTeacherSchema),
  ManagementSubjectTeacherController.updateSubjectTeacher,
);

export default router;