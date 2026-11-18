import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      status: true,
    },
  });

  return NextResponse.json({
    authenticated: true,
    user: user || {
      userId: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      name: authUser.name,
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body;

    const updated = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(name !== undefined ? { name: name?.trim() } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("PATCH /api/auth/me error:", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
