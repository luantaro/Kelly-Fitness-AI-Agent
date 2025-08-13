#!/usr/bin/env node

/**
 * 🚀 Firebase Static Deploy
 * Deploy static version of Next.js app to Firebase
 */

const { execSync } = require("child_process");
const fs = require("fs");

console.log("🚀 FIREBASE STATIC DEPLOYMENT");
console.log("==============================\n");

function runCommand(command, description) {
  console.log(`⏳ ${description}...`);
  try {
    execSync(command, {
      encoding: "utf8",
      stdio: "inherit",
      cwd: process.cwd(),
    });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}\n`);
    return false;
  }
}

async function deploy() {
  console.log("📋 STATIC DEPLOYMENT STEPS:\n");

  // 1. Security scan
  console.log("1️⃣ Security scan...");
  if (!runCommand("node scripts/scan-secrets.js", "Secret scanning")) {
    process.exit(1);
  }

  // 2. Build for static export
  console.log("2️⃣ Building static version...");

  // Backup current config
  if (fs.existsSync("next.config.ts")) {
    fs.copyFileSync("next.config.ts", "next.config.ts.backup");
  }

  // Use static config
  fs.copyFileSync("next.config.static.js", "next.config.js");

  if (!runCommand("npm run build", "Building static app")) {
    // Restore config
    if (fs.existsSync("next.config.ts.backup")) {
      fs.copyFileSync("next.config.ts.backup", "next.config.ts");
    }
    fs.unlinkSync("next.config.js");
    process.exit(1);
  }

  // 3. Copy static files to public
  console.log("3️⃣ Preparing static files...");
  try {
    if (fs.existsSync("out")) {
      // Copy out directory to public for Firebase
      execSync("xcopy out public\\ /E /I /Y", { stdio: "inherit" });
    }
    console.log("✅ Static files prepared\n");
  } catch (error) {
    console.log(`❌ Static prep failed: ${error.message}\n`);
  }

  // 4. Deploy to Firebase
  console.log("4️⃣ Deploying to Firebase...");
  if (
    !runCommand("firebase deploy --only hosting", "Firebase hosting deployment")
  ) {
    process.exit(1);
  }

  // Restore config
  if (fs.existsSync("next.config.ts.backup")) {
    fs.copyFileSync("next.config.ts.backup", "next.config.ts");
    fs.unlinkSync("next.config.ts.backup");
  }
  if (fs.existsSync("next.config.js")) {
    fs.unlinkSync("next.config.js");
  }

  console.log("🎉 STATIC DEPLOYMENT SUCCESSFUL!");
  console.log("✨ Your app is live at: https://kelly-fitness-93e58.web.app");
  console.log("");
  console.log("⚠️  NOTE: API routes won't work in static mode");
  console.log("💡 For full functionality, consider Vercel deployment");
}

deploy().catch(console.error);
