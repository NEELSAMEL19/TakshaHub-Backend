import { z } from "zod";
import { PortalType } from "@prisma/client";

export const AddMemberSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Valid email address is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phoneNumber: z.string().trim().optional(),
    portalType: z.enum(
      [PortalType.STAFF, PortalType.TEACHER, PortalType.STUDENT],
      {
        message: "Valid portal type is required (STAFF, TEACHER, or STUDENT)",
      },
    ),
    roleName: z.string().trim().min(1, "Role profile mapping name is required"),
  }),
});

export const UpdateMemberSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Target member email is required to identify the user record"),
    fullName: z.string().trim().min(2).optional(),
    phoneNumber: z.string().trim().optional(),
    portalType: z
      .enum([PortalType.STAFF, PortalType.TEACHER, PortalType.STUDENT], {
        message: "Valid portal type is required (STAFF, TEACHER, or STUDENT)",
      })
      .optional(),
    roleName: z.string().trim().optional(),
    password: z.string().min(6).optional(), // Optional password reset field
    isActive: z.boolean().optional(),
  }),
});

export const DeleteMemberSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Target member profile email to clear is required"),
  }),
});
