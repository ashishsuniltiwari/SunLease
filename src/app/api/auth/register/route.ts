import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signJWT, COOKIE_NAME, COOKIE_NAME_ALT } from "@/lib/jwt";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, name } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate or default role
    let assignedRole: Role = Role.RWA;
    if (role) {
      const upperRole = String(role).toUpperCase();
      if (Object.values(Role).includes(upperRole as Role)) {
        assignedRole = upperRole as Role;
      } else {
        return NextResponse.json(
          {
            error: `Invalid role specified. Role must be one of: ${Object.values(
              Role
            ).join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 409 }
      );
    }

    // Hash password using Argon2id
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        name: typeof name === "string" ? name.trim() : null,
      },
    });

    // Sign JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Create response with user info (omit password)
    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      },
      { status: 201 }
    );

    // Issue HttpOnly JWT cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    response.cookies.set(COOKIE_NAME, token, cookieOptions);
    response.cookies.set(COOKIE_NAME_ALT, token, cookieOptions);

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Internal server error." },
      { status: 500 }
    );
  }
}
