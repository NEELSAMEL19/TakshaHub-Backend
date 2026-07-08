import { z } from "zod";

export const CreateClassWithSectionsSchema = z.object({
  body: z.object({
    className: z.string().trim().min(1, "Class name is required").max(50),
    sections: z
      .array(z.string().trim().min(1, "Section name cannot be empty").max(20))
      .min(1, "At least one section must be provided"),
  }),
});

export const UpdateClassWithSectionsSchema = z.object({
  params: z.object({
    classId: z.string().trim().min(1, "Class ID is required"),
  }),
  body: z.object({
    className: z
      .string()
      .trim()
      .min(1, "Class name must be at least 1 character long")
      .max(50),
    sections: z
      .array(
        z.object({
          id: z.union([z.string(), z.number()]).optional(), // present -> rename existing section, absent -> create new
          name: z
            .string()
            .trim()
            .min(1, "Section name cannot be empty")
            .max(20),
        }),
      )
      .optional(), // omit entirely to leave sections untouched
  }),
});

export const DeleteClassSchema = z.object({
  params: z.object({
    classId: z.string().trim().min(1, "Class ID is required"),
  }),
});
