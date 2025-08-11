const admin = require("firebase-admin");

// Initialize Firebase Admin
const serviceAccount = require("./firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkUsers() {
  try {
    console.log("🔍 Checking users in database...\n");

    const usersSnapshot = await db.collection("users").get();

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const uid = doc.id;

      // Focus on pending users
      if (
        userData.email?.includes("pending") ||
        userData.status === "pending_activation"
      ) {
        console.log(`📋 USER: ${userData.email}`);
        console.log(`   UID: ${uid}`);
        console.log(`   Status: ${userData.status}`);
        console.log(`   IsActive: ${userData.isActive}`);
        console.log(`   Subscription Status: ${userData.subscriptionStatus}`);
        console.log(`   Created At: ${userData.createdAt}`);
        console.log(`   Trial End: ${userData.trialEnd}`);
        console.log("   ---");
      }
    });

    console.log("\n✅ Done checking users!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkUsers();
