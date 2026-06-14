import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name is required"),

    email: z.string().trim().email("Invalid email address"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    phoneNumber: z.string().trim().optional(),

    school: z.object({
      name: z.string().trim().min(2, "School name is required"),

      type: z.string().trim().min(1, "School type is required"),

      board: z.string().trim().min(1, "Board is required"),

      city: z.string().trim().min(1, "City is required"),

      state: z.string().trim().min(1, "State is required"),

      website: z
        .string()
        .trim()
        .url("Invalid website URL")
        .optional()
        .or(z.literal("")),

      udiseNumber: z.string().trim().min(1, "UDISE number is required"),
    }),
  }),
});
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  }),
});