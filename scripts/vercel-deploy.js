#!/usr/bin/env node

/**
 * 🚀 Vercel Deployment Script
 * Deploy Next.js app to Vercel (optimal for Next.js)
 */

const { execSync } = require("child_process");

console.log("🚀 KELLY FITNESS AI - VERCEL DEPLOYMENT");
console.log("======================================\n");

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
  console.log("📋 VERCEL DEPLOYMENT CHECKLIST:\n");

  // 1. Install Vercel CLI if needed
  console.log("1️⃣ Checking Vercel CLI...");
  try {
    execSync("vercel --version", { stdio: "pipe" });
    console.log("✅ Vercel CLI found\n");
  } catch {
    console.log("📦 Installing Vercel CLI...");
    if (!runCommand("npm install -g vercel", "Installing Vercel CLI")) {
      process.exit(1);
    }
  }

  // 2. Final security scan
  console.log("2️⃣ Security scan...");
  if (!runCommand("node scripts/scan-secrets.js", "Secret scanning")) {
    process.exit(1);
  }

  // 3. Test build
  console.log("3️⃣ Testing build...");
  if (!runCommand("npm run build", "Building application")) {
    process.exit(1);
  }

  // 4. Deploy to Vercel
  console.log("4️⃣ Deploying to Vercel...");
  console.log(
    "🔐 Note: You'll need to set environment variables in Vercel dashboard"
  );
  console.log(
    "📝 Required env vars: OPENAI_API_KEY, FIREBASE_PRIVATE_KEY, etc.\n"
  );

  if (!runCommand("vercel --prod", "Vercel deployment")) {
    console.log("💡 Try: vercel login first, then vercel --prod");
    process.exit(1);
  }

  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("✨ Your app is now live on Vercel!");
  console.log("");
  console.log("📋 POST-DEPLOYMENT CHECKLIST:");
  console.log("1. Set environment variables in Vercel dashboard");
  console.log("2. Test all API endpoints");
  console.log("3. Verify Firebase connection");
  console.log("4. Test OpenAI integration");
  console.log("5. Check security headers");
}

deploy().catch(console.error);
