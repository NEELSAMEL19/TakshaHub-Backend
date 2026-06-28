import { Router } from "express";
import { TeacherAttendanceController } from "./attendance.teachers.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  MarkTeacherAttendanceSchema,
  UpdateTeacherAttendanceSchema,
  GetTeacherAttendanceSchema,
} from "./attendance.teachers.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get(
  "/",
  validate(GetTeacherAttendanceSchema),
  TeacherAttendanceController.getTeachersForAttendance,
);
router.get(
  "/report",
  validate(GetTeacherAttendanceSchema),
  TeacherAttendanceController.getAttendanceByDate,
);
router.post(
  "/mark",
  validate(MarkTeacherAttendanceSchema),
  TeacherAttendanceController.markAttendance,
);
router.put(
  "/update",
  validate(UpdateTeacherAttendanceSchema),
  TeacherAttendanceController.updateAttendance,
);

export default router;
