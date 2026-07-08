import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const MarkTeacherAttendanceSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
    attendance: z.array(
      z.object({
        teacherId: z.coerce.bigint({ message: "Teacher ID is required." }),
        status: z.nativeEnum(AttendanceStatus, { message: "Invalid attendance status." }),
      })
    ).min(1, "Attendance list cannot be empty."),
  }),
});

export const UpdateTeacherAttendanceSchema = z.object({
  body: z.object({
    teacherId: z.coerce.bigint({ message: "Teacher ID is required." }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
    status: z.nativeEnum(AttendanceStatus, { message: "Invalid attendance status." }),
  }),
});

export const GetTeacherAttendanceSchema = z.object({
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  }),
});