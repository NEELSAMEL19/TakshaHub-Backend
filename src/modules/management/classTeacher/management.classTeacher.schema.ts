import { z } from "zod";

export const AssignClassTeacherSchema = z.object({
  body: z.object({
    teacherId: z.string().or(z.number()),
    classId: z.string().or(z.number()),
    sectionId: z.string().or(z.number()),
  }),
});

export const UnassignClassTeacherSchema = z.object({
  params: z.object({
    sectionId: z.string().or(z.number()),
  }),
});
