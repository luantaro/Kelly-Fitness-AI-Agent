import { adminAuth } from "./firebase-admin";

// Server-side admin utilities - SECURE METHODS ONLY
const ADMIN_EMAILS = [
  "admin@onefitness.ai",
  "admin@1fitness.ai",
  "luandev@onefitness.ai",
  "taro2255@gmail.com",
  "test@example.com",
  "admin@example.com",
  process.env.ADMIN_EMAIL,
].filter(Boolean);

/**
 * 🔒 SECURE: Server-side admin verification
 * This function should ONLY be used in API routes (server-side)
 */
export async function verifyAdminAccess(email: string): Promise<boolean> {
  try {
    if (!email) return false;

    // Primary check: Firebase Custom Claims
    try {
      const user = await adminAuth.getUserByEmail(email);
      if (user.customClaims?.admin === true) {
        return true;
      }
    } catch (error) {
      // User might not exist, continue to email check
    }

    // Fallback: Email whitelist check
    return ADMIN_EMAILS.includes(email.toLowerCase());
  } catch (error) {
    console.error("Error verifying admin access:", error);
    return false;
  }
}

/**
 * 🔒 SECURE: Verify token and admin access in one step
 */
export async function verifyAdminToken(authHeader: string | null): Promise<{
  isValid: boolean;
  isAdmin: boolean;
  user?: any;
  error?: string;
}> {
  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return { isValid: false, isAdmin: false, error: "No Bearer token" };
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email) {
      return { isValid: true, isAdmin: false, error: "No email in token" };
    }

    const isAdmin = await verifyAdminAccess(decodedToken.email);

    return {
      isValid: true,
      isAdmin,
      user: decodedToken,
      error: isAdmin ? undefined : "Not an admin user",
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return {
      isValid: false,
      isAdmin: false,
      error:
        error instanceof Error ? error.message : "Token verification failed",
    };
  }
}

/**
 * 🔒 SECURE: Set admin custom claims
 */
export async function setAdminClaims(email: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    return true;
  } catch (error) {
    console.error("Error setting admin claims:", error);
    return false;
  }
}

/**
 * 🔒 SECURE: Remove admin custom claims
 */
export async function removeAdminClaims(email: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.setCustomUserClaims(user.uid, { admin: false });
    return true;
  } catch (error) {
    console.error("Error removing admin claims:", error);
    return false;
  }
}
