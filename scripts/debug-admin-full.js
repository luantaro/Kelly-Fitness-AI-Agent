#!/usr/bin/env node

/**
 * Debug Admin Access Issues
 * Clear all possible caches and test admin access
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

async function debugAdminAccess() {
  try {
    console.log("🐛 Full Admin Access Debug...\n");

    const testEmail = "admin@kelly-fitness.com";

    console.log("1️⃣ Checking Firebase Auth...");
    const userRecord = await adminAuth.getUserByEmail(testEmail);
    console.log(`✅ User found: ${userRecord.uid}`);
    console.log(`📧 Email: ${userRecord.email}`);
    console.log(`✅ Email Verified: ${userRecord.emailVerified}`);
    console.log(
      `🔒 Custom Claims:`,
      JSON.stringify(userRecord.customClaims, null, 2)
    );

    console.log("\n2️⃣ Checking Firestore...");
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("✅ Firestore document found:");
      console.log(`   Role: ${userData.role}`);
      console.log(`   Status: ${userData.status}`);
      console.log(`   isAdmin: ${userData.isAdmin}`);
      console.log(`   Email: ${userData.email}`);
    } else {
      console.log("❌ No Firestore document found");
    }

    console.log("\n3️⃣ Force Setting NEW Custom Claims...");
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: "admin",
      isAdmin: true,
      permissions: {
        viewUsers: true,
        editUsers: true,
        deleteUsers: true,
        manageSubscriptions: true,
        viewAnalytics: true,
        adminPanel: true,
      },
      // Force refresh with new timestamp
      refreshedAt: new Date().toISOString(),
      forceRefresh: Date.now(),
    });

    console.log("✅ NEW claims set with force refresh timestamp!");

    // Verify immediately
    const refreshedUser = await adminAuth.getUser(userRecord.uid);
    console.log("\n4️⃣ Verified NEW Claims:");
    console.log(JSON.stringify(refreshedUser.customClaims, null, 2));

    console.log("\n🎯 DEBUG COMPLETE!");
    console.log("\n📋 Required Actions:");
    console.log("1. 🚪 COMPLETELY LOGOUT from the app");
    console.log("2. 🧹 Clear ALL browser data (Ctrl+Shift+Delete)");
    console.log("3. 🔄 Restart browser");
    console.log("4. 🔑 LOGIN again with admin@kelly-fitness.com");
    console.log("5. 🌐 Go to: http://localhost:3002/admin");
    console.log("\n💡 If still blocked, check console for these logs:");
    console.log("   🔍 Admin email check: true");
    console.log("   🎯 Final admin status: true");
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Run debug
(async () => {
  await debugAdminAccess();
  process.exit(0);
})();
