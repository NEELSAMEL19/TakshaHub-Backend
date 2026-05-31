import "dotenv/config"
import {z} from "zod"

const envSchema = z.object({
    PORT : z.string().optional(),
    HOST : z.string().optional(),
    DATABASE_URL : z.string()
})

const env = envSchema.parse(process.env)


export default env 