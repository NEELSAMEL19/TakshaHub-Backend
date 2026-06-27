import "dotenv/config"
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts", // ✅ changed to tsx
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});

//  npx tsx prisma/seed.ts