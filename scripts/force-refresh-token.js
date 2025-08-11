#!/usr/bin/env node

/**
 * Force Refresh Admin Token
 * This will help clear token cache and force reload of custom claims
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

async function forceRefreshAdminToken() {
  try {
    console.log("🔄 Force Refreshing Admin Tokens...\n");

    const adminEmail = "admin@kelly-fitness.com"; // The one you're testing with

    console.log(`🔍 Processing: ${adminEmail}`);

    // Get user
    const userRecord = await adminAuth.getUserByEmail(adminEmail);
    console.log(`✅ User found: ${userRecord.uid}`);

    // Re-set custom claims to force token refresh
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
      // Add timestamp to force refresh
      lastUpdated: Date.now(),
    });

    console.log("✅ Custom claims refreshed with timestamp");

    // Verify the new claims
    const updatedRecord = await adminAuth.getUser(userRecord.uid);
    console.log("🔒 Updated Claims:", updatedRecord.customClaims);

    console.log("\n🎯 Action Required:");
    console.log("1. 🚪 LOGOUT completely from the app");
    console.log("2. 🔄 Clear browser cache (Ctrl+Shift+R)");
    console.log("3. 🔑 LOGIN again with admin@kelly-fitness.com");
    console.log("4. 🌐 Go to: http://localhost:3002/admin");
    console.log("\nThis should force the frontend to get new custom claims!");

    // Create a fresh custom token for testing
    const customToken = await adminAuth.createCustomToken(userRecord.uid);
    console.log(`\n🔑 Fresh Custom Token: ${customToken.substring(0, 50)}...`);
  } catch (error) {
    console.error("❌ Error refreshing admin token:", error);
  }
}

// Run the refresh
(async () => {
  await forceRefreshAdminToken();
  process.exit(0);
})();
