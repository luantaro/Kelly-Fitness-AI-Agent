const admin = require("firebase-admin");
const { readFileSync } = require("fs");

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync("./firebase-service-account.json", "utf8")
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kelly-fitness-ai-default-rtdb.firebaseio.com",
  });
}

async function checkAuthUser() {
  try {
    const email = "freeuser1@test.com";
    console.log(`🔍 Checking Firebase Auth for: ${email}`);

    // Try to get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log("✅ User found in Firebase Auth:");
    console.log("  UID:", userRecord.uid);
    console.log("  Email:", userRecord.email);
    console.log("  Display Name:", userRecord.displayName);
    console.log("  Email Verified:", userRecord.emailVerified);
    console.log("  Disabled:", userRecord.disabled);
    console.log("  Created:", userRecord.metadata.creationTime);
    console.log("  Last Sign In:", userRecord.metadata.lastSignInTime);

    // Also check admin user
    console.log("\n🔍 Checking admin user...");
    const adminUser = await admin.auth().getUserByEmail("taro2255@gmail.com");
    console.log("✅ Admin user found:");
    console.log("  UID:", adminUser.uid);
    console.log("  Email:", adminUser.email);
    console.log("  Display Name:", adminUser.displayName);
  } catch (error) {
    console.error("❌ Error checking auth:", error.message);

    // If user not found, list all users to see what we have
    console.log("\n📋 Listing all Firebase Auth users:");
    const listResult = await admin.auth().listUsers();
    listResult.users.forEach((user) => {
      console.log(
        `  - ${user.email} (${user.uid}) - ${user.displayName || "No name"}`
      );
    });
  }
}

checkAuthUser().then(() => process.exit(0));
