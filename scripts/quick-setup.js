#!/usr/bin/env node

/**
 * 🚀 Quick Setup Assistant
 * Mở browser tới đúng URLs để lấy credentials
 */

const { exec } = require("child_process");

console.log("🚀 QUICK SETUP ASSISTANT");
console.log("=========================\n");

console.log("📋 Sẽ mở browser để lấy credentials...\n");

function openURL(url, description) {
  console.log(`🔗 Opening: ${description}`);
  console.log(`   ${url}\n`);

  const start =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
      ? "start"
      : "xdg-open";

  exec(`${start} ${url}`, (error) => {
    if (error) {
      console.log(`   ⚠️  Couldn't auto-open. Please visit manually.`);
    }
  });
}

console.log("1️⃣ **OPENAI API KEY:**");
openURL("https://platform.openai.com/api-keys", "OpenAI API Keys");

console.log("2️⃣ **FIREBASE PRIVATE KEY:**");
openURL(
  "https://console.firebase.google.com/project/kelly-fitness-93e58/settings/serviceaccounts/adminsdk",
  "Firebase Service Accounts"
);

console.log("📝 **HƯỚNG DẪN:**");
console.log("   1. Login to both platforms");
console.log("   2. Generate new keys");
console.log("   3. Copy keys vào .env.local");
console.log("   4. Run: node scripts/validate-credentials.js");
console.log("   5. Run: node scripts/final-security-check.js");
console.log("");

console.log("⏳ **Waiting for you to update .env.local...**");
console.log("   (Press Ctrl+C when done)");
