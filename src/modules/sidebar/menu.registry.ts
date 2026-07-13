import type { MenuItem } from "./sidebar.types.js";
import type { PortalType } from "@prisma/client";

const adminStaffMenuItems: MenuItem[] = [
  // Academic
  {
    id: "academic_year",
    label: "Academic Year",
    path: "/academic_year",
    module: "Academic",
    feature: "academic_year",
    group: "Academic",
  },
  {
    id: "timetable",
    label: "Timetable",
    path: "/timetable",
    module: "Academic",
    feature: "timetable",
    group: "Academic",
  },
  {
    id: "lessonplan",
    label: "Lesson Plan",
    path: "/lessonplan",
    module: "Academic",
    feature: "lessonplan",
    group: "Academic",
  },
  {
    id: "assignment",
    label: "Assignment",
    path: "/assignment",
    module: "Academic",
    feature: "assignment",
    group: "Academic",
  },
  // Attendance
  {
    id: "attendance_student",
    label: "Student",
    path: "/attendance_student",
    module: "Attendance",
    feature: "student",
    group: "Attendance",
  },
  {
    id: "attendance_teacher",
    label: "Teacher",
    path: "/attendance_teacher",
    module: "Attendance",
    feature: "teacher",
    group: "Attendance",
  },

  // Management
  {
    id: "class",
    label: "Class",
    path: "/class",
    module: "Management",
    feature: "class",
    group: "Management",
  },
  {
    id: "subject",
    label: "Subject",
    path: "/subject",
    module: "Management",
    feature: "subject",
    group: "Management",
  },
  {
    id: "student",
    label: "Student",
    path: "/student",
    module: "Management",
    feature: "student",
    group: "Management",
  },
  {
    id: "classTeacher",
    label: "Class teacher",
    path: "/class_teacher",
    module: "Management",
    feature: "classTeacher",
    group: "Management",
  },
  {
    id: "subjectTeacher",
    label: "Subject teacher",
    path: "/subject_teacher",
    module: "Management",
    feature: "subjectTeacher",
    group: "Management",
  },
  // Organization
  {
    id: "role",
    label: "Role",
    path: "/role",
    module: "Organization",
    feature: "role",
    group: "Organization",
  },
  {
    id: "team",
    label: "Team",
    path: "/team",
    module: "Organization",
    feature: "team",
    group: "Organization",
  },
];

const teacherMenuItems: MenuItem[] = [
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    module: null,
    feature: null,
    group: "Setting",
  },
];

const studentMenuItems: MenuItem[] = [
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    module: null,
    feature: null,
    group: "Setting",
  },
];

export const MENU_REGISTRY: Record<PortalType, MenuItem[]> = {
  ADMIN: adminStaffMenuItems,
  STAFF: adminStaffMenuItems,
  TEACHER: teacherMenuItems,
  STUDENT: studentMenuItems,
};

export const VALID_STAFF_PERMISSIONS = new Set(
  adminStaffMenuItems
    .filter((item) => item.module && item.feature)
    .map((item) => `${item.module}:${item.feature}`),
);

export function getMenuRegistry(role: PortalType | null): MenuItem[] {
  if (!role || !(role in MENU_REGISTRY)) return [];
  return MENU_REGISTRY[role];
}
