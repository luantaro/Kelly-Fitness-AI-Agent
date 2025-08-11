/**
 * Admin Features and Verification
 */

export interface AdminVerification {
  isAdmin: boolean;
  role?: string;
  features?: any;
  uid?: string;
  email?: string;
}

/**
 * Verify if user has admin token and permissions
 */
export async function verifyAdminToken(
  token: string
): Promise<AdminVerification> {
  try {
    // Call the admin verification API
    const response = await fetch("/api/admin/check", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { isAdmin: false };
    }

    const data = await response.json();
    return {
      isAdmin: data.isAdmin || false,
      role: data.role,
      features: data.features,
      uid: data.uid,
      email: data.email,
    };
  } catch (error) {
    console.error("Admin verification error:", error);
    return { isAdmin: false };
  }
}

/**
 * Simple admin check using Firebase custom claims
 */
export function checkAdminClaims(user: any): AdminVerification {
  if (!user) {
    return { isAdmin: false };
  }

  // Check for admin custom claims (set by Firebase Admin SDK)
  const customClaims = (user as any).customClaims || {};

  return {
    isAdmin: !!customClaims.admin,
    role: customClaims.role,
    features: customClaims.features,
    uid: user.uid,
    email: user.email,
  };
}
