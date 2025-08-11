#!/usr/bin/env node

/**
 * 🔐 SECURITY UPDATE: Debug User Data Script
 * Now uses secure environment variables instead of hardcoded credentials
 */

const { getSecureFirebaseServices } = require("./firebase-secure");

// Get secure Firebase services
const { adminAuth, adminDb } = getSecureFirebaseServices();

async function debugUserData() {
  console.log("🔍 Debug: Admin API User Data\n");

  try {
    // Get users from Firestore (same as API)
    const usersSnapshot = await adminDb.collection("users").get();

    console.log(`Found ${usersSnapshot.docs.length} users in Firestore\n`);

    const users = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;

      // Check if user is admin
      let isAdmin = false;
      try {
        const userRecord = await adminAuth.getUser(uid);
        isAdmin = userRecord.customClaims?.admin === true;
      } catch (error) {
        // User might not exist in auth, skip admin check
      }

      const user = {
        uid,
        email: userData.email || "N/A",
        displayName: userData.displayName || null,
        status: userData.status || "active",
        subscriptionStatus: userData.subscriptionStatus || "free",
        isActive: userData.isActive !== false,
        isAdmin,
      };

      users.push(user);

      // Log pending users specifically
      if (
        userData.status === "pending_activation" ||
        userData.email?.includes("pending")
      ) {
        console.log(`📧 PENDING USER: ${userData.email}`);
        console.log(`   Status: ${userData.status || "undefined"}`);
        console.log(
          `   Subscription Status: ${
            userData.subscriptionStatus || "undefined"
          }`
        );
        console.log(`   Is Active: ${userData.isActive !== false}`);
        console.log(`   Is Admin: ${isAdmin}`);
        console.log(
          `   Trial End: ${
            userData.trialEndDate ? userData.trialEndDate.toDate() : "undefined"
          }`
        );
        console.log(`   UID: ${uid}`);
        console.log("");
      }
    }

    // Show summary
    const pendingUsers = users.filter((u) => u.status === "pending_activation");
    const trialUsers = users.filter((u) => u.status === "trial");
    const activeUsers = users.filter((u) => u.status === "active");

    console.log("📊 User Status Summary:");
    console.log(`   Pending Activation: ${pendingUsers.length}`);
    console.log(`   Trial: ${trialUsers.length}`);
    console.log(`   Active: ${activeUsers.length}`);
    console.log(`   Total: ${users.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugUserData();
