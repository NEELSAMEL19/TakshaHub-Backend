import { Router } from "express";
import { TeacherAttendanceController } from "./attendance.teachers.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  GetTeacherAttendanceSchema,
  ToggleTeacherAttendanceSchema,
} from "./attendance.teachers.schema.js";

const router = Router();
router.use(authMiddleware, isAdmin);

router.get(
  "/",
  validate(GetTeacherAttendanceSchema),
  TeacherAttendanceController.getTeachersForAttendance,
);
router.put(
  "/toggle",
  validate(ToggleTeacherAttendanceSchema),
  TeacherAttendanceController.toggleAttendance,
);

export default router;
