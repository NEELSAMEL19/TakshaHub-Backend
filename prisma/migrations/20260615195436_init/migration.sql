/*
  Warnings:

  - A unique constraint covering the columns `[module,feature]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolId,name,portalType]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,schoolId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `feature` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PortalType" ADD VALUE 'STAFF';

-- DropIndex
DROP INDEX "Permission_module_key";

-- DropIndex
DROP INDEX "Role_schoolId_name_key";

-- DropIndex
DROP INDEX "School_udiseNumber_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "feature" TEXT NOT NULL,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "module" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "Permission_module_idx" ON "Permission"("module");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_feature_key" ON "Permission"("module", "feature");

-- CreateIndex
CREATE UNIQUE INDEX "Role_schoolId_name_portalType_key" ON "Role"("schoolId", "name", "portalType");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_schoolId_key" ON "User"("email", "schoolId");
