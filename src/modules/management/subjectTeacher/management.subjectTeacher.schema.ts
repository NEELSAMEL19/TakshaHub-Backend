import { z } from "zod";

export const AssignSubjectTeacherSchema = z.object({
  body: z.object({
    teacherId: z.string().or(z.number()),
    classId: z.string().or(z.number()),
    sectionId: z.string().or(z.number()),
    subjectId: z.string().or(z.number()),
  }),
});

export const UpdateSubjectTeacherSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()),
  }),
  body: z.object({
    teacherId: z.string().or(z.number()),
    classId: z.string().or(z.number()),
    sectionId: z.string().or(z.number()),
    subjectId: z.string().or(z.number()),
  }),
});

export const GetSubjectTeacherByIdSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()),
  }),
});

export const UnassignSubjectTeacherSchema = z.object({
  body: z.object({
    teacherId: z.string().or(z.number()),
    classId: z.string().or(z.number()),
    sectionId: z.string().or(z.number()),
    subjectId: z.string().or(z.number()),
  }),
});