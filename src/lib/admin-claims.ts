import { adminAuth, adminDb } from "./firebase-admin";

/**
 * 🔒 SECURE: Firebase Custom Claims Admin Management
 * This replaces hardcoded email lists with dynamic Firebase Custom Claims
 * SERVER-SIDE ONLY - Do not import in client components
 */

// Initial admin emails for bootstrapping
const BOOTSTRAP_ADMIN_EMAILS = [
  "admin@kellyfitness.com",
  "admin@kelly-fitness.com",
  "luandev@kellyfitness.com",
  "taro2255@gmail.com",
  process.env.ADMIN_EMAIL,
].filter(Boolean);

/**
 * 🔒 Check if user has admin custom claims
 */
export async function verifyAdminClaims(uid: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error("Error verifying admin claims:", error);
    return false;
  }
}

/**
 * 🔒 Verify admin by email with fallback to custom claims
 */
export async function verifyAdminAccess(
  email: string,
  uid?: string
): Promise<boolean> {
  try {
    // Primary: Check Firebase Custom Claims
    if (uid) {
      const hasAdminClaims = await verifyAdminClaims(uid);
      if (hasAdminClaims) return true;
    }

    // Fallback: Check bootstrap admin list (for initial setup)
    const isBootstrapAdmin = BOOTSTRAP_ADMIN_EMAILS.includes(
      email.toLowerCase()
    );

    // If bootstrap admin, auto-grant custom claims
    if (isBootstrapAdmin && uid) {
      await grantAdminClaims(uid, email);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error verifying admin access:", error);
    return false;
  }
}

/**
 * 🔒 Grant admin custom claims to user
 */
export async function grantAdminClaims(
  uid: string,
  email: string
): Promise<boolean> {
  try {
    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, {
      admin: true,
      adminLevel: "full",
      grantedAt: new Date().toISOString(),
    });

    // Log admin grant action
    await adminDb.collection("adminLogs").add({
      action: "grant_admin_claims",
      targetUserId: uid,
      targetUserEmail: email,
      timestamp: new Date().toISOString(),
      grantedBy: "system",
      level: "full",
    });

    console.log(`✅ Admin claims granted to: ${email}`);
    return true;
  } catch (error) {
    console.error("Error granting admin claims:", error);
    return false;
  }
}

/**
 * 🔒 Revoke admin custom claims from user
 */
export async function revokeAdminClaims(
  uid: string,
  email: string,
  revokedBy: string
): Promise<boolean> {
  try {
    // Remove custom claims
    await adminAuth.setCustomUserClaims(uid, {
      admin: false,
      adminLevel: null,
      revokedAt: new Date().toISOString(),
    });

    // Log admin revoke action
    await adminDb.collection("adminLogs").add({
      action: "revoke_admin_claims",
      targetUserId: uid,
      targetUserEmail: email,
      timestamp: new Date().toISOString(),
      revokedBy: revokedBy,
      reason: "manual_revocation",
    });

    console.log(`🚫 Admin claims revoked from: ${email}`);
    return true;
  } catch (error) {
    console.error("Error revoking admin claims:", error);
    return false;
  }
}

/**
 * 🔒 List all users with admin claims
 */
export async function listAdminUsers(): Promise<
  Array<{ uid: string; email: string; adminLevel: string }>
> {
  try {
    const listUsersResult = await adminAuth.listUsers();
    const adminUsers = listUsersResult.users
      .filter((user) => user.customClaims?.admin === true)
      .map((user) => ({
        uid: user.uid,
        email: user.email || "unknown",
        adminLevel: user.customClaims?.adminLevel || "unknown",
      }));

    return adminUsers;
  } catch (error) {
    console.error("Error listing admin users:", error);
    return [];
  }
}

/**
 * 🔒 Bootstrap admin users on first setup
 */
export async function bootstrapAdminUsers(): Promise<void> {
  try {
    console.log("🚀 Bootstrapping admin users...");

    for (const email of BOOTSTRAP_ADMIN_EMAILS) {
      if (!email) continue; // Skip undefined emails

      try {
        const user = await adminAuth.getUserByEmail(email);
        const hasAdminClaims = await verifyAdminClaims(user.uid);

        if (!hasAdminClaims) {
          await grantAdminClaims(user.uid, email);
          console.log(`✅ Bootstrapped admin: ${email}`);
        } else {
          console.log(`✅ Admin already exists: ${email}`);
        }
      } catch (error) {
        console.log(
          `⚠️ User not found, will be granted admin on first login: ${email}`
        );
      }
    }
  } catch (error) {
    console.error("Error bootstrapping admin users:", error);
  }
}

/**
 * 🔒 Enhanced token verification with custom claims
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
    const decodedToken = await adminAuth.verifyIdToken(idToken, true); // Check revoked tokens

    if (!decodedToken.email) {
      return { isValid: true, isAdmin: false, error: "No email in token" };
    }

    // Check admin access with custom claims priority
    const isAdmin = await verifyAdminAccess(
      decodedToken.email,
      decodedToken.uid
    );

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
