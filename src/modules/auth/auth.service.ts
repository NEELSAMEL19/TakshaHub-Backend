import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeEmail } from "./auth.helpers.js";
import { AppError } from "../../common/middlewares/AppError.js";
import validate from "../../config/validate.js";
import prisma from "../../config/prisma.js";
import { PortalType } from "@prisma/client";
import { serializeBigInt } from "../../common/utils/utils.js";

const SALT_ROUNDS = Number(validate.BCRYPT_ROUNDS ?? "10");

export class AuthService {
  static createToken(payload: {
    id: bigint;
    schoolId: string;
    role: PortalType;
  }) {
    return jwt.sign(
      {
        id: payload.id.toString(),
        schoolId: payload.schoolId,
        role: payload.role,
      },
      validate.JWT_ACCESS_SECRET,
      {
        expiresIn: "7d",
      },
    );
  }

  static async register(data: any) {
    const email = normalizeEmail(data.email);
    const phoneNumber = data.phoneNumber?.trim() || null;
    const website = data.school?.website?.trim() || null;

    const fieldErrors: Record<string, string> = {};

    if (!data.fullName || data.fullName.trim().length < 2) {
      fieldErrors.fullName = "Full name is required";
    }

    if (!email) {
      fieldErrors.email = "Email is required";
    }

    if (!data.password || data.password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters";
    }

    if (!data.school?.name)
      fieldErrors["school.name"] = "School name is required";

    if (!data.school?.type)
      fieldErrors["school.type"] = "School type is required";

    if (!data.school?.board)
      fieldErrors["school.board"] = "School board is required";

    if (!data.school?.city) fieldErrors["school.city"] = "City is required";

    if (!data.school?.state) fieldErrors["school.state"] = "State is required";

    if (!data.school?.udiseNumber)
      fieldErrors["school.udiseNumber"] = "UDISE number is required";

    if (Object.keys(fieldErrors).length > 0) {
      throw new AppError("Validation failed", 400, fieldErrors);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const existingSchool = await prisma.school.findUnique({
      where: { udiseNumber: data.school.udiseNumber },
    });

    if (existingSchool) {
      throw new AppError("School already exists", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const { school, role, user } = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: data.school.name,
          type: data.school.type,
          board: data.school.board,
          city: data.school.city,
          state: data.school.state,
          website,
          udiseNumber: data.school.udiseNumber,
        },
      });

      const role = await tx.role.create({
        data: {
          schoolId: school.id,
          name: PortalType.ADMIN,
          portalType: PortalType.ADMIN,
        },
      });

      const user = await tx.user.create({
        data: {
          fullName: data.fullName.trim(),
          email,
          passwordHash,
          phoneNumber,
          schoolId: school.id,
          roleId: role.id,
          isVerified: true,
        },
        include: {
          school: true,
          role: true,
        },
      });

      return { school, role, user };
    });

    return serializeBigInt({
      message: "Registered successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
      auth: {
        role: role.portalType,
        schoolId: school.id,
      },
    });
  }

  static async login(data: any) {
    const email = normalizeEmail(data.email);
    const password = data.password;

    const fieldErrors: Record<string, string> = {};

    if (!email) fieldErrors.email = "Email is required";
    if (!password) fieldErrors.password = "Password is required";

    if (Object.keys(fieldErrors).length > 0) {
      throw new AppError("Validation failed", 400, fieldErrors);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email first", 403);
    }

    if (!user.isActive) {
      throw new AppError("Your account is inactive", 403);
    }

    if (!user.role) {
      throw new AppError("No role assigned to user", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = this.createToken({
      id: user.id,
      schoolId: user.schoolId.toString(),
      role: user.role.portalType,
    });

    return serializeBigInt({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
      auth: {
        role: user.role.portalType,
        schoolId: user.schoolId,
      },
      school: {
        id: user.school.id,
        name: user.school.name,
      },
      token,
    });
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        school: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Your account is inactive", 403);
    }

    return serializeBigInt({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
      auth: {
        role: user.role?.portalType,
        schoolId: user.schoolId,
      },
      school: {
        id: user.school.id,
        name: user.school.name,
      },
    });
  }
}
