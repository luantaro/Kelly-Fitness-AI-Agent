#!/usr/bin/env node

/**
 * 🚀 Firebase Deployment Script
 * Unified deployment for both frontend and backend.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 KELLY FITNESS AI - FIREBASE DEPLOYMENT");
console.log("=========================================\n");

function runCommand(command, description) {
  console.log(`⏳ ${description}...`);
  try {
    const output = execSync(command, {
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
  console.log("📋 DEPLOYMENT CHECKLIST:\n");

  // 1. Final security scan
  console.log("1️⃣ Security scan...");
  if (!runCommand("node scripts/scan-secrets.js", "Secret scanning")) {
    process.exit(1);
  }

  // 2. Build production
  console.log("2️⃣ Production build...");
  if (!runCommand("npm run build", "Building application")) {
    process.exit(1);
  }

  // 3. Copy build for Firebase
  console.log("3️⃣ Preparing Firebase files...");
  try {
    const preserveFiles = [
      "favicon.ico",
      "favicon.svg",
      "manifest.json",
      "apple-touch-icon.svg",
      "file.svg",
      "globe.svg",
      "next.svg",
      "vercel.svg",
      "window.svg",
    ];

    // Create public directory structure for Firebase
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }

    // Copy index.html from .next to public
    if (fs.existsSync(".next/server/app/index.html")) {
      fs.copyFileSync(".next/server/app/index.html", "public/index.html");
    }

    if (fs.existsSync("out")) {
      fs.cpSync("out", "public", { recursive: true });
    }

    console.log("✅ Firebase files prepared\n");
  } catch (error) {
    console.log(`❌ Firebase prep failed: ${error.message}\n`);
    process.exit(1);
  }

  // 4. Deploy to Firebase
  console.log("4️⃣ Deploying to Firebase...");
  if (!runCommand("firebase deploy", "Firebase deployment")) {
    process.exit(1);
  }

  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("✨ Your app is now live on Firebase Hosting!");
  console.log("🔗 Check your Firebase console for the live URL");
}

deploy().catch(console.error);
