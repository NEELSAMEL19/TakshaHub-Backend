import { defineConfig } from "prisma/config";
try {
    process.loadEnvFile?.();
}
catch {
    // Render provides DATABASE_URL through environment variables.
}
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
//# sourceMappingURL=prisma.config.js.map