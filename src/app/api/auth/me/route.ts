import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
}
