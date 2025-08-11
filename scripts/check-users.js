#!/usr/bin/env node

/**
 * Firebase User Info Checker
 *
 * Script để kiểm tra thông tin users trong Firebase
 *
 * Usage:
 *   node scripts/check-users.js
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

/**
 * Check all users in the system
 */
async function checkAllUsers() {
  try {
    console.log("🔍 Checking all users in Firebase...\n");

    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection("users").get();

    if (usersSnapshot.empty) {
      console.log("❌ No users found in Firestore");
      return;
    }

    console.log(`📊 Found ${usersSnapshot.size} users in Firestore:\n`);
    console.log("════════════════════════════════════════════════════════════");

    let proUsers = 0;
    let freeUsers = 0;
    let activeUsers = 0;

    usersSnapshot.forEach((doc, index) => {
      const userData = doc.data();
      const isExpired = userData.subscriptionEndDate
        ? new Date(userData.subscriptionEndDate) < new Date()
        : false;

      console.log(`👤 User ${index + 1}:`);
      console.log(`   🆔 UID: ${userData.uid}`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   📛 Name: ${userData.displayName || "Not set"}`);
      console.log(
        `   ⭐ Subscription: ${userData.subscription?.toUpperCase()}`
      );
      console.log(`   ✅ Active: ${userData.isActive ? "✅ Yes" : "❌ No"}`);
      console.log(`   💬 Messages today: ${userData.dailyMessageCount || 0}`);

      if (userData.subscription === "pro") {
        console.log(
          `   📅 Pro valid until: ${
            userData.subscriptionEndDate
              ? new Date(userData.subscriptionEndDate).toDateString()
              : "Not set"
          }`
        );
        console.log(`   ⏰ Status: ${isExpired ? "🔴 EXPIRED" : "🟢 ACTIVE"}`);
        proUsers++;
      } else {
        freeUsers++;
      }

      if (userData.isActive) activeUsers++;

      console.log("");
    });

    console.log("📈 Summary Statistics:");
    console.log("════════════════════════════════════════");
    console.log(`👥 Total Users: ${usersSnapshot.size}`);
    console.log(`✅ Active Users: ${activeUsers}`);
    console.log(`⭐ Pro Users: ${proUsers}`);
    console.log(`🆓 Free Users: ${freeUsers}`);

    return {
      total: usersSnapshot.size,
      active: activeUsers,
      pro: proUsers,
      free: freeUsers,
    };
  } catch (error) {
    console.error("❌ Error checking users:", error);
    throw error;
  }
}

/**
 * Check specific user by email
 */
async function checkUserByEmail(email) {
  try {
    console.log(`🔍 Checking user: ${email}\n`);

    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    console.log(`✅ Found in Firebase Auth:`);
    console.log(`   🆔 UID: ${userRecord.uid}`);
    console.log(`   📧 Email: ${userRecord.email}`);
    console.log(`   ✅ Verified: ${userRecord.emailVerified}`);

    // Get user profile from Firestore
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log(`\n✅ Found in Firestore:`);
      console.log(`   ⭐ Subscription: ${userData.subscription}`);
      console.log(`   ✅ Active: ${userData.isActive}`);
      console.log(`   💬 Messages today: ${userData.dailyMessageCount}`);

      if (userData.subscription === "pro") {
        const endDate = new Date(userData.subscriptionEndDate);
        const isExpired = endDate < new Date();
        console.log(`   📅 Pro until: ${endDate.toDateString()}`);
        console.log(`   ⏰ Status: ${isExpired ? "🔴 EXPIRED" : "🟢 ACTIVE"}`);
      }
    } else {
      console.log(`\n❌ Not found in Firestore`);
    }
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.log(`❌ User not found: ${email}`);
    } else {
      console.error("❌ Error checking user:", error);
    }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0 && args[0].includes("@")) {
    // Check specific user
    await checkUserByEmail(args[0]);
  } else {
    // Check all users
    await checkAllUsers();
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n✅ Check completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Check failed:", error);
      process.exit(1);
    });
}

module.exports = { checkAllUsers, checkUserByEmail };
