import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import errorHandler from "./common/middlewares/errorHandler.js";
import router from "./routes.js";
import validate from "./config/validate.js";

const app = express();

const corsOrigins = validate.CORS_ORIGIN
  ? validate.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["https://takshahub.vercel.app", "http://localhost:3000"];

app.set("trust proxy", 1);

app.use(express.json());

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Takshahub Backend is running");
});

app.use("/api", router);

app.use(errorHandler);

export default app;
