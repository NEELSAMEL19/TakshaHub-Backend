import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().optional(),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string().min(1),
  BCRYPT_ROUNDS: z.string().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
});

const validate = envSchema.parse(process.env);

export default validate;
