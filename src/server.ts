import app from "./app.js";
import { validateRegistries } from "./common/utils/validateRegistries.js";
import validate from "./config/validate.js";

const PORT = Number(validate.PORT ?? 3030);
const HOST = "0.0.0.0";

validateRegistries();

app.listen(PORT, HOST, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
