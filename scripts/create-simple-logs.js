const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("../firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function createSimpleSubscriptionLogs() {
  try {
    console.log(
      "🔄 Creating simple subscription logs without compound queries..."
    );

    // Get all users
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      console.log("❌ No users found. Please create users first.");
      return;
    }

    const promises = [];

    usersSnapshot.forEach((doc) => {
      const userId = doc.id;
      const userData = doc.data();

      // Create a simple log entry for each user
      const log = {
        userId,
        userEmail: userData.email || "unknown@example.com",
        action: "subscription_created",
        fromStatus: null,
        toStatus: userData.subscription || "free",
        timestamp: admin.firestore.Timestamp.now(),
        adminId: "system",
        adminEmail: "system@kelly-fitness.com",
        reason: "Account created",
      };

      promises.push(db.collection("subscriptionLogs").add(log));
    });

    await Promise.all(promises);

    console.log("✅ Simple subscription logs created successfully!");
    console.log(`📊 Created ${promises.length} subscription log entries`);
  } catch (error) {
    console.error("❌ Error creating subscription logs:", error);
  }
}

createSimpleSubscriptionLogs()
  .then(() => {
    console.log("🎉 Subscription logs setup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to setup subscription logs:", error);
    process.exit(1);
  });
