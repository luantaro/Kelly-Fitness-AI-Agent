import { adminDb } from "./firebase-admin";

/**
 * 🚀 Database Operation Utilities
 * Common database operations to reduce code duplication
 */

export interface BatchOperation {
  type: "create" | "update" | "delete";
  collection: string;
  docId: string;
  data?: any;
}

/**
 * Execute multiple database operations in a batch
 */
export async function executeBatch(
  operations: BatchOperation[]
): Promise<void> {
  const batch = adminDb.batch();

  for (const op of operations) {
    const docRef = adminDb.collection(op.collection).doc(op.docId);

    switch (op.type) {
      case "create":
        batch.set(docRef, op.data);
        break;
      case "update":
        batch.update(docRef, op.data);
        break;
      case "delete":
        batch.delete(docRef);
        break;
    }
  }

  await batch.commit();
}

/**
 * Get user data with chat statistics
 */
export async function getUserWithStats(userId: string) {
  const [userDoc, chatHistorySnapshot] = await Promise.all([
    adminDb.collection("users").doc(userId).get(),
    adminDb.collection("chatHistory").where("userId", "==", userId).get(),
  ]);

  const userData = userDoc.data();
  const totalChats = chatHistorySnapshot.size;
  let totalMessages = 0;

  chatHistorySnapshot.forEach((doc) => {
    const chatData = doc.data();
    if (chatData.messages && Array.isArray(chatData.messages)) {
      totalMessages += chatData.messages.length;
    }
  });

  return {
    ...userData,
    totalChats,
    totalMessages,
    uid: userId,
  };
}

/**
 * Get all users with chat statistics (optimized)
 */
export async function getAllUsersWithStats() {
  const [usersSnapshot, chatHistorySnapshot] = await Promise.all([
    adminDb.collection("users").get(),
    adminDb.collection("chatHistory").get(),
  ]);

  // Build chat statistics lookup
  const userChatStats: {
    [uid: string]: { totalChats: number; totalMessages: number };
  } = {};

  chatHistorySnapshot.forEach((doc) => {
    const chatData = doc.data();
    const userId = chatData.userId;

    if (!userChatStats[userId]) {
      userChatStats[userId] = { totalChats: 0, totalMessages: 0 };
    }

    userChatStats[userId].totalChats++;
    if (chatData.messages && Array.isArray(chatData.messages)) {
      userChatStats[userId].totalMessages += chatData.messages.length;
    }
  });

  // Combine user data with statistics
  return usersSnapshot.docs.map((doc) => {
    const userData = doc.data();
    const uid = doc.id;
    const stats = userChatStats[uid] || { totalChats: 0, totalMessages: 0 };

    return {
      id: uid,
      uid,
      email: userData.email || "N/A",
      displayName: userData.displayName || null,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
      subscription: userData.subscription || "free",
      isActive: userData.isActive !== false,
      status: userData.status || "active",
      totalChats: stats.totalChats,
      totalMessages: stats.totalMessages,
      dailyMessageCount: userData.dailyMessageCount || 0,
      subscriptionStartDate: userData.subscriptionStartDate || null,
      subscriptionEndDate: userData.subscriptionEndDate || null,
      subscriptionDurationMonths: userData.subscriptionDurationMonths || 0,
      trialStartDate: userData.trialStartDate || null,
      trialEndDate: userData.trialEndDate || null,
      activatedByAdmin: userData.activatedByAdmin || false,
      activatedDate: userData.activatedDate || null,
      activatedByAdminId: userData.activatedByAdminId || null,
    };
  });
}

/**
 * Delete user and all associated data
 */
export async function deleteUserCompletely(userId: string, adminEmail: string) {
  // Get user data for logging
  const userDoc = await adminDb.collection("users").doc(userId).get();
  const userData = userDoc.data();

  // Get all chat history for this user
  const chatHistoryQuery = await adminDb
    .collection("chatHistory")
    .where("userId", "==", userId)
    .get();

  // Prepare batch operations
  const operations: BatchOperation[] = [
    // Delete user document
    { type: "delete", collection: "users", docId: userId },
    // Log admin action
    {
      type: "create",
      collection: "adminLogs",
      docId: adminDb.collection("adminLogs").doc().id,
      data: {
        action: "deleteUser",
        targetUserId: userId,
        deletedUserData: userData,
        adminUser: adminEmail,
        timestamp: new Date(),
      },
    },
  ];

  // Add chat history deletions to batch
  chatHistoryQuery.docs.forEach((doc) => {
    operations.push({
      type: "delete",
      collection: "chatHistory",
      docId: doc.id,
    });
  });

  // Execute all operations in batch
  await executeBatch(operations);

  return {
    deletedChatRecords: chatHistoryQuery.size,
    userData,
  };
}

/**
 * Log admin actions consistently
 */
export async function logAdminAction(
  action: string,
  adminUid: string,
  adminEmail: string,
  targetData?: any
) {
  await adminDb.collection("adminLogs").add({
    action,
    adminUid,
    adminEmail,
    targetData,
    timestamp: new Date(),
  });
}

/**
 * Update user subscription with proper logging
 */
export async function updateUserSubscription(
  userId: string,
  subscriptionData: any,
  adminUid: string,
  adminEmail: string
) {
  const updateData = {
    ...subscriptionData,
    updatedAt: new Date(),
    lastUpdatedBy: adminUid,
  };

  const operations: BatchOperation[] = [
    // Update user document
    { type: "update", collection: "users", docId: userId, data: updateData },
    // Log admin action
    {
      type: "create",
      collection: "adminLogs",
      docId: adminDb.collection("adminLogs").doc().id,
      data: {
        action: "updateSubscription",
        targetUserId: userId,
        subscriptionData,
        adminUid,
        adminEmail,
        timestamp: new Date(),
      },
    },
  ];

  await executeBatch(operations);
  return updateData;
}
