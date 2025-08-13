#!/usr/bin/env node

/**
 * Reset Admin Password Script
 *
 * Reset password cho admin account taro2255@gmail.com
 *
 * Usage:
 *   node scripts/reset-admin-password.js
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
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

const ADMIN_EMAIL = "taro2255@gmail.com";
const NEW_PASSWORD = "Kelly2025@Admin"; // Temporary password

/**
 * Reset admin password
 */
async function resetAdminPassword() {
  console.log("🔐 Starting admin password reset...");
  console.log(`📧 Admin email: ${ADMIN_EMAIL}`);
  console.log("");

  try {
    // Find admin user
    const userRecord = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    console.log(`✅ Found admin user: ${userRecord.uid}`);

    // Update password
    await adminAuth.updateUser(userRecord.uid, {
      password: NEW_PASSWORD,
    });

    console.log("✅ Password reset successful!");
    console.log("");
    console.log("🔑 New login credentials:");
    console.log(`   📧 Email: ${ADMIN_EMAIL}`);
    console.log(`   🔒 Password: ${NEW_PASSWORD}`);
    console.log("");
    console.log("⚠️  IMPORTANT: Please change this password after logging in!");
    console.log("");
    console.log("🌐 Login steps:");
    console.log("   1. Go to: http://localhost:3000/auth");
    console.log("   2. Enter the email and password above");
    console.log("   3. Change password in your account settings");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error("❌ Admin user not found!");
      console.log("");
      console.log(
        "📝 Please ensure taro2255@gmail.com has signed up at least once:"
      );
      console.log("   1. Go to: http://localhost:3000/auth");
      console.log("   2. Click 'Tạo tài khoản'");
      console.log("   3. Sign up with taro2255@gmail.com");
      console.log("   4. Then run this script again");
    } else {
      console.error("❌ Password reset failed:", error);
    }
    process.exit(1);
  }
}

/**
 * Create admin account if not exists
 */
async function createAdminAccount() {
  console.log("🚀 Creating admin account...");
  console.log("");

  try {
    const userRecord = await adminAuth.createUser({
      email: ADMIN_EMAIL,
      password: NEW_PASSWORD,
      displayName: "Kelly Fitness Admin",
      emailVerified: true,
    });

    console.log("✅ Admin account created successfully!");
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log("");
    console.log("🔑 Login credentials:");
    console.log(`   📧 Email: ${ADMIN_EMAIL}`);
    console.log(`   🔒 Password: ${NEW_PASSWORD}`);
    console.log("");
    console.log("🌐 You can now login at: http://localhost:3000/auth");
  } catch (error) {
    console.error("❌ Failed to create admin account:", error);
    process.exit(1);
  }
}

/**
 * Check if admin exists and reset/create accordingly
 */
async function handleAdminAccount() {
  try {
    // Try to find existing admin
    await adminAuth.getUserByEmail(ADMIN_EMAIL);
    // If found, reset password
    await resetAdminPassword();
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      // If not found, create new admin account
      await createAdminAccount();
    } else {
      throw error;
    }
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Admin Account Management Script

Usage:
  node scripts/reset-admin-password.js        Reset/create admin account
  node scripts/reset-admin-password.js --help Show this help

This script will:
- Create admin account if it doesn't exist
- Reset password if account exists
- Set temporary password: ${NEW_PASSWORD}

⚠️  Remember to change the password after first login!
    `);
    process.exit(0);
  } else {
    handleAdminAccount()
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
