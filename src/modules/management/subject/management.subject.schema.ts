import { z } from "zod";

export const CreateSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Subject name is required.").max(100, "Subject name too long.").trim(),
  }),
});

export const UpdateSubjectSchema = z.object({
  body: z.object({
    oldName: z.string().min(1, "Old subject name is required.").trim(),
    newName: z.string().min(1, "New subject name is required.").max(100, "Subject name too long.").trim(),
  }),
});

export const DeleteSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Subject name is required.").trim(),
  }),
});