import bcrypt from "bcryptjs";
import { normalizeEmail } from "./auth.helpers.js";
import { AppError } from "../common/middlewares/AppError.js";
import env from "../../src/config/env.js";
import prisma from "../config/prisma";
import crypto from "crypto";
import { MemberRole } from "@prisma/client";
import { redis } from "../config/redis.js";
import { sendVerificationEmail } from "../common/utils/sendVerificationEmail.js";

const SALT_ROUNDS = Number(env.BCRYPT_ROUNDS ?? "10");

export class AuthService {
  static async register(data: any) {
    const email = normalizeEmail(data.email);

    // 1️⃣ Check existing user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user?.isVerified) {
      throw new AppError("Email already exists", 409);
    }

    // 2️⃣ Create user if not exists
    if (!user) {
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

      user = await prisma.user.create({
        data: {
          fullName: data.fullName,
          email,
          passwordHash,
          phoneNumber: data.phoneNumber ?? null,
          isVerified: false,
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
    }

    // 3️⃣ OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `verify:otp:${email}`;

    const otpHash = crypto
      .createHmac("sha256", env.OTP_SECRET)
      .update(`${email}:${otp}`)
      .digest("hex");

    // 4️⃣ Store OTP
    const otpData = {
      hash: otpHash,
      attempts: 0,
      createdAt: Date.now(),
    };

    await redis.set(otpKey, otpData, { ex: 600 });

    // 5️⃣ Send email
    await sendVerificationEmail(email, otp);

    return {
      message: "OTP sent successfully. Please verify your email.",
    };
  }
}
