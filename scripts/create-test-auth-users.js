const admin = require("firebase-admin");

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const serviceAccount = require("./firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function createTestAuthUsers() {
  try {
    console.log("🔐 Creating Firebase Auth users for testing...\n");

    const testUsers = [
      {
        uid: "test-free-user-1",
        email: "freeuser1@test.com",
        password: "test123456",
        displayName: "Free Test User 1",
      },
      {
        uid: "test-free-user-2",
        email: "freeuser2@test.com",
        password: "test123456",
        displayName: "Free Test User 2",
      },
      {
        uid: "test-pro-user-1",
        email: "prouser1@test.com",
        password: "test123456",
        displayName: "Pro Test User 1",
      },
    ];

    for (const testUser of testUsers) {
      try {
        // Check if user already exists
        try {
          const existingUser = await admin.auth().getUser(testUser.uid);
          console.log(`⏭️  Auth user already exists: ${existingUser.email}`);
          continue;
        } catch (error) {
          // User doesn't exist, create it
        }

        const userRecord = await admin.auth().createUser({
          uid: testUser.uid,
          email: testUser.email,
          password: testUser.password,
          displayName: testUser.displayName,
          emailVerified: true,
        });

        console.log(
          `✅ Created Firebase Auth user: ${userRecord.email} (${userRecord.uid})`
        );
      } catch (error) {
        console.error(
          `❌ Error creating user ${testUser.email}:`,
          error.message
        );
      }
    }

    console.log("\n📋 Test Users Summary:");
    console.log(
      "┌─────────────────────────────────────────────────────────────┐"
    );
    console.log(
      "│                     FREE USERS FOR TESTING                  │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┤"
    );
    console.log(
      "│ Email: freeuser1@test.com                                   │"
    );
    console.log(
      "│ Password: test123456                                        │"
    );
    console.log(
      "│ Quota: 2 meal plans/month, unlimited chat                  │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┤"
    );
    console.log(
      "│ Email: freeuser2@test.com                                   │"
    );
    console.log(
      "│ Password: test123456                                        │"
    );
    console.log(
      "│ Quota: 2 meal plans/month, unlimited chat                  │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┤"
    );
    console.log(
      "│ Email: freetestuser1@kelly-fitness.com                     │"
    );
    console.log(
      "│ Password: (existing user - check Firebase console)         │"
    );
    console.log(
      "│ Quota: 2 meal plans/month, unlimited chat                  │"
    );
    console.log(
      "└─────────────────────────────────────────────────────────────┘"
    );

    console.log(
      "\n┌─────────────────────────────────────────────────────────────┐"
    );
    console.log(
      "│                     PRO USER FOR TESTING                    │"
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┤"
    );
    console.log(
      "│ Email: prouser1@test.com                                    │"
    );
    console.log(
      "│ Password: test123456                                        │"
    );
    console.log(
      "│ Quota: Unlimited everything                                │"
    );
    console.log(
      "└─────────────────────────────────────────────────────────────┘"
    );

    console.log("\n🧪 How to test quota system:");
    console.log("1. 🔐 Login as freeuser1@test.com / test123456");
    console.log("2. 💬 Chat normally - should be unlimited");
    console.log("3. 🍽️  Ask for meal plan - should work for first 2 times");
    console.log("4. 🚫 Try 3rd meal plan - should show quota exceeded message");
    console.log("5. 📊 Check sidebar UsageIndicator for progress bars");
    console.log("6. 🔄 Wait for next month or manually reset in Firestore");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit(0);
  }
}

createTestAuthUsers();
