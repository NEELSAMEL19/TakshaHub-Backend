import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeEmail } from "./auth.helpers.js";
import { AppError } from "../common/middlewares/AppError.js";
import validate from "../config/validate.js";
import prisma from "../config/prisma.js";
import { MemberRole } from "@prisma/client";
import { serializeBigInt } from "../common/utils/utils.js";

const SALT_ROUNDS = Number(validate.BCRYPT_ROUNDS ?? "10");

export class AuthService {
  static createToken(payload: {
    id: bigint;
    schoolId?: string;
    role: MemberRole;
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

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new AppError("Email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email,
        passwordHash,
        phoneNumber: data.phoneNumber ?? null,
        isVerified: true,
      },
    });

    const school = await prisma.school.create({
      data: {
        name: data.school.name,
        type: data.school.type,
        board: data.school.board,
        city: data.school.city,
        state: data.school.state,
        website: data.school.website ?? null,
        udiseNumber: data.school.udiseNumber,
      },
    });

    await prisma.member.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        role: MemberRole.ADMIN,
      },
    });

    return {
      message: "Registered successfully",
    };
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
        member: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email first", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const activeMember = user.member[0];

    if (!activeMember) {
      throw new AppError("No school assigned to user", 403);
    }

    const token = this.createToken({
      id: user.id,
      schoolId: activeMember.schoolId.toString(),
      role: activeMember.role,
    });

    return serializeBigInt({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
      auth: {
        role: activeMember.role,
        schoolId: activeMember.schoolId,
      },
      token,
    });
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        member: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const activeMember = user.member[0];

    return serializeBigInt({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      auth: {
        role: activeMember?.role,
        schoolId: activeMember?.schoolId,
      },
    });
  }
}
