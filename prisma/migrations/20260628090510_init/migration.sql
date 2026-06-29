-- CreateTable
CREATE TABLE "StudentEnrollment" (
    "id" BIGSERIAL NOT NULL,
    "studentId" BIGINT NOT NULL,
    "classId" BIGINT NOT NULL,
    "sectionId" BIGINT NOT NULL,
    "schoolId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentEnrollment_schoolId_idx" ON "StudentEnrollment"("schoolId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_classId_idx" ON "StudentEnrollment"("classId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_sectionId_idx" ON "StudentEnrollment"("sectionId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_studentId_idx" ON "StudentEnrollment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_studentId_classId_key" ON "StudentEnrollment"("studentId", "classId");

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
