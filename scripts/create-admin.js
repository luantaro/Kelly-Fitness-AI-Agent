#!/usr/bin/env node

/**
 * Create Complete Admin User
 *
 * Script để tạo admin user hoàn chỉnh cho Kelly Fitness AI
 * 🔐 SECURITY UPDATE: Now uses secure environment variables
 *
 * Usage:
 *   node scripts/create-admin.js
 */

const { getSecureFirebaseServices } = require("./firebase-secure");

// Get secure Firebase services
const { adminAuth, adminDb } = getSecureFirebaseServices();

// Admin account details
const ADMIN_ACCOUNT = {
  email: "admin@kelly-fitness.com",
  password: "AdminKellyFitness2025!",
  displayName: "Kelly Fitness Admin",
  role: "SUPER_ADMIN",
};

// Admin permissions
const ADMIN_FEATURES = {
  canViewUsers: true,
  canEditUsers: true,
  canDeleteUsers: true,
  canManageSubscriptions: true,
  canViewAnalytics: true,
  canExportReports: true,
  canManageSettings: true,
  canViewLogs: true,
  canManagePayments: true,
  canManageContent: true,
  canManageAI: true,
  canManageAdmins: true,
  canAccessDatabase: true,
};

/**
 * Create complete admin user with all necessary setup
 */
async function createCompleteAdmin() {
  try {
    console.log("🚀 Creating complete admin user for Kelly Fitness AI...\n");

    // Check if admin already exists
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(ADMIN_ACCOUNT.email);
      console.log(`⚠️  Admin user already exists: ${ADMIN_ACCOUNT.email}`);
      console.log(`🆔 UID: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // Create new admin user
        console.log(`🔄 Creating Firebase Auth user: ${ADMIN_ACCOUNT.email}`);
        userRecord = await adminAuth.createUser({
          email: ADMIN_ACCOUNT.email,
          password: ADMIN_ACCOUNT.password,
          displayName: ADMIN_ACCOUNT.displayName,
          emailVerified: true,
        });
        console.log(
          `✅ Firebase Auth admin user created: ${ADMIN_ACCOUNT.email}`
        );
      } else {
        throw error;
      }
    }

    // Set admin custom claims
    console.log(`🔄 Setting admin claims...`);
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: ADMIN_ACCOUNT.role,
      features: ADMIN_FEATURES,
    });
    console.log(`✅ Admin claims set successfully`);

    // Create admin profile in Firestore
    console.log(`🔄 Creating admin profile in Firestore...`);
    const adminProfile = {
      uid: userRecord.uid,
      email: ADMIN_ACCOUNT.email,
      displayName: ADMIN_ACCOUNT.displayName,
      role: ADMIN_ACCOUNT.role,
      features: ADMIN_FEATURES,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "CLI_SETUP",
      subscription: "admin", // Special admin subscription
      allowedPersonalities: [
        "friendly",
        "professional",
        "motivational",
        "nutritionist",
        "trainer",
        "casual",
      ],
    };

    await adminDb
      .collection("adminProfiles")
      .doc(userRecord.uid)
      .set(adminProfile);
    console.log(`✅ Admin profile created in Firestore`);

    // Create user profile (for compatibility with user system)
    console.log(`🔄 Creating user profile for compatibility...`);
    const userProfile = {
      uid: userRecord.uid,
      email: ADMIN_ACCOUNT.email,
      displayName: ADMIN_ACCOUNT.displayName,
      subscription: "admin",
      isActive: true,
      dailyMessageCount: 0,
      lastResetDate: new Date().toISOString().split("T")[0],
      dailyExportCount: 0,
      allowedPersonalities: [
        "friendly",
        "professional",
        "motivational",
        "nutritionist",
        "trainer",
        "casual",
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("users").doc(userRecord.uid).set(userProfile);
    console.log(`✅ User profile created for compatibility`);

    // Log admin creation
    await adminDb.collection("adminLogs").add({
      action: "admin_created",
      targetUserId: userRecord.uid,
      targetEmail: ADMIN_ACCOUNT.email,
      role: ADMIN_ACCOUNT.role,
      features: ADMIN_FEATURES,
      performedBy: "CLI_SETUP",
      timestamp: new Date().toISOString(),
    });

    console.log(`\n🎉 Admin user created successfully!`);
    console.log(`\n📋 Admin Account Details:`);
    console.log(`   📧 Email: ${ADMIN_ACCOUNT.email}`);
    console.log(`   🔑 Password: ${ADMIN_ACCOUNT.password}`);
    console.log(`   👤 Display Name: ${ADMIN_ACCOUNT.displayName}`);
    console.log(`   👑 Role: ${ADMIN_ACCOUNT.role}`);
    console.log(`   🆔 UID: ${userRecord.uid}`);
    console.log(`   ✅ Status: Active`);

    console.log(`\n🔐 Admin Permissions:`);
    Object.entries(ADMIN_FEATURES).forEach(([feature, enabled]) => {
      if (enabled) {
        console.log(`   ✅ ${feature}`);
      }
    });

    console.log(`\n🌐 Admin Access:`);
    console.log(`   • Admin Dashboard: http://localhost:3003/admin`);
    console.log(`   • User Management: http://localhost:3003/admin/users`);
    console.log(`   • Main App: http://localhost:3003`);

    console.log(`\n⚡ Next Steps:`);
    console.log(`1. Go to http://localhost:3003/auth`);
    console.log(`2. Login with the admin credentials above`);
    console.log(`3. Navigate to /admin to access admin dashboard`);
    console.log(`4. Use "Manage Subscription" feature to upgrade test users`);

    return userRecord;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await createCompleteAdmin();
    console.log("\n✅ Admin setup completed successfully!");
  } catch (error) {
    console.error("\n❌ Admin setup failed:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🚀 You can now login as admin!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { createCompleteAdmin, ADMIN_ACCOUNT };
