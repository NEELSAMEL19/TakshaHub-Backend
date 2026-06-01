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

    static async verifyOtp(data: any) {
    const email = normalizeEmail(data.email);
    const otp = data.otp;

    const OTP_SECRET = env.OTP_SECRET;
    if (!OTP_SECRET) throw new Error("OTP_SECRET missing");

    // 1️⃣ Get user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new AppError("User not found", 404);

    if (user.isVerified) {
      throw new AppError("Already verified", 400);
    }

    // 2️⃣ Redis key
    const otpKey = `verify:otp:${email}`;

    const raw = await redis.get(otpKey);

    if (!raw) {
      throw new AppError("OTP expired. Please resend OTP", 400);
    }

    let otpData: { hash: string; attempts: number; createdAt: number };

    try {
      // Handle both string and already-parsed object from Upstash
      otpData = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (
        !otpData.hash ||
        otpData.attempts === undefined ||
        !otpData.createdAt
      ) {
        throw new Error("Missing required fields");
      }
    } catch (error) {
      await redis.del(otpKey);
      throw new AppError("Invalid OTP data. Please resend OTP", 400);
    }

    // 3️⃣ Expiry check (server-side safety)
    if (Date.now() - otpData.createdAt > 10 * 60 * 1000) {
      await redis.del(otpKey);
      throw new AppError("OTP expired. Please resend OTP", 400);
    }

    // 4️⃣ Hash compare
    const incomingHash = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(`${email}:${otp}`)
      .digest("hex");

    if (incomingHash !== otpData.hash) {
      const attemptsKey = `verify:attempts:${email}`;

      const attempts = await redis.incr(attemptsKey);

      if (attempts === 1) {
        await redis.expire(attemptsKey, 600);
      }

      if (attempts >= 3) {
        await redis.set(`verify:lock:${email}`, "1", { ex: 3600 });
        await redis.del(attemptsKey);
      }

      throw new AppError("Invalid OTP", 400);
    }

    // 5️⃣ Verify user
    await prisma.user.update({
      where: { email: email },
      data: { isVerified: true },
    });

    // 6️⃣ Cleanup
    await redis.del(otpKey);
    await redis.del(`verify:attempts:${email}`);
    return { message: "Email verified successfully" };
  }

  static async resendOtp(data: any) {
    const email = normalizeEmail(data.email);

    if (!env.OTP_SECRET) {
      throw new Error("OTP_SECRET is missing in environment variables");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Already verified", 400);
    }

    // Verify whether the account is currently locked due to too many OTP attempts.
    const isLocked = await redis.get(`verify:lock:${email}`);
    if (isLocked) {
      throw new AppError("Too many attempts. Try again after 1 hour", 429);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hash = crypto
      .createHmac("sha256", env.OTP_SECRET)
      .update(`${email}:${otp}`)
      .digest("hex");

    const otpData = {
      hash,
      attempts: 0,
      createdAt: Date.now(),
    };

    const otpKey = `verify:otp:${email}`;
    await redis.set(otpKey, otpData, { ex: 600 });

    // Send the verification email with the new OTP.
    await sendVerificationEmail(user.email, otp);

    return { message: "OTP resent successfully" };
  }
}
