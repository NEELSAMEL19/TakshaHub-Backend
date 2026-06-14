import { z } from "zod";

const uppercaseEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) =>
      typeof value === "string" ? value.trim().toUpperCase() : value,
    z.enum(values),
  );

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name is required"),

    email: z.string().trim().toLowerCase().email("Invalid email address"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    phoneNumber: z.string().trim().optional().or(z.literal("")),

    school: z.object({
      name: z.string().trim().min(2, "School name is required"),

      type: uppercaseEnum(["PUBLIC", "PRIVATE", "OTHER"] as const),

      board: uppercaseEnum(["CBSE", "ICSE", "STATE", "OTHER"] as const),

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
