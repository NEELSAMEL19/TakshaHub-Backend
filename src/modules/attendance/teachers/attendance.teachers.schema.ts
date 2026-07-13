import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const GetTeacherAttendanceSchema = z.object({
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
    // Optional — omitted means "use active academic year".
    academicYearId: z.coerce.bigint().optional(),
  }),
});

export const ToggleTeacherAttendanceSchema = z.object({
  body: z.object({
    teacherId: z.coerce.bigint({ message: "Teacher ID is required." }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
    status: z.nativeEnum(AttendanceStatus).nullable(),
  }),
});
