const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("../firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function createSubscriptionLogs() {
  try {
    console.log("🔄 Creating sample subscription logs...");

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

      // Create a few sample subscription logs for each user
      const logs = [
        {
          userId,
          userEmail: userData.email || "unknown@example.com",
          action: "subscription_created",
          fromStatus: null,
          toStatus: "free",
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ), // 7 days ago
          adminId: "system",
          adminEmail: "system@kelly-fitness.com",
          reason: "Account created",
        },
        {
          userId,
          userEmail: userData.email || "unknown@example.com",
          action: "last_login_updated",
          fromStatus: "free",
          toStatus: "free",
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          ), // 2 days ago
          adminId: "system",
          adminEmail: "system@kelly-fitness.com",
          reason: "User login activity",
        },
      ];

      // Add upgrade log if user is pro
      if (userData.subscription === "pro") {
        logs.push({
          userId,
          userEmail: userData.email || "unknown@example.com",
          action: "subscription_upgraded",
          fromStatus: "free",
          toStatus: "pro",
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          ), // 1 day ago
          adminId: "admin@kelly-fitness.com",
          adminEmail: "admin@kelly-fitness.com",
          reason: "Manual upgrade by admin",
        });
      }

      // Add each log to Firestore
      logs.forEach((log) => {
        promises.push(db.collection("subscriptionLogs").add(log));
      });
    });

    await Promise.all(promises);

    console.log("✅ Sample subscription logs created successfully!");
    console.log(`📊 Created ${promises.length} subscription log entries`);
  } catch (error) {
    console.error("❌ Error creating subscription logs:", error);
  }
}

createSubscriptionLogs()
  .then(() => {
    console.log("🎉 Subscription logs setup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to setup subscription logs:", error);
    process.exit(1);
  });
