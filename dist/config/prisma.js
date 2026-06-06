import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import validate from "./validate.js";
const adapter = new PrismaPg({
    connectionString: validate.DATABASE_URL
});
const prisma = new PrismaClient({
    adapter: adapter
});
export default prisma;
//# sourceMappingURL=prisma.js.map