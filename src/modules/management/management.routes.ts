import { Router } from "express";
import classRouter from "./routes/managemet.class.routes.js";
import studentRouter from "./routes/management.student.routes.js";

const managementModuleRouter = Router();

managementModuleRouter.use("/class", classRouter);
managementModuleRouter.use("/student", studentRouter);

export default managementModuleRouter;
