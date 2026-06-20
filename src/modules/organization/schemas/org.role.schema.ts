import { z } from "zod";
import { PortalType } from "@prisma/client";

export const CreateRoleSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Role name must be at least 2 characters long")
        .max(100, "Role name must not exceed 100 characters"),

      portalType: z.enum(Object.values(PortalType) as [string, ...string[]], {
        message: "Valid portal type is required",
      }),

      permissions: z
        .array(
          z.object({
            module: z.string(),
            feature: z.string(),
            canRead: z.boolean().optional(),
            canCreate: z.boolean().optional(),
            canUpdate: z.boolean().optional(),
            canDelete: z.boolean().optional(),
          }),
        )
        .optional(),
    })
    .refine((data) => data.portalType !== PortalType.ADMIN, {
      message:
        "Security Restriction: You cannot manually create a role under the ADMIN portal type.",
      path: ["portalType"], // Highlights the exact field causing the error
    }),
});

export const UpdateRoleSchema = z.object({
  body: z
    .object({
      oldName: z.string().trim().min(1, "Current role name is required"),
      newName: z
        .string()
        .trim()
        .min(2, "New role name must be at least 2 characters long")
        .max(100),
      portalType: z.enum(
        [PortalType.STAFF, PortalType.TEACHER, PortalType.STUDENT],
        {
          message: "Valid portal type is required",
        },
      ),
      // 🔥 Added permissions block for updating STAFF permissions
      permissions: z
        .array(
          z.object({
            module: z.string(),
            feature: z.string(),
            canRead: z.boolean().optional(),
            canCreate: z.boolean().optional(),
            canUpdate: z.boolean().optional(),
            canDelete: z.boolean().optional(),
          }),
        )
        .optional(),
    })
    .refine((data) => (data.portalType as string) !== PortalType.ADMIN, {
      message: "Security Restriction: You cannot modify the ADMIN portal role.",
      path: ["portalType"],
    }),
});

export const DeleteRoleSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, "Role name to delete is required"),
      portalType: z.enum(Object.values(PortalType) as [string, ...string[]], {
        message: "Valid portal type is required",
      }),
    })
    .refine((data) => data.portalType !== PortalType.ADMIN, {
      message: "Security Restriction: You cannot delete the ADMIN portal role.",
      path: ["portalType"],
    }),
});
