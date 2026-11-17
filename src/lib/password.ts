import bcrypt from "bcryptjs";

/**
 * Hash password using bcryptjs (pure JavaScript for Vercel serverless compatibility)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password against a bcrypt hash
 */
export async function verifyPassword(
  hash: string,
  plain: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
