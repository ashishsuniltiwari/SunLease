import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { NextRequest } from "next/server";

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: "RWA" | "VENDOR" | "ADMIN" | string;
  name?: string | null;
}

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  "sunlease_super_secret_jwt_key_sprint1_production_ready_2026";

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export const COOKIE_NAME = "token";
export const COOKIE_NAME_ALT = "auth_token";

/**
 * Sign an edge-compatible JWT token using jose
 */
export async function signJWT(payload: AuthUserPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * Verify an edge-compatible JWT token using jose
 */
export async function verifyJWT(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: (payload.userId as string) || (payload.sub as string),
      email: payload.email as string,
      role: (payload.role as string)?.toUpperCase(),
      name: (payload.name as string) ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user from cookies, authorization header, or middleware headers
 */
export async function getAuthUser(
  req: NextRequest | Request
): Promise<AuthUserPayload | null> {
  let token: string | null = null;

  // 1. NextRequest cookies
  if ("cookies" in req && typeof req.cookies?.get === "function") {
    token =
      req.cookies.get(COOKIE_NAME)?.value ||
      req.cookies.get(COOKIE_NAME_ALT)?.value ||
      null;
  }

  // 2. Cookie header
  if (!token) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match =
        cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)) ||
        cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME_ALT}=([^;]+)`));
      if (match) {
        token = match[1];
      }
    }
  }

  // 3. Authorization Bearer header
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 4. Middleware-injected headers
  if (!token) {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    const email = req.headers.get("x-user-email");
    if (userId && role && email) {
      return {
        userId,
        role: role.toUpperCase(),
        email,
        name: req.headers.get("x-user-name"),
      };
    }
    return null;
  }

  return verifyJWT(token);
}
