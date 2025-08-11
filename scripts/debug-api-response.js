require("dotenv").config({ path: ".env.local" });
const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail:
        "firebase-adminsdk-fbsvc@kelly-fitness-93e58.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

async function simulateAPIResponse() {
  console.log("🔍 Simulating Admin API Response\n");

  try {
    // Get users from Firestore (same as API)
    const usersSnapshot = await adminDb.collection("users").get();
    const chatHistorySnapshot = await adminDb.collection("chatHistory").get();

    // Build user data with statistics (same logic as API)
    const users = [];
    const userChatStats = {};

    // Calculate chat statistics for each user
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

    // Build users array (same as API)
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;
      const stats = userChatStats[uid] || { totalChats: 0, totalMessages: 0 };

      // Check if user is admin
      let isAdmin = false;
      try {
        const userRecord = await adminAuth.getUser(uid);
        isAdmin = userRecord.customClaims?.admin === true;
      } catch (error) {
        // User might not exist in auth, skip admin check
      }

      const apiUser = {
        id: uid,
        uid,
        email: userData.email || "N/A",
        displayName: userData.displayName || null,
        createdAt: userData.createdAt
          ? new Date(userData.createdAt)
          : new Date(),
        lastLogin: userData.lastLogin
          ? new Date(userData.lastLogin)
          : new Date(),
        subscription: userData.subscription || "free",
        isActive: userData.isActive !== false,
        isAdmin,
        status: userData.status || "active", // This is the key field!
        totalChats: stats.totalChats,
        totalMessages: stats.totalMessages,
        dailyMessageCount: userData.dailyMessageCount || 0,
      };

      users.push(apiUser);

      // Log pending users specifically to check API format
      if (
        userData.status === "pending_activation" ||
        userData.email?.includes("pending")
      ) {
        console.log(`📧 API FORMAT - PENDING USER: ${userData.email}`);
        console.log(`   API Object:`, JSON.stringify(apiUser, null, 2));
        console.log("");
      }
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log(`📊 API would return ${users.length} users`);
    const pendingInAPI = users.filter((u) => u.status === "pending_activation");
    console.log(`📊 Pending users in API response: ${pendingInAPI.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

simulateAPIResponse();
