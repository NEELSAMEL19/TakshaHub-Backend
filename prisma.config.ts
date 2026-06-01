import "dotenv/config";
import { defineConfig } from "prisma/config";

const dataUrl = process.env.DATABASE_URL;

if (!dataUrl) {
  throw new Error("DATABASE_URL is missing");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dataUrl,
  },
});