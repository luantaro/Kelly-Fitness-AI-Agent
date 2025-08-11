#!/usr/bin/env node

/**
 * Test Admin Access
 * Verify that admin users can access the admin panel
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
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

async function testAdminAccess() {
  try {
    console.log("🧪 Testing Admin Access...\n");

    const adminEmails = ["admin@kelly-fitness.com", "taro2255@gmail.com"];

    for (const email of adminEmails) {
      console.log(`🔍 Testing: ${email}`);

      try {
        const userRecord = await adminAuth.getUserByEmail(email);
        console.log(`✅ User found: ${userRecord.uid}`);
        console.log(`📧 Email: ${userRecord.email}`);
        console.log(`✅ Email Verified: ${userRecord.emailVerified}`);
        console.log(`🔒 Custom Claims:`, userRecord.customClaims);

        if (userRecord.customClaims?.admin === true) {
          console.log(`✅ ${email} should have admin access! 🎉`);
        } else {
          console.log(`❌ ${email} missing admin claims`);
        }
      } catch (error) {
        console.log(`❌ ${email} not found: ${error.message}`);
      }

      console.log("─".repeat(50));
    }

    console.log("\n🎯 Test Results Summary:");
    console.log("If admin claims show 'admin: true', then access should work!");
    console.log("\n📋 Next Steps:");
    console.log("1. Go to: http://localhost:3002");
    console.log("2. Login with admin email");
    console.log("3. Navigate to: http://localhost:3002/admin");
    console.log("4. Should see admin dashboard!");
  } catch (error) {
    console.error("❌ Error testing admin access:", error);
  }
}

// Run the test
(async () => {
  await testAdminAccess();
  process.exit(0);
})();
