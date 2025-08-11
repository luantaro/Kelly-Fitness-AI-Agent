const admin = require("firebase-admin");

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = require("../firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkUserData() {
  try {
    // Get all users to find the one with email freeuser1@test.com
    const usersSnapshot = await db.collection("users").get();

    console.log("📋 All users in database:");
    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`\n👤 User ID: ${doc.id}`);
      console.log(`📧 Email: ${data.email || "N/A"}`);
      console.log(`📛 Display Name: ${data.displayName || "N/A"}`);
      console.log(`💳 Subscription: ${data.subscription || "N/A"}`);
      console.log(`✅ Is Active: ${data.isActive || false}`);
      console.log(`🔗 Status: ${data.status || "N/A"}`);
      console.log(`👨‍💼 Activated by Admin: ${data.activatedByAdmin || false}`);
      console.log(
        `📅 Subscription Start: ${data.subscriptionStartDate || "N/A"}`
      );
      console.log(`📅 Subscription End: ${data.subscriptionEndDate || "N/A"}`);
      console.log(`⏰ Trial End: ${data.trialEndDate || "N/A"}`);
      console.log("---");
    });

    // Try to find user by email
    const freeUserQuery = await db
      .collection("users")
      .where("email", "==", "freeuser1@test.com")
      .get();

    if (!freeUserQuery.empty) {
      console.log("\n🎯 Found freeuser1@test.com:");
      freeUserQuery.docs.forEach((doc) => {
        console.log("Full data:", JSON.stringify(doc.data(), null, 2));
      });
    } else {
      console.log("\n❌ User freeuser1@test.com not found");
    }
  } catch (error) {
    console.error("Error checking user data:", error);
  }
}

checkUserData();
