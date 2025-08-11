import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// 🎯 Free User Limits Configuration
export const FREE_USER_LIMITS = {
  // Chat với AI: Không giới hạn (unlimited)
  DAILY_CHAT_MESSAGES: Infinity,

  // Tạo thực đơn: 2 lượt/tháng - reset đầu tháng
  MONTHLY_MENU_CREATION: 2,

  // Export thực đơn: Có thể giới hạn nếu cần
  DAILY_EXPORTS: 5,
} as const;

export const PRO_USER_LIMITS = {
  DAILY_CHAT_MESSAGES: Infinity,
  MONTHLY_MENU_CREATION: Infinity,
  DAILY_EXPORTS: Infinity,
} as const;

// 📊 User Usage Tracking Interface
export interface UserUsage {
  userId: string;
  email: string;
  subscription: "free" | "pro";

  // Chat usage (removed limits for free users)
  dailyChatCount: number;
  lastChatResetDate: string; // YYYY-MM-DD

  // Menu creation usage (2/month for free)
  monthlyMenuCount: number;
  lastMenuResetDate: string; // YYYY-MM format

  // Export usage
  dailyExportCount: number;
  lastExportResetDate: string; // YYYY-MM-DD

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// 🔄 Initialize or get user usage tracking
export async function getUserUsage(
  userId: string,
  email: string
): Promise<UserUsage> {
  try {
    const userRef = adminDb.collection("userUsage").doc(userId);
    const userDoc = await userRef.get();

    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    if (!userDoc.exists) {
      // Create new user usage record
      const newUsage: UserUsage = {
        userId,
        email,
        subscription: "free", // Default to free

        dailyChatCount: 0,
        lastChatResetDate: today,

        monthlyMenuCount: 0,
        lastMenuResetDate: currentMonth,

        dailyExportCount: 0,
        lastExportResetDate: today,

        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await userRef.set(newUsage);
      return newUsage;
    }

    const userData = userDoc.data() as UserUsage;
    let needsUpdate = false;

    // Reset daily chat count if new day
    if (userData.lastChatResetDate !== today) {
      userData.dailyChatCount = 0;
      userData.lastChatResetDate = today;
      needsUpdate = true;
    }

    // Reset monthly menu count if new month
    if (userData.lastMenuResetDate !== currentMonth) {
      userData.monthlyMenuCount = 0;
      userData.lastMenuResetDate = currentMonth;
      needsUpdate = true;
      console.log(
        `🔄 Monthly menu count reset for user ${userId} - New month: ${currentMonth}`
      );
    }

    // Reset daily export count if new day
    if (userData.lastExportResetDate !== today) {
      userData.dailyExportCount = 0;
      userData.lastExportResetDate = today;
      needsUpdate = true;
    }

    if (needsUpdate) {
      userData.updatedAt = now.toISOString();
      await userRef.update(userData as any);
    }

    return userData;
  } catch (error) {
    console.error("Error getting user usage:", error);
    throw error;
  }
}

// 💬 Check chat limit (now unlimited for free users)
export async function checkChatLimit(
  userId: string,
  email: string
): Promise<{
  allowed: boolean;
  remaining: number;
  isUnlimited: boolean;
}> {
  try {
    const usage = await getUserUsage(userId, email);

    // Chat is now unlimited for all users
    return {
      allowed: true,
      remaining: Infinity,
      isUnlimited: true,
    };
  } catch (error) {
    console.error("Error checking chat limit:", error);
    throw error;
  }
}

// 🍽️ Check menu creation limit (2/month for free users)
export async function checkMenuLimit(
  userId: string,
  email: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetDate: string;
  currentUsage: number;
  maxUsage: number;
}> {
  try {
    const usage = await getUserUsage(userId, email);

    const isPro = usage.subscription === "pro";
    const maxUsage = isPro ? Infinity : FREE_USER_LIMITS.MONTHLY_MENU_CREATION;
    const currentUsage = usage.monthlyMenuCount;
    const remaining = isPro ? Infinity : Math.max(0, maxUsage - currentUsage);

    // Calculate reset date (first day of next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const resetDate = nextMonth.toISOString().split("T")[0];

    return {
      allowed: isPro || currentUsage < maxUsage,
      remaining,
      resetDate,
      currentUsage,
      maxUsage: isPro ? -1 : maxUsage, // -1 indicates unlimited
    };
  } catch (error) {
    console.error("Error checking menu limit:", error);
    throw error;
  }
}

// 📤 Check export limit
export async function checkExportLimit(
  userId: string,
  email: string
): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  try {
    const usage = await getUserUsage(userId, email);

    const isPro = usage.subscription === "pro";
    const maxUsage = isPro ? Infinity : FREE_USER_LIMITS.DAILY_EXPORTS;
    const currentUsage = usage.dailyExportCount;
    const remaining = isPro ? Infinity : Math.max(0, maxUsage - currentUsage);

    return {
      allowed: isPro || currentUsage < maxUsage,
      remaining,
    };
  } catch (error) {
    console.error("Error checking export limit:", error);
    throw error;
  }
}

// 📈 Increment usage counters
export async function incrementMenuUsage(userId: string): Promise<void> {
  try {
    const userRef = adminDb.collection("userUsage").doc(userId);
    await userRef.update({
      monthlyMenuCount: FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    });
    console.log(`📈 Menu usage incremented for user ${userId}`);
  } catch (error) {
    console.error("Error incrementing menu usage:", error);
    throw error;
  }
}

export async function incrementChatUsage(userId: string): Promise<void> {
  try {
    const userRef = adminDb.collection("userUsage").doc(userId);
    await userRef.update({
      dailyChatCount: FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error incrementing chat usage:", error);
    throw error;
  }
}

export async function incrementExportUsage(userId: string): Promise<void> {
  try {
    const userRef = adminDb.collection("userUsage").doc(userId);
    await userRef.update({
      dailyExportCount: FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error incrementing export usage:", error);
    throw error;
  }
}

// 🔄 Update user subscription type
export async function updateUserSubscription(
  userId: string,
  subscription: "free" | "pro"
): Promise<void> {
  try {
    const userRef = adminDb.collection("userUsage").doc(userId);
    await userRef.update({
      subscription,
      updatedAt: new Date().toISOString(),
    });
    console.log(
      `🔄 Updated subscription for user ${userId} to ${subscription}`
    );
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }
}
