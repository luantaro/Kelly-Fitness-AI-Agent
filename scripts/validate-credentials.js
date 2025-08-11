#!/usr/bin/env node

/**
 * 🔑 Credential Validator
 * Test credentials ngay sau khi nhập
 */

require("dotenv").config({ path: ".env.local" });

async function validateCredentials() {
  console.log("🔑 TESTING CREDENTIALS...\n");

  let allValid = true;

  // Test OpenAI API Key
  console.log("🤖 Testing OpenAI API Key...");
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey || openaiKey.includes("YOUR_NEW_")) {
      console.log("   ❌ OpenAI key missing or placeholder");
      allValid = false;
    } else {
      // Simple format check
      if (openaiKey.startsWith("sk-") && openaiKey.length > 20) {
        console.log("   ✅ OpenAI key format looks valid");
      } else {
        console.log("   ⚠️  OpenAI key format suspicious");
        allValid = false;
      }
    }
  } catch (error) {
    console.log(`   ❌ OpenAI test failed: ${error.message}`);
    allValid = false;
  }

  // Test Firebase Admin
  console.log("🔥 Testing Firebase Admin...");
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!privateKey || privateKey.includes("YOUR_NEW_")) {
      console.log("   ❌ Firebase private key missing or placeholder");
      allValid = false;
    } else if (!privateKey.includes("BEGIN PRIVATE KEY")) {
      console.log("   ❌ Firebase private key format invalid");
      allValid = false;
    } else {
      console.log("   ✅ Firebase private key format valid");
    }

    if (clientEmail && projectId) {
      console.log("   ✅ Firebase config complete");
    } else {
      console.log("   ❌ Firebase config incomplete");
      allValid = false;
    }
  } catch (error) {
    console.log(`   ❌ Firebase test failed: ${error.message}`);
    allValid = false;
  }

  console.log("\n" + "=".repeat(50));

  if (allValid) {
    console.log("🎉 ALL CREDENTIALS VALID!");
    console.log("✅ Ready to run final security check");
    console.log("\n📋 NEXT STEPS:");
    console.log("   node scripts/final-security-check.js");
    console.log("   npm run build");
    console.log("   npm start");
  } else {
    console.log("❌ CREDENTIAL ISSUES FOUND");
    console.log("📋 Please fix the issues above and try again");
  }

  return allValid;
}

validateCredentials().then((success) => {
  process.exit(success ? 0 : 1);
});
