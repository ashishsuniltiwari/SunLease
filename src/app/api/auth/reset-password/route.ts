import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose/jwt/verify";
import { hashPassword } from "@/lib/password";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  "sunlease_super_secret_jwt_key_sprint1_production_ready_2026";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Reset token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    let payload: any;
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      payload = verified.payload;
    } catch {
      return NextResponse.json(
        { error: "Reset token is invalid or has expired" },
        { status: 400 }
      );
    }

    if (payload.purpose !== "password_reset" || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid token payload for password reset" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now sign in.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password", details: error.message },
      { status: 500 }
    );
  }
}
