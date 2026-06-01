import expres from "express"
import type { Application, Request, Response } from "express"
import errorHandler from "./common/middlewares/errorHandler.js"
import router from "./routes.js"

const app:Application = expres()

app.use(expres.json())

app.get("/",(req:Request,res:Response)=>{
    res.send("Takshahub Backend is running")
})

app.use("/api",router)

app.use(errorHandler)


export default app