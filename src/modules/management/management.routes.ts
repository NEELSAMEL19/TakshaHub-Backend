import { Router } from "express";
import classRouter from "./class/managemet.class.routes.js";
import subjectRouter from "./subject/management.subject.routes.js";
import studentsRouter from "./student/management.student.routes.js";
import classTeacherRouter from "./classTeacher/management.classTeacher.routes.js";
import subjectTeacherRouter from "./subjectTeacher/management.subjectTeacher.routes.js";

const managementModuleRouter = Router();

managementModuleRouter.use("/class", classRouter);
managementModuleRouter.use("/subject", subjectRouter);
managementModuleRouter.use("/students", studentsRouter);
managementModuleRouter.use("/class_teacher", classTeacherRouter);
managementModuleRouter.use("/subject_teacher", subjectTeacherRouter);

export default managementModuleRouter;
