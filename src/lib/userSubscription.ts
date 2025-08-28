import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Create or update user subscription tracking
export async function createUserSubscription(userId: string, email: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    // Check if user is admin
    const isAdmin = await isUserAdmin(userId);

    if (!userDoc.exists) {
      if (isAdmin) {
        // Create admin user record - no trial, direct active
        await userRef.set({
          email,
          subscription: "pro", // Admin gets pro features
          status: "active",
          isActive: true,
          activatedByAdmin: true,
          activatedDate: new Date().toISOString(),
          activatedByAdminId: "system",
          dailyMessageCount: 0,
          lastResetDate: new Date().toISOString().split("T")[0],
          weeklyMenuCount: 0,
          lastMenuDate: null,
          dailyExportCount: 0,
          allowedPersonalities: ["friendly", "professional"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subscriptionStartDate: new Date().toISOString(),
          subscriptionEndDate: null, // No expiry for admin
          subscriptionDurationMonths: -1, // Unlimited
          autoRenew: false,
        });
      } else {
        // Create new user record with 3-day trial
        const now = new Date();
        const trialEndDate = new Date(now);
        trialEndDate.setDate(now.getDate() + 3); // 3 days trial

        await userRef.set({
          email,
          subscription: "trial", // New trial status
          status: "trial", // User status: trial, active, expired
          isActive: true,
          trialStartDate: now.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          activatedByAdmin: false,
          activatedDate: null,
          activatedByAdminId: null,
          dailyMessageCount: 0,
          lastResetDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
          weeklyMenuCount: 0,
          lastMenuDate: null,
          dailyExportCount: 0,
          allowedPersonalities: ["friendly", "professional"], // Default 2 personalities for free
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Subscription duration fields (for admin activation)
          subscriptionStartDate: null,
          subscriptionEndDate: null,
          subscriptionDurationMonths: 0,
          autoRenew: false,
        });
      }
    }
    return userDoc.exists
      ? userDoc.data()
      : await userRef.get().then((doc) => doc.data());
  } catch (error) {
    console.error("Error creating/updating user subscription:", error);
    throw error;
  }
}

// Helper function to check if user is admin
async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userRecord = await adminAuth.getUser(userId);
    return userRecord.customClaims?.admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Check trial status and user access
export async function checkUserAccess(
  userId: string,
  email: string
): Promise<{
  hasAccess: boolean;
  status: "trial" | "active" | "expired" | "pending_activation";
  daysRemaining?: number;
  message?: string;
}> {
  try {
    // Check if user is admin first - admins bypass trial system
    const isAdmin = await isUserAdmin(userId);
    if (isAdmin) {
      return {
        hasAccess: true,
        status: "active",
        message: "🔧 Admin account - Full access",
      };
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new trial user (non-admin only)
      await createUserSubscription(userId, email);
      return {
        hasAccess: true,
        status: "trial",
        daysRemaining: 3,
        message: "🎉 Chào mừng! Bạn có 3 ngày dùng thử miễn phí!",
      };
    }

    const userData = userDoc.data();
    const now = new Date();

    // Check if user is already activated by admin
    if (userData?.activatedByAdmin) {
      const endDate = userData.subscriptionEndDate
        ? new Date(userData.subscriptionEndDate)
        : null;

      // If no end date (unlimited subscription) or subscription is still valid
      if (!endDate || now <= endDate) {
        // Update status to active if needed
        if (userData.status !== "active" || !userData.isActive) {
          await userRef.update({
            status: "active",
            isActive: true,
            updatedAt: now.toISOString(),
          });
        }

        return {
          hasAccess: true,
          status: "active",
          message: "✅ Tài khoản đã được kích hoạt bởi 1FItness AI",
        };
      } else {
        // Subscription expired
        await userRef.update({
          status: "expired",
          isActive: false,
          updatedAt: now.toISOString(),
        });

        return {
          hasAccess: false,
          status: "expired",
          message:
            "❌ Subscription đã hết hạn. Vui lòng liên hệ 1FItness AI để gia hạn.",
        };
      }
    }

    // Check if user has pro subscription (manual admin update)
    if (userData?.subscription === "pro" && userData?.isActive) {
      const endDate = userData.subscriptionEndDate
        ? new Date(userData.subscriptionEndDate)
        : null;

      // If no end date (unlimited) or subscription is still valid
      if (!endDate || now <= endDate) {
        // Auto-activate if needed
        if (!userData.activatedByAdmin) {
          await userRef.update({
            activatedByAdmin: true,
            activatedDate: now.toISOString(),
            status: "active",
            updatedAt: now.toISOString(),
          });
        }

        return {
          hasAccess: true,
          status: "active",
          message: "✅ Tài khoản Pro đã được kích hoạt",
        };
      }
    }

    // Check trial period
    if (userData?.status === "trial") {
      const trialEndDate = new Date(userData.trialEndDate);
      const timeDiff = trialEndDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysRemaining > 0) {
        return {
          hasAccess: true,
          status: "trial",
          daysRemaining,
          message: `⏰ Còn ${daysRemaining} ngày dùng thử miễn phí`,
        };
      } else {
        // Trial expired - update status
        await userRef.update({
          status: "pending_activation",
          isActive: false,
          updatedAt: now.toISOString(),
        });

        return {
          hasAccess: false,
          status: "pending_activation",
          message:
            "⏰ Thời gian dùng thử đã kết thúc. Tài khoản sẽ được 1FItness AI kích hoạt trong thời gian sớm nhất. Vui lòng chờ thông báo!",
        };
      }
    }

    // Default case - no access
    return {
      hasAccess: false,
      status: "pending_activation",
      message:
        "❌ Tài khoản chưa được kích hoạt. Vui lòng chờ 1FItness AI kích hoạt.",
    };
  } catch (error) {
    console.error("Error checking user access:", error);
    throw error;
  }
}

