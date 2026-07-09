/*
  Warnings:

  - A unique constraint covering the columns `[sectionId,academicYearId]` on the table `ClassTeacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,classId,academicYearId]` on the table `StudentEnrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId,classId,sectionId,subjectId,academicYearId]` on the table `TeacherAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYearId` to the `ClassTeacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `StudentAttendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `StudentEnrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `TeacherAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `TeacherAttendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClassTeacher" DROP CONSTRAINT "ClassTeacher_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassTeacher" DROP CONSTRAINT "ClassTeacher_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAttendance" DROP CONSTRAINT "StudentAttendance_classId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAttendance" DROP CONSTRAINT "StudentAttendance_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "StudentEnrollment" DROP CONSTRAINT "StudentEnrollment_classId_fkey";

-- DropForeignKey
ALTER TABLE "StudentEnrollment" DROP CONSTRAINT "StudentEnrollment_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_classId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_sectionId_fkey";

-- DropIndex
DROP INDEX "ClassTeacher_sectionId_key";

-- DropIndex
DROP INDEX "StudentAttendance_classId_idx";

-- DropIndex
DROP INDEX "StudentAttendance_date_idx";

-- DropIndex
DROP INDEX "StudentAttendance_schoolId_idx";

-- DropIndex
DROP INDEX "StudentAttendance_sectionId_idx";

-- DropIndex
DROP INDEX "StudentEnrollment_studentId_classId_key";

-- DropIndex
DROP INDEX "TeacherAssignment_teacherId_classId_sectionId_subjectId_key";

-- DropIndex
DROP INDEX "TeacherAttendance_date_idx";

-- DropIndex
DROP INDEX "TeacherAttendance_schoolId_idx";

-- DropIndex
DROP INDEX "TeacherAttendance_teacherId_idx";

-- AlterTable
ALTER TABLE "ClassTeacher" ADD COLUMN     "academicYearId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "StudentAttendance" ADD COLUMN     "academicYearId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "StudentEnrollment" ADD COLUMN     "academicYearId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "TeacherAssignment" ADD COLUMN     "academicYearId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "TeacherAttendance" ADD COLUMN     "academicYearId" BIGINT NOT NULL;

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" BIGSERIAL NOT NULL,
    "schoolId" BIGINT NOT NULL,
    "label" VARCHAR(20) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademicYear_schoolId_idx" ON "AcademicYear"("schoolId");

-- CreateIndex
CREATE INDEX "AcademicYear_schoolId_isActive_idx" ON "AcademicYear"("schoolId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_schoolId_label_key" ON "AcademicYear"("schoolId", "label");

-- CreateIndex
CREATE INDEX "ClassTeacher_academicYearId_idx" ON "ClassTeacher"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTeacher_sectionId_academicYearId_key" ON "ClassTeacher"("sectionId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentAttendance_schoolId_date_idx" ON "StudentAttendance"("schoolId", "date");

-- CreateIndex
CREATE INDEX "StudentAttendance_classId_sectionId_date_idx" ON "StudentAttendance"("classId", "sectionId", "date");

-- CreateIndex
CREATE INDEX "StudentAttendance_academicYearId_idx" ON "StudentAttendance"("academicYearId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_academicYearId_idx" ON "StudentEnrollment"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_studentId_classId_academicYearId_key" ON "StudentEnrollment"("studentId", "classId", "academicYearId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_academicYearId_idx" ON "TeacherAssignment"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_teacherId_classId_sectionId_subjectId_aca_key" ON "TeacherAssignment"("teacherId", "classId", "sectionId", "subjectId", "academicYearId");

-- CreateIndex
CREATE INDEX "TeacherAttendance_schoolId_date_idx" ON "TeacherAttendance"("schoolId", "date");

-- CreateIndex
CREATE INDEX "TeacherAttendance_academicYearId_idx" ON "TeacherAttendance"("academicYearId");

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
