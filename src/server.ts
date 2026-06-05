import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import env from "./config/env.js";
const PORT = Number(env.PORT ?? 3030) 
const HOST = "0.0.0.0"

app.listen(PORT,HOST,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})