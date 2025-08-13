#!/usr/bin/env node

/**
 * Firebase Admin Setup CLI
 *
 * Script để setup admin đầu tiên cho Kelly Fitness AI
 *
 * Usage:
 *   node scripts/setup-admin.js --email admin@example.com --uid user123 --role SUPER_ADMIN
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
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
const adminDb = getFirestore(app);

// Admin roles and features
const ADMIN_ROLES = {
  SUPER_ADMIN: {
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
  },
  ADMIN: {
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: false,
    canManageSubscriptions: true,
    canViewAnalytics: true,
    canExportReports: true,
    canManageSettings: false,
    canViewLogs: true,
    canManagePayments: false,
    canManageContent: true,
    canManageAI: false,
    canManageAdmins: false,
    canAccessDatabase: false,
  },
  MODERATOR: {
    canViewUsers: true,
    canEditUsers: false,
    canDeleteUsers: false,
    canManageSubscriptions: false,
    canViewAnalytics: true,
    canExportReports: false,
    canManageSettings: false,
    canViewLogs: false,
    canManagePayments: false,
    canManageContent: true,
    canManageAI: false,
    canManageAdmins: false,
    canAccessDatabase: false,
  },
  SUPPORT: {
    canViewUsers: true,
    canEditUsers: false,
    canDeleteUsers: false,
    canManageSubscriptions: true,
    canViewAnalytics: false,
    canExportReports: false,
    canManageSettings: false,
    canViewLogs: false,
    canManagePayments: false,
    canManageContent: false,
    canManageAI: false,
    canManageAdmins: false,
    canAccessDatabase: false,
  },
};

async function setAdminClaims(uid, role, features) {
  try {
    await adminAuth.setCustomUserClaims(uid, {
      admin: true,
      role: role,
      features: features,
    });
    console.log(`✅ Admin claims set for user ${uid} with role ${role}`);
  } catch (error) {
    console.error("❌ Error setting admin claims:", error);
    throw error;
  }
}

async function createAdminProfile(uid, email, role, displayName = null) {
  try {
    const features = ADMIN_ROLES[role];

    const adminProfile = {
      uid,
      email,
      displayName,
      role,
      features,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "CLI_SETUP",
    };

    // Save to Firestore
    await adminDb.collection("adminProfiles").doc(uid).set(adminProfile);

    // Set Firebase custom claims
    await setAdminClaims(uid, role, features);

    // Log the action
    await adminDb.collection("adminLogs").add({
      action: "admin_created",
      targetUserId: uid,
      targetEmail: email,
      role,
      features,
      performedBy: "CLI_SETUP",
      timestamp: new Date().toISOString(),
    });

    console.log(`✅ Admin profile created for ${email} with role ${role}`);
    return adminProfile;
  } catch (error) {
    console.error("❌ Error creating admin profile:", error);
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return null;
    }
    throw error;
  }
}

async function setupAdmin() {
  const args = process.argv.slice(2);

  let email = null;
  let uid = null;
  let role = "ADMIN";
  let displayName = null;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--email":
        email = args[i + 1];
        i++;
        break;
      case "--uid":
        uid = args[i + 1];
        i++;
        break;
      case "--role":
        role = args[i + 1];
        i++;
        break;
      case "--name":
        displayName = args[i + 1];
        i++;
        break;
      case "--help":
        console.log(`
Firebase Admin Setup CLI

Usage:
  node scripts/setup-admin.js [options]

Options:
  --email <email>     Admin email address (required)
  --uid <uid>         Firebase UID (optional, will lookup by email)
  --role <role>       Admin role (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)
  --name <name>       Display name (optional)
  --help              Show this help message

Examples:
  node scripts/setup-admin.js --email admin@kelly-fitness.com --role SUPER_ADMIN
  node scripts/setup-admin.js --email support@example.com --role SUPPORT --name "Support Team"
  node scripts/setup-admin.js --uid abc123 --email admin@example.com --role ADMIN

Available Roles:
  SUPER_ADMIN  - Full system access (recommended for first admin)
  ADMIN        - User and content management
  MODERATOR    - Content moderation only
  SUPPORT      - User support only
        `);
        process.exit(0);
        break;
    }
  }

  if (!email) {
    console.error("❌ Email is required. Use --email <email>");
    console.log("Use --help for more information");
    process.exit(1);
  }

  if (!Object.keys(ADMIN_ROLES).includes(role)) {
    console.error(`❌ Invalid role: ${role}`);
    console.log(`Available roles: ${Object.keys(ADMIN_ROLES).join(", ")}`);
    process.exit(1);
  }

  try {
    console.log("🚀 Setting up Firebase Admin...");
    console.log(`📧 Email: ${email}`);
    console.log(`👑 Role: ${role}`);
    console.log(`📝 Name: ${displayName || "Not specified"}`);
    console.log("");

    // Get user UID if not provided
    if (!uid) {
      console.log("🔍 Looking up user by email...");
      const userRecord = await getUserByEmail(email);

      if (!userRecord) {
        console.error(
          `❌ User with email ${email} not found in Firebase Auth.`
        );
        console.log(
          "The user must sign up/login at least once before being made an admin."
        );
        process.exit(1);
      }

      uid = userRecord.uid;
      console.log(`✅ Found user: ${uid}`);
    }

    // Check if admin profile already exists
    const existingProfile = await adminDb
      .collection("adminProfiles")
      .doc(uid)
      .get();
    if (existingProfile.exists) {
      console.log("⚠️  Admin profile already exists. Updating...");
    }

    // Create/update admin profile
    const adminProfile = await createAdminProfile(
      uid,
      email,
      role,
      displayName
    );

    console.log("");
    console.log("🎉 Admin setup completed successfully!");
    console.log("");
    console.log("📋 Admin Profile Summary:");
    console.log(`   UID: ${adminProfile.uid}`);
    console.log(`   Email: ${adminProfile.email}`);
    console.log(`   Role: ${adminProfile.role}`);
    console.log(`   Status: ${adminProfile.isActive ? "Active" : "Inactive"}`);
    console.log(`   Created: ${adminProfile.createdAt}`);
    console.log("");
    console.log("🔑 Permissions granted:");
    Object.entries(adminProfile.features).forEach(([feature, enabled]) => {
      if (enabled) {
        console.log(`   ✅ ${feature}`);
      }
    });
    console.log("");
    console.log("🌐 Admin can now access:");
    console.log("   • Admin Dashboard: /admin");
    console.log("   • Admin Features: /admin/features");
    console.log("   • User Management: /admin/users");
    console.log("");
    console.log("⚡ Next Steps:");
    console.log("1. Admin user should login to the app to refresh their token");
    console.log("2. Visit /admin/features to manage other admin accounts");
    console.log("3. Check admin logs in Firebase console for audit trail");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupAdmin();
}

module.exports = { setupAdmin, createAdminProfile, setAdminClaims };
