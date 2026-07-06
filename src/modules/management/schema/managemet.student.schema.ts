import { z } from "zod";

export const EnrollStudentSchema = z.object({
  body: z.object({
    studentId: z.coerce.bigint({ message: "Student ID is required." }),
    classId: z.coerce.bigint({ message: "Class ID is required." }),
    sectionId: z.coerce.bigint({ message: "Section ID is required." }),
  }),
});

export const UpdateEnrollmentSchema = z.object({
  body: z.object({
    studentId: z.coerce.bigint({ message: "Student ID is required." }),
    currentClassId: z.coerce.bigint({ message: "Current class ID is required." }),
    newClassId: z.coerce.bigint({ message: "Class ID is required." }),
    newSectionId: z.coerce.bigint({ message: "Section ID is required." }),
  }),
});

export const UnenrollStudentSchema = z.object({
  body: z.object({
    studentId: z.coerce.bigint({ message: "Student ID is required." }),
    classId: z.coerce.bigint({ message: "Class ID is required." }),
  }),
});
