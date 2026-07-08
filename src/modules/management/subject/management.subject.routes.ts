import { Router } from "express";
import { ManagementSubjectController } from "../subject/management.subject.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  CreateSubjectSchema,
  UpdateSubjectSchema,
  DeleteSubjectSchema,
} from "../subject/management.subject.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.post(
  "/create",
  validate(CreateSubjectSchema),
  ManagementSubjectController.createSubject,
);
router.get("/all", ManagementSubjectController.getAllSubjects);
router.get("/dropdown", ManagementSubjectController.getSubjectsForDropdown);
router.get("/:id", ManagementSubjectController.getSubjectById);
router.put(
  "/update",
  validate(UpdateSubjectSchema),
  ManagementSubjectController.updateSubject,
);
router.delete(
  "/delete",
  validate(DeleteSubjectSchema),
  ManagementSubjectController.deleteSubject,
);

export default router;
