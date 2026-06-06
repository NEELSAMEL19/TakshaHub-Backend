import app from "./app.js";
import validate from "./config/validate.js";
const PORT = Number(validate.PORT ?? 3030);
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
//# sourceMappingURL=server.js.map