import { Router } from "express";
import classRouter from "./class/managemet.class.routes.js";
import subjectRouter from "./subject/management.subject.routes.js";
import studentsRouter from "./student/management.student.routes.js";
import teachersRouter from "./classTeacher/management.classTeacher.routes.js";

const managementModuleRouter = Router();

managementModuleRouter.use("/class", classRouter);
managementModuleRouter.use("/subject", subjectRouter);
managementModuleRouter.use("/students", studentsRouter);
managementModuleRouter.use("/teachers", teachersRouter);

export default managementModuleRouter;
