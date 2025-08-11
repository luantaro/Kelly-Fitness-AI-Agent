/**
 * Check Firebase Google Auth Configuration
 * This script will verify if Google Auth is properly configured
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const envFile = readFileSync(envPath, "utf8");
    const envVars = {};

    envFile.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...values] = trimmed.split("=");
        envVars[key] = values.join("=").replace(/^"(.*)"$/, "$1");
      }
    });

    return envVars;
  } catch (error) {
    console.error("Error loading .env.local:", error.message);
    return {};
  }
}

const env = loadEnvFile();

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("🔥 Firebase Configuration Check");
console.log("================================");
console.log("Project ID:", firebaseConfig.projectId);
console.log("Auth Domain:", firebaseConfig.authDomain);
console.log("API Key:", firebaseConfig.apiKey ? "✅ Present" : "❌ Missing");
console.log("");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("🔑 Google Auth Provider Check");
console.log("==============================");

try {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");

  console.log("✅ Google Auth Provider initialized successfully");
  console.log("Scopes:", provider.scopes);
  console.log("");

  console.log("🌐 Required Authorized Domains for Development:");
  console.log("=============================================");
  console.log("• localhost (for localhost:3002)");
  console.log("• 127.0.0.1 (alternative local)");
  console.log("• Your production domain");
  console.log("");

  console.log("📋 To fix Google Auth issues:");
  console.log("=============================");
  console.log("1. Go to Firebase Console: https://console.firebase.google.com");
  console.log("2. Select project:", firebaseConfig.projectId);
  console.log("3. Go to Authentication > Settings > Authorized domains");
  console.log("4. Add these domains:");
  console.log("   • localhost");
  console.log("   • 127.0.0.1");
  console.log("5. Go to Authentication > Sign-in method");
  console.log("6. Enable Google sign-in provider");
  console.log("7. Configure OAuth consent screen in Google Cloud Console");
  console.log("");

  console.log("🔧 Current Auth Configuration:");
  console.log("==============================");
  console.log("Auth Domain:", auth.config.authDomain);
  console.log("API Key:", auth.config.apiKey ? "✅ Present" : "❌ Missing");
  console.log("");
} catch (error) {
  console.error("❌ Error initializing Google Auth Provider:", error);
}

console.log("✅ Configuration check completed!");
