const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addSubscriptionDates() {
  try {
    console.log("🔍 Checking users for Pro subscription...");
    const usersSnapshot = await db.collection("users").get();

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;

      console.log(
        `📋 User: ${userData.email} - Subscription: ${userData.subscription}`
      );

      // Nếu user có subscription = 'pro' nhưng chưa có subscription dates
      if (userData.subscription === "pro" && !userData.subscriptionStartDate) {
        const startDate = new Date("2025-01-01");
        const endDate = new Date("2025-12-31");

        await db.collection("users").doc(uid).update({
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          subscriptionDurationMonths: 12,
        });

        console.log(
          `✅ Updated subscription dates for user: ${userData.email}`
        );
        console.log(`   Start: ${startDate.toLocaleDateString()}`);
        console.log(`   End: ${endDate.toLocaleDateString()}`);
      } else if (
        userData.subscription === "pro" &&
        userData.subscriptionStartDate
      ) {
        console.log(
          `ℹ️  User ${userData.email} already has subscription dates`
        );
      }
    }

    console.log("✅ Subscription dates update completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addSubscriptionDates();
