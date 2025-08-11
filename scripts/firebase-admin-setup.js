/**
 * Firebase Admin Setup Script
 * Creates admin user and tests admin APIs
 */

const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "kelly-fitness-93e58",
  });
}

const db = admin.firestore();

async function createAdminUser() {
  console.log("🔧 Creating Firebase Admin User...");

  try {
    // Create auth user
    const userRecord = await admin.auth().createUser({
      email: "admin@kelly-fitness.com",
      password: "Kelly@Admin2025!",
      displayName: "Kelly Fitness Admin",
      emailVerified: true,
    });

    console.log("✅ Auth user created:", userRecord.uid);

    // Create user document in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email: "admin@kelly-fitness.com",
      name: "Kelly Fitness Admin",
      role: "admin",
      status: "active",
      subscription: "premium",
      quotaUsed: 0,
      quotaLimit: 10000,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Admin user document created in Firestore");

    return userRecord.uid;
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      console.log("👤 Admin user already exists, getting existing user...");
      const user = await admin.auth().getUserByEmail("admin@kelly-fitness.com");

      // Update user document to ensure admin role
      await db.collection("users").doc(user.uid).set(
        {
          email: "admin@kelly-fitness.com",
          name: "Kelly Fitness Admin",
          role: "admin",
          status: "active",
          subscription: "premium",
          quotaUsed: 0,
          quotaLimit: 10000,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log("✅ Updated existing admin user:", user.uid);
      return user.uid;
    } else {
      console.error("❌ Error creating admin user:", error);
      throw error;
    }
  }
}

async function testAdminAPIs() {
  console.log("🧪 Testing Firebase Functions Admin APIs...");

  const baseUrl =
    "https://us-central1-kelly-fitness-93e58.cloudfunctions.net/nextjsApp";

  try {
    // Test health endpoint
    console.log("Testing /health...");
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData.status);

    // Test admin stats
    console.log("Testing /api/admin/stats...");
    const statsResponse = await fetch(`${baseUrl}/api/admin/stats`);
    const statsData = await statsResponse.json();
    console.log("✅ Admin stats:", {
      totalUsers: statsData.stats.totalUsers,
      activeUsers: statsData.stats.activeUsers,
      pendingUsers: statsData.stats.pendingUsers,
    });

    // Test admin users list
    console.log("Testing /api/admin/users...");
    const usersResponse = await fetch(`${baseUrl}/api/admin/users`);
    const usersData = await usersResponse.json();
    console.log("✅ Users list:", `${usersData.users.length} users found`);

    console.log("🎉 All Firebase Functions Admin APIs working!");
  } catch (error) {
    console.error("❌ Error testing APIs:", error);
    throw error;
  }
}

async function generateLoginToken(uid) {
  console.log("🔑 Generating custom token for admin login...");

  try {
    const customToken = await admin.auth().createCustomToken(uid);
    console.log("✅ Custom token generated (use this for admin login):");
    console.log("📋 Token:", customToken);

    return customToken;
  } catch (error) {
    console.error("❌ Error generating token:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("🚀 Firebase Admin Setup Starting...\n");

    // Step 1: Create admin user
    const adminUid = await createAdminUser();
    console.log("");

    // Step 2: Test admin APIs
    await testAdminAPIs();
    console.log("");

    // Step 3: Generate login token
    await generateLoginToken(adminUid);
    console.log("");

    console.log("✅ Firebase Admin Setup Complete!");
    console.log(
      "📱 Admin can now login at: https://kelly-fitness-93e58.web.app"
    );
    console.log("💡 Use the custom token above for admin authentication");
  } catch (error) {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main()
    .then(() => {
      console.log("👋 Setup finished successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { createAdminUser, testAdminAPIs, generateLoginToken };
