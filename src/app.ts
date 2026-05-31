import expres from "express"
import type { Application, Request, Response } from "express"
import errorHandler from "./common/middlewares/errorHandler"

const app:Application = expres()

app.use(expres.json())


app.get("/",(req:Request,res:Response)=>{
    res.send("Takshahub Backend is running")
})


app.use(errorHandler)


export default app