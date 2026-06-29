import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType } from "@prisma/client";
import bcrypt from "bcryptjs";

const safeMemberSelect = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  schoolId: true,
  roleId: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  role: { select: { name: true, portalType: true } },
};

export class OrgMemberService {
  static async addMember(schoolId: string | bigint, data: any) {
    const sId = BigInt(schoolId);

    const existingUser = await prisma.user.findUnique({
      where: { email_schoolId: { email: data.email, schoolId: sId } },
    });
    if (existingUser)
      throw new AppError(
        "A user with this email is already registered at this school.",
        409,
      );

    const upperPortalType = data.portalType?.toUpperCase() as PortalType;

    const matchedRole = await prisma.role.findUnique({
      where: {
        schoolId_name_portalType: {
          schoolId: sId,
          name: data.roleName,
          portalType: upperPortalType,
        },
      },
    });
    if (!matchedRole)
      throw new AppError(
        `Role profile configuration '${data.roleName}' not found for portal '${data.portalType}'.`,
        404,
      );

    const encryptedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        schoolId: sId,
        roleId: matchedRole.id,
        fullName: data.fullName,
        email: data.email,
        passwordHash: encryptedPassword,
        phoneNumber: data.phoneNumber,
        isVerified: false,
        isActive: true,
      },
      select: safeMemberSelect,
    });

    return serializeBigInt(newUser);
  }

  static async getAllMembers(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const members = await prisma.user.findMany({
      where: { schoolId: sId },
      select: safeMemberSelect,
      orderBy: { createdAt: "desc" },
    });

    return serializeBigInt(members);
  }

  static async getMemberById(schoolId: string | bigint, id: string) {
    const sId = BigInt(schoolId);

    const member = await prisma.user.findUnique({
      where: { id: BigInt(id), schoolId: sId },
      select: safeMemberSelect,
    });

    if (!member) throw new AppError("Member not found.", 404);

    return serializeBigInt(member);
  }

  static async updateMember(
    schoolId: string | bigint,
    email: string,
    data: any,
  ) {
    const sId = BigInt(schoolId);

    const user = await prisma.user.findUnique({
      where: { email_schoolId: { email, schoolId: sId } },
      include: { role: true },
    });

    if (!user)
      throw new AppError("Target member account context not found.", 404);

    const updatePayload: any = {};
    if (data.fullName) updatePayload.fullName = data.fullName;
    if (data.phoneNumber) updatePayload.phoneNumber = data.phoneNumber;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    if (data.password) {
      updatePayload.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.roleName) {
      const resolvedPortalType = (
        data.portalType ? data.portalType.toUpperCase() : user.role.portalType
      ) as PortalType;

      const matchedRole = await prisma.role.findUnique({
        where: {
          schoolId_name_portalType: {
            schoolId: sId,
            name: data.roleName,
            portalType: resolvedPortalType,
          },
        },
      });

      if (!matchedRole)
        throw new AppError(
          `Role profile options '${data.roleName}' do not exist for portal type '${resolvedPortalType}'.`,
          404,
        );
      updatePayload.roleId = matchedRole.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updatePayload,
      select: safeMemberSelect,
    });

    return serializeBigInt(updatedUser);
  }

  static async deleteMember(schoolId: string | bigint, email: string) {
    const sId = BigInt(schoolId);

    const user = await prisma.user.findUnique({
      where: { email_schoolId: { email, schoolId: sId } },
    });
    if (!user)
      throw new AppError("Target member profile record not found.", 404);

    await prisma.user.delete({ where: { id: user.id } });

    return { deleted: true };
  }
}
