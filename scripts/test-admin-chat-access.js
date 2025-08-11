#!/usr/bin/env node

/**
 * 🧪 Test Admin Chat Access
 * Test if admin can now access chat after fixing API endpoints
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

async function testAdminChatAccess() {
  try {
    console.log("🧪 Testing Admin Chat Access...\n");

    const adminEmail = "admin@kelly-fitness.com";

    console.log("1️⃣ Getting admin user...");
    const userRecord = await adminAuth.getUserByEmail(adminEmail);
    console.log(`✅ Admin found: ${userRecord.uid}`);
    console.log(`📧 Email: ${userRecord.email}`);
    console.log(`🔒 Custom Claims:`, userRecord.customClaims);

    if (userRecord.customClaims?.admin === true) {
      console.log("✅ Admin claims verified!");
    } else {
      console.log("❌ Admin claims missing - setting now...");
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        admin: true,
        role: "admin",
        isAdmin: true,
        refreshedAt: new Date().toISOString(),
      });
      console.log("✅ Admin claims set!");
    }

    console.log("\n2️⃣ Generating test token...");
    const customToken = await adminAuth.createCustomToken(userRecord.uid);
    console.log("✅ Custom token generated");

    console.log("\n3️⃣ Testing NEW API endpoints...");

    // Test localhost endpoints
    const baseUrl = "http://localhost:3002";

    try {
      console.log("📡 Testing trial-status endpoint...");
      const trialResponse = await fetch(`${baseUrl}/api/user/trial-status`, {
        headers: {
          Authorization: `Bearer ${customToken}`,
          "Content-Type": "application/json",
        },
      });

      if (trialResponse.ok) {
        const trialData = await trialResponse.json();
        console.log("✅ Trial Status API Response:", {
          hasAccess: trialData.hasAccess,
          status: trialData.status,
          message: trialData.message,
        });
      } else {
        console.log("❌ Trial Status API failed:", trialResponse.status);
      }

      console.log("\n📡 Testing subscription-info endpoint...");
      const subResponse = await fetch(`${baseUrl}/api/user/subscription-info`, {
        headers: {
          Authorization: `Bearer ${customToken}`,
          "Content-Type": "application/json",
        },
      });

      if (subResponse.ok) {
        const subData = await subResponse.json();
        console.log("✅ Subscription Info API Response:", {
          hasAccess: subData.hasAccess,
          status: subData.status,
          statusMessage: subData.statusMessage,
          isActive: subData.isActive,
        });
      } else {
        console.log("❌ Subscription Info API failed:", subResponse.status);
      }
    } catch (error) {
      console.log(
        "❌ API test failed (likely dev server not running):",
        error.message
      );
    }

    console.log("\n🎯 Next Steps:");
    console.log("1. 🚪 Logout from the app completely");
    console.log("2. 🧹 Clear browser cache/data (Ctrl+Shift+Delete)");
    console.log("3. 🔑 Login again as admin@kelly-fitness.com");
    console.log("4. 💬 Try to access chat - should work now!");
    console.log("5. ✅ If still blocked, check browser console for errors");

    console.log("\n🔧 What was fixed:");
    console.log("• Created proper Next.js API routes with admin bypass");
    console.log("• /api/user/trial-status now uses checkUserAccess()");
    console.log("• /api/user/subscription-info now has admin detection");
    console.log("• Both endpoints will override Firebase Functions");
  } catch (error) {
    console.error("❌ Error testing admin chat access:", error);
  }
}

// Run the test
(async () => {
  await testAdminChatAccess();
  process.exit(0);
})();
