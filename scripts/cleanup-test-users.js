#!/usr/bin/env node

/**
 * Firebase User Cleanup Script
 *
 * Xóa tất cả users trừ admin account taro2255@gmail.com
 *
 * Usage:
 *   node scripts/cleanup-test-users.js
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
require("dotenv").config({ path: ".env.local" });

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail:
      "firebase-adminsdk-fbsvc@kelly-fitness-93e58.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID || "kelly-fitness-93e58",
};

const app = !getApps().length
  ? initializeApp(firebaseAdminConfig)
  : getApps()[0];
const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

// Admin email to keep
const ADMIN_EMAIL = "taro2255@gmail.com";

/**
 * Get all users from Firebase Auth
 */
async function getAllUsers() {
  const users = [];
  let pageToken;

  do {
    try {
      const listUsersResult = await adminAuth.listUsers(1000, pageToken);
      users.push(...listUsersResult.users);
      pageToken = listUsersResult.pageToken;
    } catch (error) {
      console.error("Error listing users:", error);
      break;
    }
  } while (pageToken);

  return users;
}

/**
 * Delete user from Firebase Auth
 */
async function deleteUserFromAuth(uid) {
  try {
    await adminAuth.deleteUser(uid);
    console.log(`✅ Deleted user from Auth: ${uid}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete user from Auth ${uid}:`, error);
    return false;
  }
}

/**
 * Delete user profile from Firestore
 */
async function deleteUserFromFirestore(uid) {
  try {
    // Delete user profile
    await adminDb.collection("users").doc(uid).delete();
    console.log(`✅ Deleted user profile from Firestore: ${uid}`);

    // Delete user's chat history
    const chatHistoryQuery = await adminDb
      .collection("chatHistory")
      .where("userId", "==", uid)
      .get();

    if (!chatHistoryQuery.empty) {
      const batch = adminDb.batch();
      chatHistoryQuery.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(
        `✅ Deleted ${chatHistoryQuery.docs.length} chat history records for: ${uid}`
      );
    }

    return true;
  } catch (error) {
    console.error(
      `❌ Failed to delete user data from Firestore ${uid}:`,
      error
    );
    return false;
  }
}

/**
 * Main cleanup function
 */
async function cleanupTestUsers() {
  console.log("🚀 Starting Firebase user cleanup...");
  console.log(`🔒 Admin account to keep: ${ADMIN_EMAIL}`);
  console.log("");

  try {
    // Get all users
    console.log("📋 Fetching all users...");
    const users = await getAllUsers();
    console.log(`📊 Found ${users.length} total users`);

    // Filter users to delete (exclude admin)
    const usersToDelete = users.filter((user) => user.email !== ADMIN_EMAIL);
    const adminUser = users.find((user) => user.email === ADMIN_EMAIL);

    console.log("");
    console.log("📋 Cleanup Summary:");
    console.log(
      `   🔒 Admin to keep: ${adminUser ? adminUser.email : "NOT FOUND"}`
    );
    console.log(`   🗑️  Users to delete: ${usersToDelete.length}`);
    console.log("");

    if (!adminUser) {
      console.warn("⚠️  WARNING: Admin user not found in Firebase Auth!");
      console.log(
        "   Make sure taro2255@gmail.com has logged in at least once."
      );
    }

    if (usersToDelete.length === 0) {
      console.log("✅ No users to delete. Only admin account exists.");
      return;
    }

    // Show users to be deleted
    console.log("👥 Users to be deleted:");
    usersToDelete.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email || "No email"} (${user.uid})`);
    });

    console.log("");
    console.log(
      "⚠️  THIS WILL PERMANENTLY DELETE ALL TEST USERS AND THEIR DATA!"
    );
    console.log("   - Firebase Auth accounts");
    console.log("   - User profiles in Firestore");
    console.log("   - Chat history");
    console.log("");

    // In a real scenario, you might want to add a confirmation prompt here
    // For automation, we'll proceed directly

    console.log("🗑️  Starting deletion process...");
    console.log("");

    let deletedCount = 0;
    let failedCount = 0;

    for (const user of usersToDelete) {
      console.log(`🔄 Processing: ${user.email || "No email"} (${user.uid})`);

      // Delete from Firestore first
      const firestoreSuccess = await deleteUserFromFirestore(user.uid);

      // Then delete from Auth
      const authSuccess = await deleteUserFromAuth(user.uid);

      if (authSuccess && firestoreSuccess) {
        deletedCount++;
        console.log(`✅ Successfully deleted: ${user.email || user.uid}`);
      } else {
        failedCount++;
        console.log(`❌ Failed to delete: ${user.email || user.uid}`);
      }

      console.log("");
    }

    console.log("🎉 Cleanup completed!");
    console.log("");
    console.log("📊 Final Summary:");
    console.log(`   ✅ Successfully deleted: ${deletedCount} users`);
    console.log(`   ❌ Failed to delete: ${failedCount} users`);
    console.log(`   🔒 Admin account preserved: ${ADMIN_EMAIL}`);
    console.log("");

    if (failedCount > 0) {
      console.log(
        "⚠️  Some users could not be deleted. Check the errors above."
      );
    } else {
      console.log("🎯 All test users have been successfully removed!");
    }
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

/**
 * Show current user count
 */
async function showUserStats() {
  try {
    const users = await getAllUsers();
    const adminUsers = users.filter((user) => user.email === ADMIN_EMAIL);
    const testUsers = users.filter((user) => user.email !== ADMIN_EMAIL);

    console.log("📊 Current Firebase Users:");
    console.log(`   👑 Admin users: ${adminUsers.length}`);
    console.log(`   🧪 Test users: ${testUsers.length}`);
    console.log(`   📊 Total users: ${users.length}`);
    console.log("");

    if (testUsers.length > 0) {
      console.log("🧪 Test users found:");
      testUsers.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.email || "No email"} (created: ${
            user.metadata.creationTime
          })`
        );
      });
    }
  } catch (error) {
    console.error("Error getting user stats:", error);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--stats") || args.includes("-s")) {
    showUserStats()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
      });
  } else if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Firebase User Cleanup Script

Usage:
  node scripts/cleanup-test-users.js          Run cleanup
  node scripts/cleanup-test-users.js --stats  Show current user statistics
  node scripts/cleanup-test-users.js --help   Show this help

⚠️  WARNING: This will permanently delete all users except ${ADMIN_EMAIL}
    `);
    process.exit(0);
  } else {
    cleanupTestUsers()
      .then(() => {
        console.log("✅ Script completed successfully!");
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
      });
  }
}

module.exports = { cleanupTestUsers, showUserStats };
