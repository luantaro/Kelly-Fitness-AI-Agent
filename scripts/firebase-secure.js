#!/usr/bin/env node

/**
 * 🔐 Secure Firebase Admin Helper
 *
 * This helper ensures all scripts use environment variables
 * instead of hardcoded credentials for security.
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
require("dotenv").config({ path: ".env.local" });

// Validate required environment variables
function validateEnvironment() {
  const required = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\n💡 Please check your .env.local file");
    process.exit(1);
  }
}

// Initialize Firebase Admin with environment variables
function initializeFirebaseAdmin() {
  validateEnvironment();

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

  console.log(
    "✅ Firebase Admin initialized securely with environment variables"
  );
  return app;
}

// Export secure Firebase services
function getSecureFirebaseServices() {
  const app = initializeFirebaseAdmin();

  return {
    app,
    adminAuth: getAuth(app),
    adminDb: getFirestore(app),
  };
}

module.exports = {
  initializeFirebaseAdmin,
  getSecureFirebaseServices,
  validateEnvironment,
};
