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

  // Never intercept, block, or redirect /api/* (including /api/auth/*) to HTML login pages
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Redirect /vendor/marketplace to /dashboard/vendor
  if (pathname === "/vendor/marketplace") {
    return NextResponse.redirect(new URL("/dashboard/vendor", req.url));
  }

  // Only protect /dashboard and portal routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isRwaPortal = pathname.startsWith("/rwa");
  const isVendorPortal = pathname.startsWith("/vendor") && pathname !== "/vendor/verification";
  const isAdminPortal = pathname.startsWith("/admin");

  if (!isDashboardRoute && !isRwaPortal && !isVendorPortal && !isAdminPortal) {
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

  // If no token, redirect to session-expired interstitial (S-04)
  if (!token) {
    const expiredUrl = new URL("/session-expired", req.url);
    expiredUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(expiredUrl);
  }

  // Verify and decode JWT
  const payload = await verifyJWT(token);

  // If invalid or expired token, redirect to session-expired (S-04)
  if (!payload || !payload.role) {
    const expiredUrl = new URL("/session-expired", req.url);
    expiredUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(expiredUrl);
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

  // Check role authorization:
  // RWAs: /dashboard/rwa and /rwa/*
  // Vendors: /dashboard/vendor and /vendor/*
  // Admins: /dashboard/admin and /admin/*
  let isAuthorized = false;

  if (userRole === "RWA" && (pathname.startsWith("/dashboard/rwa") || pathname.startsWith("/rwa"))) {
    isAuthorized = true;
  } else if (
    userRole === "VENDOR" &&
    (pathname.startsWith("/dashboard/vendor") || pathname.startsWith("/vendor"))
  ) {
    isAuthorized = true;
  } else if (
    userRole === "ADMIN" &&
    (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin"))
  ) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    // S-06: Wrong-role attempt -> redirect to dedicated 403 Forbidden screen
    const forbiddenUrl = new URL("/forbidden", req.url);
    forbiddenUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(forbiddenUrl);
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
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/rwa/:path*",
    "/vendor/marketplace",
    "/vendor/bids",
    "/vendor/fleet",
    "/vendor/maintenance",
    "/admin/:path*",
  ],
};