// Admin function to activate user account
export async function activateUserAccount(
  userId: string,
  adminId: string,
  durationMonths: number
): Promise<boolean> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + durationMonths);

    await userRef.update({
      activatedByAdmin: true,
      activatedDate: now.toISOString(),
      activatedByAdminId: adminId,
      status: "active",
      isActive: true,
      subscription: "pro", // Activated users get pro features
      subscriptionStartDate: now.toISOString(),
      subscriptionEndDate: endDate.toISOString(),
      subscriptionDurationMonths: durationMonths,
      updatedAt: now.toISOString(),
    });

    // Log activation
    await adminDb.collection("admin_logs").add({
      action: "user_activated",
      adminId,
      userId,
      durationMonths,
      timestamp: now.toISOString(),
      details: `User activated for ${durationMonths} months`,
    });

    return true;
  } catch (error) {
    console.error("Error activating user account:", error);
    throw error;
  }
}

// Check if user has exceeded daily message limit
export async function checkMessageLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const today = new Date().toISOString().split("T")[0];

    // Reset daily count if it's a new day
    if (userData?.lastResetDate !== today) {
      await userRef.update({
        dailyMessageCount: 0,
        lastResetDate: today,
        dailyExportCount: 0,
      });

      // Update local userData for immediate use
      if (userData) {
        userData.dailyMessageCount = 0;
      }
    }

    // Check limits based on subscription
    const isProUser = userData?.subscription === "pro";
    const dailyLimit = isProUser ? Infinity : 5; // Free users: 5 messages/day, Pro: unlimited
    const currentCount = userData?.dailyMessageCount || 0;

    return {
      allowed: currentCount < dailyLimit,
      remaining: Math.max(0, dailyLimit - currentCount),
    };
  } catch (error) {
    console.error("Error checking message limit:", error);
    throw error;
  }
}

// Increment user's daily message count
export async function incrementMessageCount(userId: string): Promise<void> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const today = new Date().toISOString().split("T")[0];

      // Reset if new day
      if (userData?.lastResetDate !== today) {
        await userRef.update({
          dailyMessageCount: 1,
          lastResetDate: today,
          dailyExportCount: 0,
        });
      } else {
        await userRef.update({
          dailyMessageCount: (userData?.dailyMessageCount || 0) + 1,
        });
      }
    }
  } catch (error) {
    console.error("Error incrementing message count:", error);
    throw error;
  }
}

// Check weekly menu limit for free users
export async function checkMenuLimit(
  userId: string
): Promise<{ allowed: boolean; lastMenuDate: string | null }> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const isProUser = userData?.subscription === "pro";

    // Pro users have unlimited access
    if (isProUser) {
      return { allowed: true, lastMenuDate: null };
    }

    // Free users: 1 menu per week
    const lastMenuDate = userData?.lastMenuDate;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (!lastMenuDate || new Date(lastMenuDate) < oneWeekAgo) {
      return { allowed: true, lastMenuDate };
    }

    return { allowed: false, lastMenuDate };
  } catch (error) {
    console.error("Error checking menu limit:", error);
    throw error;
  }
}

