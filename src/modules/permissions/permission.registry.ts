import type { PortalType } from "@prisma/client";

export type AllowedAction = "canRead" | "canCreate" | "canUpdate" | "canDelete";

export interface PermissionFeature {
  id: string;
  name: string;
  allowedActions: AllowedAction[];
}

export interface PermissionModule {
  id: string;
  name: string;
  features: PermissionFeature[];
}

const staffPermissionRegistry: PermissionModule[] = [
  {
    id: "Organization",
    name: "Organization",
    features: [
      {
        id: "role",
        name: "Role",
        allowedActions: ["canRead", "canCreate", "canUpdate", "canDelete"],
      },
      {
        id: "team",
        name: "Team",
        allowedActions: ["canRead", "canCreate", "canUpdate"],
      },
    ],
  },
  {
    id: "Management",
    name: "Management",
    features: [
      {
        id: "class", 
        name: "Class",
        allowedActions: ["canRead", "canCreate", "canUpdate", "canDelete"],
      },
      {
        id: "subject",
        name: "Subject",
        allowedActions: ["canRead", "canCreate", "canUpdate"],
      },
      {
        id: "student",
        name: "Student",
        allowedActions: ["canRead", "canCreate", "canUpdate"],
      },
      {
        id: "teacher",
        name: "Teacher",
        allowedActions: ["canRead", "canCreate", "canUpdate"],
      },
    ],
  },
  {
    id: "Attendance",
    name: "Attendance",
    features: [
      {
        id: "student",
        name: "Student",
        allowedActions: ["canRead", "canCreate", "canUpdate", "canDelete"],
      },
      {
        id: "teacher",
        name: "Teacher",
        allowedActions: ["canRead", "canCreate", "canUpdate"],
      },
    ],
  },
  {
    id: "Academic",
    name: "Academic",
    features: [
      {
        id: "timetable",
        name: "Timetable",
        allowedActions: ["canRead", "canCreate", "canUpdate", "canDelete"],
      },
      {
        id: "lessonplan",
        name: "Lesson Plan",
        allowedActions: ["canRead", "canCreate", "canUpdate"],
      },
      {
        id: "assignment",
        name: "Assignment",
        allowedActions: ["canRead", "canCreate", "canUpdate"],
      },
    ],
  },
];

export const PERMISSION_REGISTRY: Partial<
  Record<PortalType, PermissionModule[]>
> = {
  STAFF: staffPermissionRegistry,
  // TEACHER and STUDENT don't have permission templates — they see everything
};

export function getPermissionRegistry(
  portalType: PortalType,
): PermissionModule[] {
  return PERMISSION_REGISTRY[portalType] ?? [];
}

// ✅ Used in createRole / updateRole validation
export function buildValidPermissionSet(portalType: PortalType): Set<string> {
  const registry = getPermissionRegistry(portalType);
  const set = new Set<string>();
  for (const mod of registry) {
    for (const feat of mod.features) {
      set.add(`${mod.id}:${feat.id}`);
    }
  }
  return set;
}

// ✅ Used in createRole / updateRole to validate specific actions
export function getAllowedActionsMap(
  portalType: PortalType,
): Map<string, AllowedAction[]> {
  const registry = getPermissionRegistry(portalType);
  const map = new Map<string, AllowedAction[]>();
  for (const mod of registry) {
    for (const feat of mod.features) {
      map.set(`${mod.id}:${feat.id}`, feat.allowedActions);
    }
  }
  return map;
}
