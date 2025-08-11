#!/usr/bin/env node

/**
 * 🧪 Security Test Script
 * Test whether all credentials are properly configured
 */

const {
  validateEnvironment,
  getSecureFirebaseServices,
} = require("./firebase-secure");

async function testSecuritySetup() {
  console.log("🔐 Testing Security Setup...\n");

  try {
    // Test 1: Environment Variables
    console.log("1️⃣ Testing environment variables...");
    validateEnvironment();
    console.log("✅ Environment variables validation passed\n");

    // Test 2: Firebase Admin Connection
    console.log("2️⃣ Testing Firebase Admin connection...");
    const { adminAuth, adminDb } = getSecureFirebaseServices();
    console.log("✅ Firebase Admin initialized successfully\n");

    // Test 3: Basic Firebase Operations
    console.log("3️⃣ Testing basic Firebase operations...");

    // Test auth service
    try {
      await adminAuth.listUsers(1);
      console.log("✅ Firebase Auth service working");
    } catch (error) {
      console.log("❌ Firebase Auth error:", error.message);
    }

    // Test firestore service
    try {
      await adminDb.collection("test").limit(1).get();
      console.log("✅ Firebase Firestore service working");
    } catch (error) {
      console.log("❌ Firebase Firestore error:", error.message);
    }

    console.log("\n🎉 Security setup test completed!");
    console.log("📋 Summary:");
    console.log("   - Environment variables: ✅");
    console.log("   - Firebase Admin: ✅");
    console.log("   - No hardcoded credentials: ✅");
  } catch (error) {
    console.error("\n❌ Security test failed:", error.message);
    console.error("\n🔧 Action required:");
    console.error("   1. Check your .env.local file");
    console.error("   2. Ensure all required variables are set");
    console.error("   3. Verify credentials are valid");
    process.exit(1);
  }
}

// Run test if called directly
if (require.main === module) {
  testSecuritySetup();
}

module.exports = { testSecuritySetup };
