import { Router } from "express";
import { StudentAttendanceController } from "./attendance.students.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import { GetStudentAttendanceSchema, ToggleStudentAttendanceSchema } from "./attendance.students.schema.js";

const router = Router();
router.use(authMiddleware, isAdmin);

router.get("/", validate(GetStudentAttendanceSchema), StudentAttendanceController.getStudentsForAttendance);
router.put("/toggle", validate(ToggleStudentAttendanceSchema), StudentAttendanceController.toggleAttendance);

export default router;