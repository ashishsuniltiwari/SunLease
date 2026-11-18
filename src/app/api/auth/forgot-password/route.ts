import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose/jwt/sign";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  "sunlease_super_secret_jwt_key_sprint1_production_ready_2026";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, name: true },
    });

    // Even if user not found, return generic success to avoid enumeration, but for demo return reset token directly
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been generated.",
      });
    }

    // Sign a 1-hour reset token
    const resetToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      purpose: "password_reset",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(SECRET_KEY);

    const resetUrl = `/reset-password?token=${resetToken}`;

    return NextResponse.json({
      success: true,
      message: "Password reset link has been dispatched.",
      resetUrl,
      resetToken,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
