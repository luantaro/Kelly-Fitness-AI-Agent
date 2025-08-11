#!/usr/bin/env node

/**
 * Set Custom Claims for Admin Users
 * Fix admin access by setting proper Firebase custom claims
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

async function setAdminClaims() {
  try {
    console.log("🔧 Setting Admin Custom Claims...\n");

    // Get all admin users from Firestore
    const adminUsersSnapshot = await adminDb
      .collection("users")
      .where("role", "==", "admin")
      .get();

    if (adminUsersSnapshot.empty) {
      console.log("❌ No admin users found in Firestore");
      return;
    }

    console.log(`👑 Found ${adminUsersSnapshot.size} admin user(s):`);

    for (const doc of adminUsersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;

      console.log(`\n🔧 Processing: ${userData.email} (${uid})`);

      try {
        // Set custom claims for admin access
        await adminAuth.setCustomUserClaims(uid, {
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
        });

        console.log(`✅ Custom claims set for ${userData.email}`);

        // Verify claims were set
        const userRecord = await adminAuth.getUser(uid);
        console.log(`✅ Verified claims:`, userRecord.customClaims);
      } catch (error) {
        console.error(
          `❌ Error setting claims for ${userData.email}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Admin Claims Update Complete!");
    console.log("\n📋 Instructions:");
    console.log("1. Admin users need to refresh their browser or re-login");
    console.log("2. Go to: http://localhost:3002/admin");
    console.log("3. Custom claims should now allow admin access");

    // Test claims for current admin email
    console.log("\n🧪 Testing current admin access...");
    const currentAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    try {
      const adminUser = await adminAuth.getUserByEmail(currentAdminEmail);
      console.log(`\n👑 Current Admin: ${currentAdminEmail}`);
      console.log(`🆔 UID: ${adminUser.uid}`);
      console.log(`🔒 Custom Claims:`, adminUser.customClaims);

      if (adminUser.customClaims?.admin === true) {
        console.log("✅ Admin claims verified! Should have access now.");
      } else {
        console.log("❌ Admin claims missing. Applying now...");

        await adminAuth.setCustomUserClaims(adminUser.uid, {
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
        });

        console.log("✅ Admin claims applied! Please refresh browser.");
      }
    } catch (error) {
      console.error(`❌ Error testing admin access:`, error.message);
    }
  } catch (error) {
    console.error("❌ Error setting admin claims:", error);
  }
}

// Run the claims update
(async () => {
  await setAdminClaims();
  process.exit(0);
})();
