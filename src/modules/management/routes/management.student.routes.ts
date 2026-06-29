import { Router } from "express";
import { ManagementStudentController } from "../controller/management.student.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  EnrollStudentSchema,
  UnenrollStudentSchema,
} from "../schema/managemet.student.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get("/available", ManagementStudentController.getAvailableStudents);
router.get("/enrolled", ManagementStudentController.getEnrolledStudents);
router.post(
  "/enroll",
  validate(EnrollStudentSchema),
  ManagementStudentController.enrollStudent,
);
router.delete(
  "/unenroll",
  validate(UnenrollStudentSchema),
  ManagementStudentController.unenrollStudent,
);

export default router;
