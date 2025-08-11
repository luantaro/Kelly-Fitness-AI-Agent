#!/usr/bin/env node

/**
 * Admin Permission Fixer
 * Fix admin access issues and ensure proper permissions
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
require("dotenv").config({ path: ".env.local" });

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = !getApps().length
  ? initializeApp(firebaseAdminConfig)
  : getApps()[0];
const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

async function fixAdminPermissions() {
  try {
    console.log("🔧 Starting Admin Permission Fix...\n");

    // Get admin email from env
    const adminEmail =
      process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@kelly-fitness.com";
    console.log(`👑 Target Admin Email: ${adminEmail}`);

    // Step 1: Check if admin user exists in Firebase Auth
    console.log("\n📋 Step 1: Checking Firebase Auth...");
    let adminUser;
    try {
      adminUser = await adminAuth.getUserByEmail(adminEmail);
      console.log(`✅ Admin user found in Firebase Auth: ${adminUser.uid}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Email Verified: ${adminUser.emailVerified}`);
      console.log(`   - Disabled: ${adminUser.disabled}`);
    } catch (error) {
      console.log(`❌ Admin user NOT found in Firebase Auth: ${error.message}`);

      // Create admin user in Firebase Auth
      console.log("🔧 Creating admin user in Firebase Auth...");
      adminUser = await adminAuth.createUser({
        email: adminEmail,
        password: "Kelly@Admin2025!",
        emailVerified: true,
        disabled: false,
      });
      console.log(`✅ Admin user created: ${adminUser.uid}`);
    }

    // Step 2: Check/Create admin user in Firestore
    console.log("\n📋 Step 2: Checking Firestore document...");
    const adminDocRef = adminDb.collection("users").doc(adminUser.uid);
    const adminDoc = await adminDocRef.get();

    if (!adminDoc.exists) {
      console.log("❌ Admin document NOT found in Firestore");
      console.log("🔧 Creating admin document...");

      await adminDocRef.set({
        email: adminEmail,
        role: "admin",
        status: "active",
        isAdmin: true,
        displayName: "Kelly Admin",
        createdAt: new Date(),
        lastLogin: new Date(),
        subscriptionStatus: "premium",
        trialUsed: false,
        profileSetup: true,
      });
      console.log("✅ Admin document created in Firestore");
    } else {
      console.log("✅ Admin document found in Firestore");
      const data = adminDoc.data();
      console.log(`   - Role: ${data.role}`);
      console.log(`   - Status: ${data.status}`);
      console.log(`   - isAdmin: ${data.isAdmin}`);

      // Update to ensure all admin fields are correct
      await adminDocRef.update({
        role: "admin",
        status: "active",
        isAdmin: true,
        lastUpdated: new Date(),
      });
      console.log("🔧 Admin document updated with correct permissions");
    }

    // Step 3: Verify admin can access admin endpoints
    console.log("\n📋 Step 3: Testing admin permissions...");

    // Check if user should have admin access
    const updatedDoc = await adminDocRef.get();
    const userData = updatedDoc.data();

    if (
      userData.role === "admin" &&
      userData.status === "active" &&
      userData.isAdmin === true
    ) {
      console.log("✅ Admin permissions verified!");
      console.log("✅ User should have full admin access");
    } else {
      console.log("❌ Admin permissions still incorrect");
      console.log("Current data:", userData);
    }

    // Step 4: Check admin whitelist in frontend
    console.log("\n📋 Step 4: Checking admin whitelist...");
    console.log(`Admin email in env: ${process.env.NEXT_PUBLIC_ADMIN_EMAIL}`);

    console.log("\n🎉 Admin Permission Fix Complete!");
    console.log("\n📋 Admin Login Credentials:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: Kelly@Admin2025!`);
    console.log(`   UID: ${adminUser.uid}`);
    console.log("\n🌐 Admin Panel URLs:");
    console.log("   Development: http://localhost:3002/admin");
    console.log("   Production: https://kelly-fitness-93e58.web.app/admin");
  } catch (error) {
    console.error("❌ Error fixing admin permissions:", error);
  }
}

// Step 5: Also check all admin-related users
async function checkAdminUsers() {
  try {
    console.log("\n🔍 Checking all potential admin users...");

    const usersSnapshot = await adminDb
      .collection("users")
      .where("role", "==", "admin")
      .get();

    if (usersSnapshot.empty) {
      console.log("❌ No admin users found in database");
    } else {
      console.log(`👑 Found ${usersSnapshot.size} admin user(s):`);
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.email} (${data.status})`);
      });
    }
  } catch (error) {
    console.error("Error checking admin users:", error);
  }
}

// Run the fix
(async () => {
  await fixAdminPermissions();
  await checkAdminUsers();
  process.exit(0);
})();
