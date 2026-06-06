import express from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./common/middlewares/errorHandler.js";
import router from "./routes.js";
import validate from "./config/validate.js";
const app = express();
app.use((req, res, next) => {
    const allowedOrigin = validate.CORS_ORIGIN;
    if (allowedOrigin) {
        res.header("Access-Control-Allow-Origin", allowedOrigin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("Takshahub Backend is running");
});
app.use("/api", router);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map