1. npm init -y
2. npm i express dotenv @prisma/client @prisma/adapter-pg zod 
3. npm i -D typescript prisma tsx @types/node @types/express
4. npx prisma init
5. npx tsc --init
6.  Add this ts.config file
    "module": "NodeNext",
    "target": "ES2022",
    "types": ["node"],
    "esModuleInterop": true,
    "noUncheckedIndexedAccess": false,
    ** remove all keys of style option ** 
    "include": ["src/**/*.ts",],
    "exclude": ["node_modules","dist"]
7.  Add this package.json
    "main": "dist/server.js",
    "scripts": {
        "dev":"tsx watch src/server.ts",
        "build":"prisma generate && tsc",
        "start":"prisma generate && node dist/server.js",
        "test": "jest"
    },
    "type": "module",
8.  mkdir src 
    cd src 
    touch server.ts app.ts routes.ts
    mkdir common modules config 
    cd common 
    mkdir constant errors middlewares utils 
    cd .. 
    cd config 
    touch prisma.ts env.ts logger.ts
9.  start sql shell and run server and create database school_db 
    CREATE DATABASE school_db
    \l to check databases 
    \c school_db to connect database 
10. Add credentials .env 
    DATABASE_URL="postgresql://postgres:neelneel@localhost:5432/school_db" 
    HOST=0.0.0.0
    PORT=3030
11. Add prisma.config

    const dataUrl = process.env.DATABASE_URL;

    if (!dataUrl) {
        throw new Error("Database not connected. DATABASE_URL is missing.");
    }
12. Add this in env.ts
    import "dotenv/config"
    import {string, z} from "zod"
    const envSchema = z.object({
        PORT:z.string().optional(),
        HOST:z.string().optional(),
        DATABASE_URL:string()
    })
    const env = envSchema.parse(process.env)
    export default env
13. Add this prisma
    import {Prismaclient} from "@prisma/client"
    import {PrismaPg} from "@prisma/adapter-pg"
    import env from "./env.js"

    const adapter = new PrismaPg({
    connectionString:env.DATABASE_URL 
    })

    const prisma = new Prismaclient({
    adapter:adapter as any
    })

    export default prisma

14. add this schema.prisma
    
    generator client {
        provider = "prisma-client-js"
    }
    datasource db {
        provider = "postgresql"
    }
    model User{
    id BigInt @id @default(autoincrement)
    }

    Run this command 
    npx prisma migrate dev --name init ----> to connect postgres with prisma
    npx prisma studio ---> to check data
15. Add this in app.ts and server.ts
    import express from "express"
    import type  { Application,Request,Response } from "express"

    const app:Application = express()

    app.get("/",(req:Request,res:Response)=>{
        res.send("Application running")
    })

    export default app 

    import app from "./app.js";
    import env from "./config/env.js";

    const PORT = Number(env.PORT) ?? 3030
    const HOST = env.HOST ?? "0.0.0.0"

    app.listen(PORT,HOST,()=>{
        console.log(`Server is running on ${PORT}`)
    })

    bun dev
16. npm i winston winston-daily-rotate-file and setup logger 
    constant/errors/AppError.ts
    export class AppError extends Error{
    public statusCode : number;
    public isOperational : boolean;

    constructor(message:string,statusCode=500){
        super(message)

        this.statusCode=statusCode
        this.isOperational = true 

        Object.setPrototypeOf(this,AppError.prototype)
        Error.captureStackTrace(this,this.constructor)
        }
    } 

    -----middleware/errorMiddleware.ts----

    import type {Request,Response,NextFunction} from "express"
    import logger from "../../config/logger.js"
    import { AppError } from "../errors/AppError.js"

    const errorHandler = (err:any,req:Request,res:Response,nxt:NextFunction)=>{

    logger.error({
        message:err.message,
        stack:err.stack,
        statusCode:err.statusCode
    })

    const isAppError = err instanceof AppError

    const statusCode = isAppError ? err.statusCode : 500

    const message = isAppError ? err.message : "Internal Server Error"
    
    return res.status(statusCode).json({
        success:false,
        message:message
        })
    }

    export default errorHandler

    app.use(errorHandler)---> add this app.ts after all routes in the end
17. 