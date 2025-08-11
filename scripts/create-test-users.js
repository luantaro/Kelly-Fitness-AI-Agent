#!/usr/bin/env node

/**
 * Firebase Test Users Setup CLI
 *
 * Script để tạo test users cho Kelly Fitness AI
 *
 * Usage:
 *   node scripts/create-test-users.js
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

// Test users data
const TEST_USERS = [
  {
    email: "testuser1@kelly-fitness.com",
    displayName: "Test User 1",
    password: "TestPassword123!",
  },
  {
    email: "testuser2@kelly-fitness.com",
    displayName: "Test User 2",
    password: "TestPassword123!",
  },
];

/**
 * Create test user with Pro subscription
 */
async function createTestUser(userData) {
  try {
    console.log(`\n🔄 Creating test user: ${userData.email}`);

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

    // Calculate subscription dates (1 month Pro)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName,
      subscription: "pro",
      isActive: true,
      dailyMessageCount: 0,
      lastResetDate: startDate.toISOString().split("T")[0],
      dailyExportCount: 0,
      allowedPersonalities: [
        "friendly",
        "professional",
        "motivational",
        "nutritionist",
        "trainer",
        "casual",
      ],
      createdAt: startDate.toISOString(),
      updatedAt: startDate.toISOString(),
      // Pro subscription fields
      subscriptionStartDate: startDate.toISOString(),
      subscriptionEndDate: endDate.toISOString(),
      subscriptionDurationMonths: 1,
      autoRenew: false,
    };

    // Save to Firestore
    await adminDb.collection("users").doc(userRecord.uid).set(userProfile);
    console.log(`✅ Firestore user profile created`);

    // Log the subscription creation
    await adminDb.collection("subscriptionLogs").add({
      userId: userRecord.uid,
      action: "upgraded",
      subscriptionType: "pro",
      durationMonths: 1,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reason: "Test user creation",
      timestamp: startDate.toISOString(),
    });

    console.log(`✅ Test user created successfully!`);
    console.log(`   📧 Email: ${userData.email}`);
    console.log(`   🔑 Password: ${userData.password}`);
    console.log(`   ⭐ Subscription: Pro (1 month)`);
    console.log(`   📅 Valid until: ${endDate.toDateString()}`);
    console.log(`   🆔 UID: ${userRecord.uid}`);

    return userRecord;
  } catch (error) {
    console.error(`❌ Error creating test user ${userData.email}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("🚀 Creating test users for Kelly Fitness AI...\n");

    // Create all test users
    const createdUsers = [];
    for (const userData of TEST_USERS) {
      const user = await createTestUser(userData);
      createdUsers.push(user);
    }

    console.log(`\n🎉 Successfully created ${createdUsers.length} test users!`);
    console.log("\n📝 Test Users Summary:");
    console.log("════════════════════════════════════════");

    for (let i = 0; i < TEST_USERS.length; i++) {
      const userData = TEST_USERS[i];
      const user = createdUsers[i];
      console.log(`👤 Test User ${i + 1}:`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   🔑 Password: ${userData.password}`);
      console.log(`   🆔 UID: ${user.uid}`);
      console.log(`   ⭐ Subscription: Pro (1 month)`);
      console.log("");
    }

    console.log("🔗 You can now:");
    console.log("   1. Login with these credentials in the app");
    console.log(
      "   2. Test Pro features (unlimited messages, all personalities)"
    );
    console.log("   3. Check user data in Firebase Console");
    console.log("   4. Manage subscriptions via Firebase Firestore");
  } catch (error) {
    console.error("❌ Failed to create test users:", error);
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

module.exports = { createTestUser, TEST_USERS };
