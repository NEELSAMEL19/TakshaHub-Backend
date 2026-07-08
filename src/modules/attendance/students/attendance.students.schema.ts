import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const MarkStudentAttendanceSchema = z.object({
  body: z.object({
    classId: z.coerce.bigint({ message: "Class ID is required." }),
    sectionId: z.coerce.bigint({ message: "Section ID is required." }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
    attendance: z.array(
      z.object({
        studentId: z.coerce.bigint({ message: "Student ID is required." }),
        status: z.nativeEnum(AttendanceStatus, { message: "Invalid attendance status." }),
      })
    ).min(1, "Attendance list cannot be empty."),
  }),
});

export const UpdateStudentAttendanceSchema = z.object({
  body: z.object({
    studentId: z.coerce.bigint({ message: "Student ID is required." }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
    status: z.nativeEnum(AttendanceStatus, { message: "Invalid attendance status." }),
  }),
});

export const GetStudentAttendanceSchema = z.object({
  query: z.object({
    classId: z.coerce.bigint({ message: "Class ID is required." }),
    sectionId: z.coerce.bigint({ message: "Section ID is required." }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  }),
});