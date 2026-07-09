import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const GetStudentAttendanceSchema = z.object({
  query: z.object({
    // Optional — omitting both means "All classes/sections" (school-wide roster).
    classId: z.coerce.bigint().optional(),
    sectionId: z.coerce.bigint().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  }),
});

export const ToggleStudentAttendanceSchema = z.object({
  body: z.object({
    // Unchanged — still required. A write always needs a concrete
    // class/section context, even when the roster was fetched via "All".
    studentId: z.coerce.bigint({ message: "Student ID is required." }),
    classId: z.coerce.bigint({ message: "Class ID is required." }),
    sectionId: z.coerce.bigint({ message: "Section ID is required." }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
    status: z.nativeEnum(AttendanceStatus).nullable(),
  }),
});
