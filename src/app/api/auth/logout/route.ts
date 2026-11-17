import { NextResponse } from "next/server";
import { COOKIE_NAME, COOKIE_NAME_ALT } from "@/lib/jwt";

function clearAuthCookies(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set(COOKIE_NAME_ALT, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
  clearAuthCookies(response);
  return response;
}

export async function GET(req: Request) {
  const url = new URL("/login", req.url);
  const response = NextResponse.redirect(url);
  clearAuthCookies(response);
  return response;
}
