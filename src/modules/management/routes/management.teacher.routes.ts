import { Router } from "express";
import { ManagementTeacherController } from "../controller/management.teacher.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import { AssignTeacherSchema, UnassignTeacherSchema } from "../schema/management.teacher.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get("/available", ManagementTeacherController.getAvailableTeachers);
router.get("/assigned", ManagementTeacherController.getAssignedTeachers);
router.get("/:teacherId", ManagementTeacherController.getTeacherById);
router.post("/assign", validate(AssignTeacherSchema), ManagementTeacherController.assignTeacher);
router.delete("/unassign", validate(UnassignTeacherSchema), ManagementTeacherController.unassignTeacher);

export default router;