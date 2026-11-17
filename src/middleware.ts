import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, COOKIE_NAME, COOKIE_NAME_ALT } from "@/lib/jwt";

// Role-to-dashboard mappings
const ROLE_DASHBOARDS: Record<string, string> = {
  RWA: "/dashboard/rwa",
  VENDOR: "/dashboard/vendor",
  ADMIN: "/dashboard/admin",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Extract JWT from cookies or Authorization header
  const tokenFromCookie =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.cookies.get(COOKIE_NAME_ALT)?.value;

  const authHeader = req.headers.get("authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const token = tokenFromCookie || tokenFromHeader;

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify and decode JWT
  const payload = await verifyJWT(token);

  // If invalid or expired token, redirect to login
  if (!payload || !payload.role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = payload.role.toUpperCase();
  const allowedDashboard = ROLE_DASHBOARDS[userRole];

  // If unknown role, send to login
  if (!allowedDashboard) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user visits /dashboard root, redirect them to their specific role dashboard
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL(allowedDashboard, req.url));
  }

  // Role-Based Access Control (RBAC):
  // RWAs can ONLY access /dashboard/rwa
  // Vendors can ONLY access /dashboard/vendor
  // Admins can ONLY access /dashboard/admin
  const isAccessingAllowedDashboard = pathname.startsWith(allowedDashboard);

  if (!isAccessingAllowedDashboard) {
    // If attempting to access unauthorized dashboard route, redirect to their assigned dashboard
    return NextResponse.redirect(new URL(allowedDashboard, req.url));
  }

  // Attach decoded user info to request headers for downstream server components / routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", userRole);
  if (payload.name) {
    requestHeaders.set("x-user-name", payload.name);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
