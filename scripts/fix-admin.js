#!/usr/bin/env node

/**
 * Fix Admin User Script
 * Sets admin claims for admin@kelly-fitness.com
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
const auth = getAuth(app);

async function fixAdminUser() {
  try {
    console.log("🔧 Fixing admin user...");

    const adminEmail = "admin@kelly-fitness.com";

    // Get user by email
    const userRecord = await auth.getUserByEmail(adminEmail);
    console.log(`📧 Found user: ${userRecord.email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);

    // Set admin claims
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: "admin",
      isAdmin: true,
    });

    console.log("✅ Admin claims set successfully!");

    // Verify claims
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log("🔍 Updated claims:", updatedUser.customClaims);

    console.log("\n✅ Admin user fixed! You can now access /admin");
  } catch (error) {
    console.error("❌ Error fixing admin user:", error);

    if (error.code === "auth/user-not-found") {
      console.log("🚀 Creating admin user...");

      try {
        const newUser = await auth.createUser({
          email: "admin@kelly-fitness.com",
          password: "123456",
          displayName: "Kelly Admin",
        });

        await auth.setCustomUserClaims(newUser.uid, {
          admin: true,
          role: "admin",
          isAdmin: true,
        });

        console.log("✅ Admin user created and claims set!");
        console.log(`📧 Email: admin@kelly-fitness.com`);
        console.log(`🔐 Password: 123456`);
      } catch (createError) {
        console.error("❌ Error creating admin user:", createError);
      }
    }
  }

  process.exit(0);
}

fixAdminUser();
