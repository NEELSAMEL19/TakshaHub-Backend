// org.role.schema.ts
import { z } from "zod";
import { PortalType } from "@prisma/client";
import { VALID_STAFF_PERMISSIONS } from "../../sidebar/menu.registry.js";

// ✅ Reusable permission item validator
const permissionItemSchema = z
  .object({
    module: z.string().min(1),
    feature: z.string().min(1),
    canRead: z.boolean().optional(),
    canCreate: z.boolean().optional(),
    canUpdate: z.boolean().optional(),
    canDelete: z.boolean().optional(),
  })
  .superRefine((item, ctx) => {
    if (!VALID_STAFF_PERMISSIONS.has(`${item.module}:${item.feature}`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `'${item.module} -> ${item.feature}' is not a valid menu permission.`,
      });
    }
  });

export const CreateRoleSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Role name must be at least 2 characters")
        .max(100, "Role name must not exceed 100 characters"),
      portalType: z.enum(
        [PortalType.STAFF, PortalType.TEACHER, PortalType.STUDENT],
        { message: "Portal type must be STAFF, TEACHER, or STUDENT" },
      ),
      permissions: z.array(permissionItemSchema).optional(),
    })
    .refine(
      (data) => {
        // ✅ If STAFF and permissions provided, that is fine
        // ✅ If non-STAFF and permissions provided, reject — don't silently ignore
        if (
          data.portalType !== PortalType.STAFF &&
          data.permissions &&
          data.permissions.length > 0
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Permissions can only be assigned to STAFF roles.",
        path: ["permissions"],
      },
    ),
});

export const UpdateRoleSchema = z.object({
  body: z
    .object({
      oldName: z.string().trim().min(1, "Current role name is required"),

      newName: z
        .string()
        .trim()
        .min(2, "New role name must be at least 2 characters")
        .max(100),

      oldPortalType: z.enum(
        [PortalType.STAFF, PortalType.TEACHER, PortalType.STUDENT],
        {
          message: "Old portal type must be STAFF, TEACHER, or STUDENT",
        },
      ),

      newPortalType: z.enum(
        [PortalType.STAFF, PortalType.TEACHER, PortalType.STUDENT],
        {
          message: "New portal type must be STAFF, TEACHER, or STUDENT",
        },
      ),

      permissions: z.array(permissionItemSchema).optional(),
    })
    .refine(
      (data) => {
        // Only STAFF roles can have permissions
        if (
          data.newPortalType !== PortalType.STAFF &&
          data.permissions &&
          data.permissions.length > 0
        ) {
          return false;
        }

        return true;
      },
      {
        message: "Permissions can only be assigned to STAFF roles.",
        path: ["permissions"],
      },
    ),
});

export const DeleteRoleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Role name is required"),
    portalType: z.enum(
      [PortalType.STAFF, PortalType.TEACHER, PortalType.STUDENT],
      { message: "Portal type must be STAFF, TEACHER, or STUDENT" },
    ),
  }),
});
