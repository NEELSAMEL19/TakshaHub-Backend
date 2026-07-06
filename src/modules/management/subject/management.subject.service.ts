import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";

export class ManagementSubjectService {
  /**
   * CREATE: Add a new subject
   */
  static async createSubject(schoolId: string | bigint, name: string) {
    const sId = BigInt(schoolId);
    const formattedName = name.trim();

    const existing = await prisma.subject.findUnique({
      where: { schoolId_name: { schoolId: sId, name: formattedName } },
    });

    if (existing) {
      throw new AppError(`Subject '${formattedName}' already exists.`, 409);
    }

    const subject = await prisma.subject.create({
      data: { schoolId: sId, name: formattedName },
    });

    return serializeBigInt(subject);
  }

  /**
   * READ: Get all subjects for management page
   */
  static async getAllSubjects(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const subjects = await prisma.subject.findMany({
      where: { schoolId: sId },
      include: {
        teacherAssignments: {
          include: {
            teacher: { select: { id: true, fullName: true } },
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return serializeBigInt(subjects);
  }

  /**
   * READ: Get a single subject by ID
   */
  static async getSubjectById(schoolId: string | bigint, id: string | bigint) {
    const sId = BigInt(schoolId);
    const subjectId = BigInt(id);

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId: sId },
      include: {
        teacherAssignments: {
          include: {
            teacher: { select: { id: true, fullName: true } },
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!subject) {
      throw new AppError(`Subject not found.`, 404);
    }

    return serializeBigInt(subject);
  }

  /**
   * READ: Get subjects for dropdown (id + name only)
   */
  static async getSubjectsForDropdown(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const subjects = await prisma.subject.findMany({
      where: { schoolId: sId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return serializeBigInt(subjects);
  }

  /**
   * UPDATE: Rename a subject
   */
  static async updateSubject(
    schoolId: string | bigint,
    oldName: string,
    newName: string,
  ) {
    const sId = BigInt(schoolId);
    const formattedOld = oldName.trim();
    const formattedNew = newName.trim();

    const target = await prisma.subject.findUnique({
      where: { schoolId_name: { schoolId: sId, name: formattedOld } },
    });

    if (!target) {
      throw new AppError(`Subject '${formattedOld}' not found.`, 404);
    }

    if (formattedOld === formattedNew) {
      return serializeBigInt(target);
    }

    const nameTaken = await prisma.subject.findUnique({
      where: { schoolId_name: { schoolId: sId, name: formattedNew } },
    });

    if (nameTaken) {
      throw new AppError(`Subject '${formattedNew}' already exists.`, 409);
    }

    const updated = await prisma.subject.update({
      where: { id: target.id },
      data: { name: formattedNew },
    });

    return serializeBigInt(updated);
  }

  /**
   * DELETE: Remove a subject
   */
  static async deleteSubject(schoolId: string | bigint, name: string) {
    const sId = BigInt(schoolId);
    const formattedName = name.trim();

    const target = await prisma.subject.findUnique({
      where: { schoolId_name: { schoolId: sId, name: formattedName } },
    });

    if (!target) {
      throw new AppError(`Subject '${formattedName}' not found.`, 404);
    }

    await prisma.subject.delete({ where: { id: target.id } });

    return { deleted: true };
  }
}
