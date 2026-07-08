import { Router } from "express";
import { StudentAttendanceController } from "./attendance.students.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  MarkStudentAttendanceSchema,
  UpdateStudentAttendanceSchema,
  GetStudentAttendanceSchema,
} from "./attendance.students.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get("/", validate(GetStudentAttendanceSchema), StudentAttendanceController.getStudentsForAttendance);
router.get("/report", validate(GetStudentAttendanceSchema), StudentAttendanceController.getAttendanceByDate);
router.post("/mark", validate(MarkStudentAttendanceSchema), StudentAttendanceController.markAttendance);
router.put("/update", validate(UpdateStudentAttendanceSchema), StudentAttendanceController.updateAttendance);

export default router;