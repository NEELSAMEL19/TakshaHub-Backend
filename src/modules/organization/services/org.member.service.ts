import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import { PortalType } from "@prisma/client";
import bcrypt from "bcryptjs";

export class OrgMemberService {
  private static readonly SALT_ROUNDS = 10;

  private static readonly memberSelect = {
    id: true,
    fullName: true,
    email: true,
    phoneNumber: true,
    schoolId: true,
    isVerified: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    role: {
      select: {
        name: true,
        portalType: true,
      },
    },
  };

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
        `Role '${data.roleName}' not found for portal '${data.portalType}'.`,
        404,
      );

    // 4. Securely hash the cleartext password
    const encryptedPassword = await bcrypt.hash(
      data.password,
      this.SALT_ROUNDS,
    );

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
      select: this.memberSelect, // ✅ no passwordHash in response
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
      select: this.memberSelect, // ✅ no passwordHash in response
      orderBy: { createdAt: "desc" },
    });

    return serializeBigInt(members);
  }

  static async getMemberById(schoolId: string | bigint, id: string) {
    const sId = BigInt(schoolId);

    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: this.memberSelect,
    });

    if (!user || user.schoolId !== sId)
      throw new AppError("Member not found.", 404);

    return serializeBigInt(user);
  }

  /**
   * UPDATE: Modifies any core field, shifts roles, or performs password resets
   */
  static async updateMember(schoolId: string | bigint, id: string, data: any) {
    const sId = BigInt(schoolId);

    // 1. Fetch user with their current role relationship
    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) }, // 👈 id only
      include: { role: true },
    });

    // verify belongs to this school
    if (!user || user.schoolId !== sId)
      throw new AppError("Member not found.", 404);

    const updatePayload: any = {};
    if (data.fullName) updatePayload.fullName = data.fullName;
    if (data.email) updatePayload.email = data.email;
    if (data.phoneNumber) updatePayload.phoneNumber = data.phoneNumber;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    // Securely update password if passed
    if (data.password) {
      updatePayload.passwordHash = await bcrypt.hash(
        data.password,
        this.SALT_ROUNDS,
      );
    }

    // 2. Resolve Role ID using same lookup logic as addMember
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
          `Role '${data.roleName}' not found for portal '${resolvedPortalType}'.`,
          404,
        );

      updatePayload.roleId = matchedRole.id;
    }

    // 3. Commit changes
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updatePayload,
      select: this.memberSelect,
    });

    return serializeBigInt(updatedUser);
  }

  /**
   * DELETE: Drops a member profile permanently
   */
  static async deleteMember(
    schoolId: string | bigint,
    email: string,
    requestingUserId: bigint, // ✅ add this
  ) {
    const sId = BigInt(schoolId);

    const user = await prisma.user.findUnique({
      where: { email_schoolId: { email, schoolId: sId } },
    });

    if (!user) throw new AppError("Member not found.", 404);

    // ✅ Block self-delete
    if (user.id === requestingUserId) {
      throw new AppError("You cannot delete your own account.", 403);
    }

    await prisma.user.delete({ where: { id: user.id } });

    return { deleted: true };
  }
}
