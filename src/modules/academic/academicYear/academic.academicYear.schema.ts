import { z } from "zod";

export const CreateAcademicYearSchema = z.object({
  body: z.object({
    label: z.string().trim().min(1, "Label is required.").max(20),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in YYYY-MM-DD format."),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in YYYY-MM-DD format."),
  }),
});

export const UpdateAcademicYearSchema = z.object({
  params: z.object({
    id: z.coerce.bigint({ message: "Academic year id is required." }),
  }),
  body: z.object({
    label: z.string().trim().min(1, "Label is required.").max(20),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in YYYY-MM-DD format."),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in YYYY-MM-DD format."),
  }),
});

export const AcademicYearIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.bigint({ message: "Academic year id is required." }),
  }),
});
