import { z } from "zod";

export const AssignTeacherSchema = z.object({
  body: z.object({
    teacherId: z.coerce.bigint({ message: "Teacher ID is required." }),
    classId: z.coerce.bigint({ message: "Class ID is required." }),
    sectionId: z.coerce.bigint({ message: "Section ID is required." }),
    subjectId: z.coerce.bigint({ message: "Subject ID is required." }),
  }),
});

export const UnassignTeacherSchema = z.object({
  body: z.object({
    teacherId: z.coerce.bigint({ message: "Teacher ID is required." }),
    classId: z.coerce.bigint({ message: "Class ID is required." }),
    sectionId: z.coerce.bigint({ message: "Section ID is required." }),
    subjectId: z.coerce.bigint({ message: "Subject ID is required." }),
  }),
});