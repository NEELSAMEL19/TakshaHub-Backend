/*
  Warnings:

  - A unique constraint covering the columns `[udiseNumber]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `SchoolId` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `board` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `udiseNumber` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'STAFF', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('PUBLIC', 'PRIVATE', 'OTHER');

-- CreateEnum
CREATE TYPE "SchoolBoard" AS ENUM ('CBSE', 'ICSE', 'STATE', 'OTHER');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "SchoolId" BIGINT NOT NULL,
ADD COLUMN     "UserId" BIGINT NOT NULL,
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "role" "MemberRole" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "board" "SchoolBoard" NOT NULL,
ADD COLUMN     "city" VARCHAR(100) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "state" VARCHAR(100) NOT NULL,
ADD COLUMN     "type" "SchoolType" NOT NULL,
ADD COLUMN     "udiseNumber" VARCHAR(50) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website" VARCHAR(255);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "fullName" VARCHAR(255) NOT NULL,
ADD COLUMN     "password" VARCHAR(255) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "School_udiseNumber_key" ON "School"("udiseNumber");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_SchoolId_fkey" FOREIGN KEY ("SchoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
