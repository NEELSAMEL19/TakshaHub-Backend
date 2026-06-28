import { z } from "zod";

export const CreateClassWithSectionsSchema = z.object({
  body: z.object({
    className: z.string().trim().min(1, "Class name is required").max(50),
    sections: z
      .array(z.string().trim().min(1, "Section name cannot be empty").max(20))
      .min(1, "At least one section must be provided"),
  }),
});

export const UpdateClassSchema = z.object({
  body: z.object({
    oldClassName: z.string().trim().min(1, "Current class name is required"),
    newClassName: z
      .string()
      .trim()
      .min(1, "New class name must be at least 1 character long")
      .max(50),
  }),
});

export const DeleteClassSchema = z.object({
  body: z.object({
    className: z.string().trim().min(1, "Class name to delete is required"),
  }),
});
