import type { MenuItem } from "./sidebar.types.js";
import type { PortalType } from "@prisma/client";

// ─── Shared Admin + Staff Registry ───
// Both ADMIN and STAFF have access to the same pool of menus.
// ADMIN bypasses permission checks and sees everything.
// STAFF is filtered by RolePermission.canRead.

const adminStaffMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    module: null,
    feature: null,
    group: "Dashboard",
  },
  {
    id: "users",
    label: "Users",
    path: "/users",
    module: "user-management",
    feature: "users",
    group: "User Management",
  },
  {
    id: "roles_permissions",
    label: "Roles & Permissions",
    path: "/roles",
    module: "user-management",
    feature: "roles-permissions",
    group: "User Management",
  },
  {
    id: "activity_logs",
    label: "Activity Logs",
    path: "/activity-logs",
    module: "user-management",
    feature: "activity-logs",
    group: "User Management",
  },
  {
    id: "school_details",
    label: "School Details",
    path: "/school",
    module: "organization",
    feature: "school-details",
    group: "Organization",
  },
];

// ─── Teacher Registry (separate from admin/staff) ───

const teacherMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    module: null,
    feature: null,
    group: "Dashboard",
  },
  {
    id: "my_classes",
    label: "My Classes",
    path: "/my-classes",
    module: "teaching",
    feature: "classes",
    group: "Teaching",
  },
  {
    id: "assignments",
    label: "Assignments",
    path: "/assignments",
    module: "teaching",
    feature: "assignments",
    group: "Teaching",
  },
  {
    id: "exams",
    label: "Exams",
    path: "/exams",
    module: "teaching",
    feature: "exams",
    group: "Teaching",
  },
  {
    id: "grades",
    label: "Grades",
    path: "/grades",
    module: "teaching",
    feature: "grades",
    group: "Teaching",
  },
];

// ─── Student Registry (separate from admin/staff) ───

const studentMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    module: null,
    feature: null,
    group: "Dashboard",
  },
  {
    id: "my_assignments",
    label: "My Assignments",
    path: "/my-assignments",
    module: "student",
    feature: "assignments",
    group: "Learning",
  },
  {
    id: "my_grades",
    label: "My Grades",
    path: "/my-grades",
    module: "student",
    feature: "grades",
    group: "Learning",
  },
  {
    id: "timetable",
    label: "Timetable",
    path: "/timetable",
    module: "student",
    feature: "timetable",
    group: "Learning",
  },
];

// ─── Registry map: ADMIN and STAFF both share the same registry ───

export const MENU_REGISTRY: Record<PortalType, MenuItem[]> = {
  ADMIN: adminStaffMenuItems,  // same registry as STAFF
  STAFF: adminStaffMenuItems,  // same registry as ADMIN (filters by permissions)
  TEACHER: teacherMenuItems,
  STUDENT: studentMenuItems,
};

// ─── Helper: get registry for a specific role ───

export function getMenuRegistry(role: PortalType | null): MenuItem[] {
  if (!role || !(role in MENU_REGISTRY)) {
    return adminStaffMenuItems; // fallback to admin/staff registry
  }
  return MENU_REGISTRY[role];
}
