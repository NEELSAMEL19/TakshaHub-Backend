import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import errorHandler from "./common/middlewares/errorHandler.js";
import router from "./routes.js";
import validate from "./config/validate.js";

const app = express();

const allowedOrigins = [
  "https://takshahub.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // keep this ONLY if you use cookies/login
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Takshahub Backend is running");
});

app.use("/api", router);

app.use(errorHandler);

export default app;
