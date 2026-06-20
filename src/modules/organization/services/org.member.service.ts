import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType } from "@prisma/client"; // Ensure strict enum compliance
import bcrypt from "bcryptjs";

export class OrgMemberService {
  /**
   * CREATE: Adds a member to the school roster
   */
  static async addMember(schoolId: string | bigint, data: any) {
    const sId = BigInt(schoolId);

    // 1. Enforce unique multi-tenant constraints
    const existingUser = await prisma.user.findUnique({
      where: { email_schoolId: { email: data.email, schoolId: sId } },
    });
    if (existingUser)
      throw new AppError(
        "A user with this email is already registered at this school.",
        409,
      );

    // 2. Safe string-to-enum casting for PortalType
    const upperPortalType = data.portalType?.toUpperCase() as PortalType;

    // 3. Resolve Role ID via string name mapping lookup
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

    // 4. Securely hash the cleartext password
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(data.password, saltRounds);

    // 5. Save to Database
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
    });

    return serializeBigInt(newUser);
  }

  /**
   * READ: Fetches all members for a specific school context
   */
  static async getAllMembers(schoolId: string | bigint) {
    const sId = BigInt(schoolId);

    const members = await prisma.user.findMany({
      where: { schoolId: sId },
      include: {
        role: { select: { name: true, portalType: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeBigInt(members);
  }

  /**
   * UPDATE: Modifies any core field, shifts roles, or performs password resets
   * Matches the exact input payload structure as addMember
   */
  static async updateMember(
    schoolId: string | bigint,
    email: string,
    data: any,
  ) {
    const sId = BigInt(schoolId);

    // 1. Fetch user with their current role relationship
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

    // Securely update password if passed from the form
    if (data.password) {
      const saltRounds = 10;
      updatePayload.passwordHash = await bcrypt.hash(data.password, saltRounds);
    }

    // 2. Resolve Role ID using the exact same lookup logic as Add Member
    if (data.roleName) {
      // Fallback to current role's portalType if not explicitly changed in the edit payload
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

    // 3. Commit changes to the User record
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updatePayload,
    });

    return serializeBigInt(updatedUser);
  }

  /**
   * DELETE: Drops a member profile permanently
   */
  static async deleteMember(schoolId: string | bigint, email: string) {
    const sId = BigInt(schoolId);

    const user = await prisma.user.findUnique({
      where: { email_schoolId: { email, schoolId: sId } },
    });
    if (!user)
      throw new AppError("Target member profile record not found.", 404);

    await prisma.user.delete({
      where: { id: user.id },
    });

    return { deleted: true };
  }
}
