import { User } from "firebase/auth";

/**
 * 🔒 Client-side Admin Utilities
 * Safe for use in React components (browser environment)
 */

// Bootstrap admin emails for client-side UI checks only
const BOOTSTRAP_ADMIN_EMAILS = [
  "admin@kellyfitness.com",
  "admin@kelly-fitness.com",
  "luandev@kellyfitness.com",
  "taro2255@gmail.com",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
].filter(Boolean);

/**
 * 🚨 CLIENT-SIDE ONLY: Check admin status for UI purposes
 * This is NOT for security - use server-side verification for actual permissions
 */
export function isAdminClientCheck(user: User | null): boolean {
  if (!user?.email) {
    return false;
  }
  return BOOTSTRAP_ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Check if user has admin token via API call
 */
export async function verifyAdminStatus(token: string): Promise<{
  isAdmin: boolean;
  role?: string;
  features?: any;
}> {
  try {
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
    };
  } catch (error) {
    console.error("Admin verification error:", error);
    return { isAdmin: false };
  }
}
