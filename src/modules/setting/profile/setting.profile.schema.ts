import { z } from "zod";

export const UpdateProfileSchema = z.object({
  body: z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .optional(),
      email: z
        .string()
        .trim()
        .email("Valid email address is required")
        .optional(),
      phoneNumber: z.string().trim().optional(),
      currentPassword: z
        .string()
        .min(1, "Current password is required")
        .optional(),
      newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters long")
        .optional(),
    })
    .refine((data) => !data.newPassword || !!data.currentPassword, {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    }),
});
