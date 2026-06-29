import type { MenuItem } from "./sidebar.types.js";
import type { PortalType } from "@prisma/client";

const adminStaffMenuItems: MenuItem[] = [
  // Academic
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
    path: "/attendance/student",
    module: "Attendance",
    feature: "student",
    group: "Attendance",
  },
  {
    id: "attendance_teacher", 
    label: "Teacher",
    path: "/attendance/teacher",
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
    id: "teacher",
    label: "Teacher",
    path: "/teacher",
    module: "Management",
    feature: "teacher",
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
