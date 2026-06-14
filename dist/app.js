import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./common/middlewares/errorHandler.js";
import router from "./routes.js";
const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cors({
    origin: ["https://takshahub.vercel.app", "http://localhost:3000"],
    credentials: true,
}));
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("Takshahub Backend is running");
});
app.use("/api", router);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map