// Update last menu creation date
export async function updateMenuDate(userId: string): Promise<void> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      lastMenuDate: new Date().toISOString(),
      weeklyMenuCount: 1,
    });
  } catch (error) {
    console.error("Error updating menu date:", error);
    throw error;
  }
}

// Check daily export limit
export async function checkExportLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const today = new Date().toISOString().split("T")[0];

    // Reset daily count if it's a new day
    if (userData?.lastResetDate !== today) {
      await userRef.update({
        dailyExportCount: 0,
        lastResetDate: today,
      });

      // Update local userData for immediate use
      if (userData) {
        userData.dailyExportCount = 0;
      }
    }

    const isProUser = userData?.subscription === "pro";
    const dailyLimit = isProUser ? Infinity : 1; // Free: 1 export/day, Pro: unlimited
    const currentCount = userData?.dailyExportCount || 0;

    return {
      allowed: currentCount < dailyLimit,
      remaining: Math.max(0, dailyLimit - currentCount),
    };
  } catch (error) {
    console.error("Error checking export limit:", error);
    throw error;
  }
}

// Increment export count
export async function incrementExportCount(userId: string): Promise<void> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      dailyExportCount: FieldValue.increment(1),
    });
  } catch (error) {
    console.error("Error incrementing export count:", error);
    throw error;
  }
}

// Update user subscription with duration
export async function updateUserSubscriptionWithDuration(
  userId: string,
  subscription: "free" | "pro",
  durationMonths: number = 0,
  autoRenew: boolean = false
): Promise<void> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const now = new Date();

    let updateData: any = {
      subscription,
      updatedAt: now.toISOString(),
      autoRenew,
    };

    if (subscription === "pro" && durationMonths > 0) {
      // Calculate end date
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      updateData = {
        ...updateData,
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        subscriptionDurationMonths: durationMonths,
      };
    } else if (subscription === "free") {
      // Reset subscription dates for free users
      updateData = {
        ...updateData,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        subscriptionDurationMonths: 0,
      };
    }

    await userRef.update(updateData);

    // Log the subscription change
    await adminDb.collection("subscriptionLogs").add({
      userId,
      action: subscription === "pro" ? "upgraded" : "downgraded",
      subscriptionType: subscription,
      durationMonths,
      startDate: updateData.subscriptionStartDate,
      endDate: updateData.subscriptionEndDate,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error updating user subscription with duration:", error);
    throw error;
  }
}

// Check if user subscription has expired
export async function checkSubscriptionExpiry(userId: string): Promise<{
  isValid: boolean;
  isExpired: boolean;
  daysRemaining: number;
  endDate: string | null;
}> {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        isValid: false,
        isExpired: false,
        daysRemaining: 0,
        endDate: null,
      };
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription;
    const endDate = userData?.subscriptionEndDate;

    // Free users always have valid subscription
    if (subscription === "free") {
      return {
        isValid: true,
        isExpired: false,
        daysRemaining: Infinity,
        endDate: null,
      };
    }

    // Pro users without end date (legacy or lifetime)
    if (subscription === "pro" && !endDate) {
      return {
        isValid: true,
        isExpired: false,
        daysRemaining: Infinity,
        endDate: null,
      };
    }

    // Pro users with expiry date
    if (subscription === "pro" && endDate) {
      const now = new Date();
      const expiryDate = new Date(endDate);
      const isExpired = now > expiryDate;
      const daysRemaining = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Auto-downgrade if expired
      if (isExpired) {
        await userRef.update({
          subscription: "free",
          subscriptionStartDate: null,
          subscriptionEndDate: null,
          subscriptionDurationMonths: 0,
          updatedAt: now.toISOString(),
        });

        // Log auto-downgrade
        await adminDb.collection("subscriptionLogs").add({
          userId,
          action: "auto_downgraded",
          subscriptionType: "free",
          reason: "subscription_expired",
          timestamp: now.toISOString(),
        });

        return { isValid: false, isExpired: true, daysRemaining: 0, endDate };
      }

      return { isValid: true, isExpired: false, daysRemaining, endDate };
    }

    return {
      isValid: false,
      isExpired: false,
      daysRemaining: 0,
      endDate: null,
    };
  } catch (error) {
    console.error("Error checking subscription expiry:", error);
    throw error;
  }
}
