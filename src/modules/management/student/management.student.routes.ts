import { Router } from "express";
import { ManagementStudentController } from "../student/management.student.controller.js";
import { authMiddleware, isAdmin } from "../../../common/middlewares/auth.js";
import { validate } from "../../../common/middlewares/validate.js";
import {
  EnrollStudentSchema,
  UpdateEnrollmentSchema,
  UnenrollStudentSchema,
} from "./managemet.student.schema.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.post(
  "/enroll",
  validate(EnrollStudentSchema),
  ManagementStudentController.enrollStudent,
);
router.put(
  "/enroll",
  validate(UpdateEnrollmentSchema),
  ManagementStudentController.updateStudentEnrollment,
);
router.get("/available", ManagementStudentController.getAvailableStudents);
router.get("/enrolled", ManagementStudentController.getEnrolledStudents);
router.get(
  "/enrolled/:studentId",
  ManagementStudentController.getEnrolledStudentById,
);
router.delete(
  "/unenroll",
  validate(UnenrollStudentSchema),
  ManagementStudentController.unenrollStudent,
);

export default router;
