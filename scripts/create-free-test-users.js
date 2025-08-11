#!/usr/bin/env node

/**
 * Firebase Free Test Users Setup CLI
 *
 * Script để tạo free test users cho Kelly Fitness AI
 *
 * Usage:
 *   node scripts/create-free-test-users.js
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

// Free test users data
const FREE_TEST_USERS = [
  {
    email: "freetestuser1@kelly-fitness.com",
    displayName: "Free Test User 1",
    password: "FreeTestPassword123!",
  },
  {
    email: "freetestuser2@kelly-fitness.com",
    displayName: "Free Test User 2",
    password: "FreeTestPassword123!",
  },
  {
    email: "freetestuser3@kelly-fitness.com",
    displayName: "Free Test User 3",
    password: "FreeTestPassword123!",
  },
];

/**
 * Create test user with Free subscription
 */
async function createFreeTestUser(userData) {
  try {
    console.log(`\n🔄 Creating free test user: ${userData.email}`);

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(userData.email);
      console.log(`⚠️  User already exists: ${userData.email}`);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // Create new user
        userRecord = await adminAuth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true,
        });
        console.log(`✅ Firebase Auth user created: ${userData.email}`);
      } else {
        throw error;
      }
    }

    // Create user profile in Firestore with FREE subscription
    const currentDate = new Date();
    const userProfile = {
      uid: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName,
      subscription: "free", // FREE subscription
      isActive: true,
      dailyMessageCount: 0,
      lastResetDate: currentDate.toISOString().split("T")[0],
      dailyExportCount: 0,
      allowedPersonalities: ["friendly"], // Only basic personality for free users
      createdAt: currentDate.toISOString(),
      updatedAt: currentDate.toISOString(),
      // Free subscription fields (no subscription dates)
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      subscriptionDurationMonths: 0,
      autoRenew: false,
    };

    // Save to Firestore
    await adminDb.collection("users").doc(userRecord.uid).set(userProfile);
    console.log(`✅ Firestore user profile created`);

    // Log the user creation
    await adminDb.collection("subscriptionLogs").add({
      userId: userRecord.uid,
      action: "created",
      subscriptionType: "free",
      durationMonths: 0,
      startDate: null,
      endDate: null,
      reason: "Free test user creation",
      timestamp: currentDate.toISOString(),
    });

    console.log(`✅ Free test user created successfully!`);
    console.log(`   📧 Email: ${userData.email}`);
    console.log(`   🔑 Password: ${userData.password}`);
    console.log(`   ⭐ Subscription: Free`);
    console.log(`   💬 Daily Message Limit: 10 messages`);
    console.log(`   🤖 Available Personalities: Friendly only`);
    console.log(`   🆔 UID: ${userRecord.uid}`);

    return userRecord;
  } catch (error) {
    console.error(`❌ Error creating free test user ${userData.email}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("🚀 Creating FREE test users for Kelly Fitness AI...\n");

    // Create all free test users
    const createdUsers = [];
    for (const userData of FREE_TEST_USERS) {
      const user = await createFreeTestUser(userData);
      createdUsers.push(user);
    }

    console.log(
      `\n🎉 Successfully created ${createdUsers.length} FREE test users!`
    );
    console.log("\n📝 Free Test Users Summary:");
    console.log("════════════════════════════════════════");

    for (let i = 0; i < FREE_TEST_USERS.length; i++) {
      const userData = FREE_TEST_USERS[i];
      const user = createdUsers[i];
      console.log(`👤 Free Test User ${i + 1}:`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   🔑 Password: ${userData.password}`);
      console.log(`   🆔 UID: ${user.uid}`);
      console.log(`   ⭐ Subscription: Free`);
      console.log(`   💬 Daily Limit: 10 messages`);
      console.log(`   🤖 Personalities: Friendly only`);
      console.log("");
    }

    console.log("🔗 You can now:");
    console.log("   1. Login with these credentials in the app");
    console.log(
      "   2. Test Free features (10 daily messages, basic personality)"
    );
    console.log("   3. Test subscription upgrade flow");
    console.log("   4. Check user data in Firebase Console");
    console.log("   5. Manage subscriptions via Firebase Firestore");

    console.log("\n📋 Free User Limitations:");
    console.log("   • Maximum 10 messages per day");
    console.log("   • Only 'Friendly' personality available");
    console.log("   • Limited export functionality");
    console.log("   • Subscription upgrade prompts");
  } catch (error) {
    console.error("❌ Failed to create free test users:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n✅ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = { createFreeTestUser, FREE_TEST_USERS };
