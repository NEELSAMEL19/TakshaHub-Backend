import { Router } from "express";
import academicYearRouter from "./academicYear/academic.academicYear.routes.js";

const academicModuleRouter = Router();

academicModuleRouter.use("/academic_years", academicYearRouter);

export default academicModuleRouter;
