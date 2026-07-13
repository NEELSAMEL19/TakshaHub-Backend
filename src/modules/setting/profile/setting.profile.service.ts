import prisma from "../../../config/prisma.js";
import { AppError } from "../../../common/middlewares/AppError.js";
import { serializeBigInt } from "../../../common/utils/utils.js";
import bcrypt from "bcryptjs";

const safeProfileSelect = {
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
  role: { select: { name: true, portalType: true } },
};

export class ProfileService {
  static async getProfile(userId: string | bigint) {
    const uId = BigInt(userId);

    const user = await prisma.user.findUnique({
      where: { id: uId },
      select: safeProfileSelect,
    });

    if (!user) throw new AppError("Profile not found.", 404);

    return serializeBigInt(user);
  }

  static async updateProfile(
    userId: string | bigint,
    schoolId: string | bigint,
    data: any,
  ) {
    const uId = BigInt(userId);
    const sId = BigInt(schoolId);

    const user = await prisma.user.findUnique({ where: { id: uId } });
    if (!user) throw new AppError("Profile not found.", 404);

    const updatePayload: any = {};

    if (data.fullName) updatePayload.fullName = data.fullName;
    if (data.phoneNumber) updatePayload.phoneNumber = data.phoneNumber;

    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email_schoolId: { email: data.email, schoolId: sId } },
      });
      if (existingUser)
        throw new AppError(
          "A user with this email is already registered at this school.",
          409,
        );
      updatePayload.email = data.email;
      // Optional: force re-verification on email change
      updatePayload.isVerified = false;
    }

    if (data.newPassword) {
      const isMatch = await bcrypt.compare(
        data.currentPassword,
        user.passwordHash,
      );
      if (!isMatch) throw new AppError("Current password is incorrect.", 401);

      updatePayload.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    if (Object.keys(updatePayload).length === 0)
      throw new AppError("No valid fields provided to update.", 400);

    const updatedUser = await prisma.user.update({
      where: { id: uId },
      data: updatePayload,
      select: safeProfileSelect,
    });

    return serializeBigInt(updatedUser);
  }
}
