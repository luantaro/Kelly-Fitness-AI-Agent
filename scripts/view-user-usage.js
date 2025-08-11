const admin = require("firebase-admin");

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const serviceAccount = require("./firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function viewUserUsage() {
  try {
    console.log("📊 Current User Usage Status:\n");

    // Get all users from userUsage collection
    const userUsageSnapshot = await db.collection("userUsage").get();

    if (userUsageSnapshot.empty) {
      console.log("❌ No users found in userUsage collection");
      return;
    }

    console.log(`Found ${userUsageSnapshot.size} users:\n`);
    console.log(
      "┌──────────────────────────────────────────────────────────────────────────────────┐"
    );
    console.log(
      "│                                USER USAGE REPORT                                 │"
    );
    console.log(
      "├──────────────────────────────────────────────────────────────────────────────────┤"
    );

    userUsageSnapshot.forEach((doc) => {
      const data = doc.data();
      const subscription = data.subscription || "free";
      const menuUsed = data.monthlyMenuCount || 0;
      const menuLimit = subscription === "pro" ? "∞" : "2";
      const chatUsed = data.dailyChatCount || 0;

      console.log(
        `│ 👤 ${(data.email || "Unknown").padEnd(35)} │ ${subscription
          .toUpperCase()
          .padEnd(4)} │`
      );
      console.log(
        `│    Menu: ${menuUsed}/${menuLimit} this month (${
          data.lastMenuResetDate || "N/A"
        })`.padEnd(70) + "│"
      );
      console.log(`│    Chat: ${chatUsed} today (unlimited)`.padEnd(70) + "│");
      console.log(
        `│    Last update: ${(data.updatedAt || "N/A").split("T")[0]}`.padEnd(
          70
        ) + "│"
      );
      console.log(
        "├──────────────────────────────────────────────────────────────────────────────────┤"
      );
    });

    console.log(
      "└──────────────────────────────────────────────────────────────────────────────────┘"
    );

    // Show summary
    let freeUsers = 0;
    let proUsers = 0;
    let totalMenuUsage = 0;

    userUsageSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subscription === "pro") {
        proUsers++;
      } else {
        freeUsers++;
      }
      totalMenuUsage += data.monthlyMenuCount || 0;
    });

    console.log("\n📈 Summary:");
    console.log(`🆓 Free Users: ${freeUsers}`);
    console.log(`⭐ Pro Users: ${proUsers}`);
    console.log(`🍽️  Total Menu Plans Created This Month: ${totalMenuUsage}`);

    console.log("\n🧪 Ready to test with these users:");
    console.log("• freeuser1@test.com (password: test123456)");
    console.log("• freeuser2@test.com (password: test123456)");
    console.log("• prouser1@test.com (password: test123456)");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit(0);
  }
}

viewUserUsage();
