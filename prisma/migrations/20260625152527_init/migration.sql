/*
  Warnings:

  - A unique constraint covering the columns `[module,feature,portalType]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `portalType` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RolePermission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_module_feature_key";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "portalType" "PortalType" NOT NULL;

-- AlterTable
ALTER TABLE "RolePermission" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" BIGINT;

-- CreateIndex
CREATE INDEX "Permission_portalType_idx" ON "Permission"("portalType");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_feature_portalType_key" ON "Permission"("module", "feature", "portalType");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
