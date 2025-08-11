#!/usr/bin/env node

/**
 * 🔧 Environment Setup Checker
 * Kiểm tra environment variables đã setup đúng chưa
 */

require("dotenv").config({ path: ".env.local" });

console.log("🔧 ENVIRONMENT SETUP CHECKER");
console.log("==============================\n");

const checks = [
  {
    name: "OpenAI API Key",
    key: "OPENAI_API_KEY",
    expect: /^sk-proj-[a-zA-Z0-9_-]{50,}$/,
    required: true,
  },
  {
    name: "Firebase Project ID",
    key: "FIREBASE_PROJECT_ID",
    expect: /^kelly-fitness-93e58$/,
    required: true,
  },
  {
    name: "Firebase Client Email",
    key: "FIREBASE_CLIENT_EMAIL",
    expect:
      /firebase-adminsdk.*@kelly-fitness-93e58\.iam\.gserviceaccount\.com/,
    required: true,
  },
  {
    name: "Firebase Private Key",
    key: "FIREBASE_PRIVATE_KEY",
    expect: /^-----BEGIN PRIVATE KEY-----\n.*\n-----END PRIVATE KEY-----\n?$/s,
    required: true,
  },
];

let allValid = true;
let missingCount = 0;

for (const check of checks) {
  const value = process.env[check.key];

  console.log(`🔍 ${check.name}:`);

  if (!value) {
    console.log(`   ❌ MISSING - Environment variable not set`);
    allValid = false;
    missingCount++;
  } else if (value.includes("YOUR_NEW_") || value.includes("_HERE")) {
    console.log(`   ⚠️  PLACEHOLDER - Needs real credentials`);
    allValid = false;
    missingCount++;
  } else if (check.expect && !check.expect.test(value)) {
    console.log(`   ❌ INVALID FORMAT`);
    allValid = false;
  } else {
    console.log(`   ✅ VALID`);
  }

  console.log("");
}

console.log("=".repeat(50));

if (allValid) {
  console.log("🎉 ALL ENVIRONMENT VARIABLES CONFIGURED!");
  console.log("✅ Ready for production build");
} else {
  console.log(`⚠️  ${missingCount} ENVIRONMENT ISSUES FOUND`);
  console.log("");
  console.log("📋 TO FIX:");
  console.log("1. Get new Firebase Private Key from Firebase Console");
  console.log("2. Get new OpenAI API Key from OpenAI Platform");
  console.log("3. Replace placeholders in .env.local");
  console.log("");
  console.log("🔗 HELPFUL LINKS:");
  console.log("• Firebase Console: https://console.firebase.google.com/");
  console.log("• OpenAI API Keys: https://platform.openai.com/api-keys");
}

process.exit(allValid ? 0 : 1);
