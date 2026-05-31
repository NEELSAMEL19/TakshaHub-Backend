import expres from "express"
import type { Application, Request, Response } from "express"

const app:Application = expres()

app.use(expres.json())


app.get("/",(req:Request,res:Response)=>{
    res.send("Takshahub Backend is running")
})



export default app