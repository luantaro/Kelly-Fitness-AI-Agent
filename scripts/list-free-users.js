const admin = require("firebase-admin");

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const serviceAccount = require("./firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function listFreeUsers() {
  try {
    console.log("🔍 Checking userUsage collection...");

    // Check userUsage collection
    const userUsageSnapshot = await db.collection("userUsage").get();

    if (userUsageSnapshot.empty) {
      console.log("❌ No users found in userUsage collection");
    } else {
      console.log(
        `\n📊 Found ${userUsageSnapshot.size} users in userUsage collection:\n`
      );

      userUsageSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`👤 User: ${data.email || "Unknown"}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Subscription: ${data.subscription || "Unknown"}`);
        console.log(
          `   Menu Usage: ${data.monthlyMenuCount || 0}/${
            data.subscription === "pro" ? "∞" : "2"
          }`
        );
        console.log(`   Chat Usage: ${data.dailyChatCount || 0} (unlimited)`);
        console.log(`   Last Menu Reset: ${data.lastMenuResetDate || "N/A"}`);
        console.log(`   Created: ${data.createdAt || "N/A"}`);
        console.log("   ---");
      });
    }

    console.log("\n🔍 Checking legacy users collection...");

    // Check legacy users collection
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      console.log("❌ No users found in legacy users collection");
    } else {
      console.log(
        `\n📊 Found ${usersSnapshot.size} users in legacy users collection:\n`
      );

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`👤 User: ${data.email || "Unknown"}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Subscription: ${data.subscription || "Unknown"}`);
        console.log(`   Daily Messages: ${data.dailyMessageCount || 0}`);
        console.log(`   Created: ${data.createdAt || "N/A"}`);
        console.log("   ---");
      });
    }

    console.log("\n🆓 Creating test free users...");

    // Create some test free users
    const testUsers = [
      {
        userId: "test-free-user-1",
        email: "freeuser1@test.com",
        subscription: "free",
      },
      {
        userId: "test-free-user-2",
        email: "freeuser2@test.com",
        subscription: "free",
      },
      {
        userId: "test-pro-user-1",
        email: "prouser1@test.com",
        subscription: "pro",
      },
    ];

    for (const testUser of testUsers) {
      const userRef = db.collection("userUsage").doc(testUser.userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const currentMonth = now.toISOString().slice(0, 7);

        const userData = {
          userId: testUser.userId,
          email: testUser.email,
          subscription: testUser.subscription,
          dailyChatCount: 0,
          lastChatResetDate: today,
          monthlyMenuCount: 0,
          lastMenuResetDate: currentMonth,
          dailyExportCount: 0,
          lastExportResetDate: today,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };

        await userRef.set(userData);
        console.log(
          `✅ Created test user: ${testUser.email} (${testUser.subscription})`
        );
      } else {
        console.log(`⏭️  User already exists: ${testUser.email}`);
      }
    }

    console.log("\n🎯 Free users available for testing:");
    console.log("1. freeuser1@test.com (password: test123456)");
    console.log("2. freeuser2@test.com (password: test123456)");
    console.log('3. Any user with subscription: "free" in the database');

    console.log("\n📝 To test quota limits:");
    console.log("1. Login as free user");
    console.log("2. Try to create 3 meal plans (should block after 2)");
    console.log("3. Chat should be unlimited");
    console.log("4. Check UsageIndicator in sidebar");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit(0);
  }
}

listFreeUsers();
