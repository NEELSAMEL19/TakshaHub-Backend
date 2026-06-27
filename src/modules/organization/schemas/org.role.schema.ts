import { z } from "zod";
import { PortalType } from "@prisma/client";
import { VALID_STAFF_PERMISSIONS } from "../../sidebar/menu.registry.js";

const ALL_PORTAL_TYPES = [
  PortalType.ADMIN,
  PortalType.STAFF,
  PortalType.TEACHER,
  PortalType.STUDENT,
] as const;

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
      portalType: z.enum(ALL_PORTAL_TYPES, {
        message: "Portal type must be ADMIN, STAFF, TEACHER, or STUDENT",
      }),
      permissions: z.array(permissionItemSchema).optional(),
    })
    // ✅ Block creating ADMIN roles entirely
    .refine((data) => data.portalType !== PortalType.ADMIN, {
      message: "Creating ADMIN roles is not allowed.",
      path: ["portalType"],
    })
    // ✅ Permissions only allowed for STAFF
    .refine(
      (data) =>
        !(
          data.portalType !== PortalType.STAFF &&
          data.permissions &&
          data.permissions.length > 0
        ),
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
      oldPortalType: z.enum(ALL_PORTAL_TYPES, {
        message: "Old portal type must be ADMIN, STAFF, TEACHER, or STUDENT",
      }),
      newPortalType: z.enum(ALL_PORTAL_TYPES, {
        message: "New portal type must be ADMIN, STAFF, TEACHER, or STUDENT",
      }),
      permissions: z.array(permissionItemSchema).optional(),
    })
    // ✅ Block changing portalType away from ADMIN
    .refine(
      (data) =>
        !(
          data.oldPortalType === PortalType.ADMIN &&
          data.newPortalType !== PortalType.ADMIN
        ),
      {
        message:
          "Cannot change portalType of an ADMIN role. Only the name can be updated.",
        path: ["newPortalType"],
      },
    )
    // ✅ Block promoting a non-ADMIN role to ADMIN
    .refine(
      (data) =>
        !(
          data.oldPortalType !== PortalType.ADMIN &&
          data.newPortalType === PortalType.ADMIN
        ),
      {
        message: "Cannot assign ADMIN portalType to an existing role.",
        path: ["newPortalType"],
      },
    )
    // ✅ Permissions only allowed for STAFF
    .refine(
      (data) =>
        !(
          data.newPortalType !== PortalType.STAFF &&
          data.permissions &&
          data.permissions.length > 0
        ),
      {
        message: "Permissions can only be assigned to STAFF roles.",
        path: ["permissions"],
      },
    ),
});

export const DeleteRoleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Role name is required"),
    // ✅ ADMIN excluded — cannot delete ADMIN roles
    portalType: z.enum(
      [PortalType.STAFF, PortalType.TEACHER, PortalType.STUDENT],
      { message: "Portal type must be STAFF, TEACHER, or STUDENT" },
    ),
  }),
});
