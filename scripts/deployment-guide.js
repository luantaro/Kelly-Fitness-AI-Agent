#!/usr/bin/env node

/**
 * 🚀 Final Deployment Helper
 * Hướng dẫn từng bước để deploy production
 */

console.log("🚀 KELLY FITNESS AI - FINAL DEPLOYMENT");
console.log("=====================================\n");

console.log("📋 CHECKLIST BƯỚC CUỐI CÙNG:\n");

console.log("1️⃣ **LẤY OPENAI API KEY:**");
console.log("   🔗 https://platform.openai.com/api-keys");
console.log("   - Login to OpenAI Platform");
console.log('   - Click "Create new secret key"');
console.log("   - Copy key (starts with sk-proj-)");
console.log("   - Paste vào .env.local\n");

console.log("2️⃣ **LẤY FIREBASE PRIVATE KEY:**");
console.log("   🔗 https://console.firebase.google.com/");
console.log("   - Select project: kelly-fitness-93e58");
console.log("   - Go to Project Settings > Service Accounts");
console.log('   - Click "Generate new private key"');
console.log("   - Download JSON file");
console.log("   - Copy private_key value vào .env.local\n");

console.log("3️⃣ **CẬP NHẬT .env.local:**");
console.log("   ```bash");
console.log("   OPENAI_API_KEY=sk-proj-[YOUR_REAL_KEY_HERE]");
console.log(
  '   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n[REAL_KEY]\\n-----END PRIVATE KEY-----\\n"'
);
console.log("   ```\n");

console.log("4️⃣ **VERIFY & DEPLOY:**");
console.log("   ```bash");
console.log("   # Kiểm tra environment");
console.log("   node scripts/check-environment.js");
console.log("");
console.log("   # Final security check");
console.log("   node scripts/final-security-check.js");
console.log("");
console.log("   # Deploy production");
console.log("   npm run build && npm start");
console.log("   ```\n");

console.log("⚠️  **LƯU Ý QUAN TRỌNG:**");
console.log("   - Không commit .env.local vào git");
console.log("   - Backup credentials ở nơi an toàn");
console.log("   - Rotate keys định kỳ (3-6 tháng)");
console.log("   - Monitor usage và costs\n");

console.log("🎯 **SAU KHI DEPLOY:**");
console.log("   - Test basic functions");
console.log("   - Verify no console errors");
console.log("   - Check Firebase connection");
console.log("   - Test OpenAI API calls");
console.log("   - Run weekly: node scripts/scan-secrets.js\n");

console.log("✨ **BẠN ĐÃ SẴN SÀNG! Chỉ cần thay credentials là xong!** 🚀");
