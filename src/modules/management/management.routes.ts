import { Router } from "express";
import classRouter from "./routes/managemet.class.routes.js";
import subjectRouter from "./routes/management.subject.routes.js";
import studentsRouter from "./routes/management.student.routes.js";
import teachersRouter from "./routes/management.teacher.routes.js";

const managementModuleRouter = Router();

managementModuleRouter.use("/class", classRouter);
managementModuleRouter.use("/subject", subjectRouter);
managementModuleRouter.use("/students", studentsRouter);
managementModuleRouter.use("/teachers", teachersRouter);

export default managementModuleRouter;
