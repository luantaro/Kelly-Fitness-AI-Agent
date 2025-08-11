/**
 * Get Current Admin Account Info
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

async function getAdminAccount() {
  console.log("🔍 Getting Current Admin Account Information...\n");

  try {
    const db = admin.firestore();

    // Get admin user by email
    const adminUser = await admin
      .auth()
      .getUserByEmail("admin@kelly-fitness.com");
    console.log("👤 Firebase Auth User:");
    console.log("   UID:", adminUser.uid);
    console.log("   Email:", adminUser.email);
    console.log("   Display Name:", adminUser.displayName);
    console.log("   Email Verified:", adminUser.emailVerified);
    console.log(
      "   Created:",
      new Date(adminUser.metadata.creationTime).toLocaleString()
    );
    console.log(
      "   Last Login:",
      new Date(
        adminUser.metadata.lastSignInTime || adminUser.metadata.creationTime
      ).toLocaleString()
    );

    // Get admin user document from Firestore
    const adminDoc = await db.collection("users").doc(adminUser.uid).get();
    const adminData = adminDoc.data();

    console.log("\n📋 Firestore User Document:");
    console.log("   Email:", adminData.email);
    console.log("   Name:", adminData.name);
    console.log("   Role:", adminData.role);
    console.log("   Status:", adminData.status);
    console.log("   Subscription:", adminData.subscription);
    console.log("   Quota Used:", adminData.quotaUsed);
    console.log("   Quota Limit:", adminData.quotaLimit);

    if (adminData.createdAt && adminData.createdAt.toDate) {
      console.log(
        "   Created At:",
        adminData.createdAt.toDate().toLocaleString()
      );
    } else if (adminData.createdAt) {
      console.log("   Created At:", adminData.createdAt);
    }
    if (adminData.lastLogin && adminData.lastLogin.toDate) {
      console.log(
        "   Last Login:",
        adminData.lastLogin.toDate().toLocaleString()
      );
    } else if (adminData.lastLogin) {
      console.log("   Last Login:", adminData.lastLogin);
    }

    // Generate fresh custom token
    console.log("\n🔑 Fresh Authentication Token:");
    const customToken = await admin.auth().createCustomToken(adminUser.uid);
    console.log("   Custom Token:", customToken.substring(0, 50) + "...");
    console.log("   Full Token Length:", customToken.length);

    // Check admin permissions
    console.log("\n🛡️ Admin Permissions Check:");
    if (adminData.role === "admin") {
      console.log("   ✅ Admin Role: VERIFIED");
    } else {
      console.log("   ❌ Admin Role: NOT SET");
    }

    if (adminData.status === "active") {
      console.log("   ✅ Account Status: ACTIVE");
    } else {
      console.log("   ❌ Account Status:", adminData.status);
    }

    // Show login instructions
    console.log("\n📱 Login Instructions:");
    console.log("   1. Go to: https://kelly-fitness-93e58.web.app");
    console.log("   2. Click Login/Sign In");
    console.log("   3. Use credentials below:");
    console.log("");
    console.log("   📧 Email: admin@kelly-fitness.com");
    console.log("   🔐 Password: Kelly@Admin2025!");
    console.log("");
    console.log("   OR use custom token for direct authentication");

    return {
      auth: adminUser,
      firestore: adminData,
      token: customToken,
    };
  } catch (error) {
    console.error("❌ Error getting admin account:", error);
    throw error;
  }
}

async function testAdminAccess() {
  console.log("\n🧪 Testing Admin API Access...");

  const baseUrl = "https://kelly-fitness-93e58.web.app";

  try {
    // Test basic admin endpoints
    const statsResponse = await fetch(`${baseUrl}/api/admin/stats`);
    const statsData = await statsResponse.json();

    const usersResponse = await fetch(`${baseUrl}/api/admin/users`);
    const usersData = await usersResponse.json();

    console.log(
      "   ✅ Admin Stats API:",
      statsData.success ? "WORKING" : "FAILED"
    );
    console.log(
      "   ✅ Admin Users API:",
      usersData.success ? "WORKING" : "FAILED"
    );
    console.log("   📊 Current Stats:", {
      totalUsers: statsData.stats?.totalUsers,
      activeUsers: statsData.stats?.activeUsers,
      pendingUsers: statsData.stats?.pendingUsers,
    });
  } catch (error) {
    console.error("   ❌ API Test Failed:", error.message);
  }
}

async function main() {
  try {
    const adminInfo = await getAdminAccount();
    await testAdminAccess();

    console.log("\n✅ Admin Account Information Retrieved Successfully!");
  } catch (error) {
    console.error("💥 Failed to get admin account:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n👋 Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { getAdminAccount, testAdminAccess };
