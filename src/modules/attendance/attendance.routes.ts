import { Router } from "express";
import studentsRouter from "./students/attendance.students.routes.js";
import teachersRouter from "./teachers/attendance.teachers.routes.js";



const attendanceModuleRouter = Router();

// Hook up sub-routers cleanly
attendanceModuleRouter.use("/students", studentsRouter);
attendanceModuleRouter.use("/teachers", teachersRouter);

export default attendanceModuleRouter;
