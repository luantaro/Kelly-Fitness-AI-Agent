require("dotenv").config({ path: ".env.local" });
const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail:
        "firebase-adminsdk-fbsvc@kelly-fitness-93e58.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

async function createMorePendingUsers() {
  console.log("🚀 Creating 2 more test pending users...\n");

  const newPendingUsers = [
    { email: "test.pending3@kelly-fitness.com", name: "Lê Văn Test3" },
    { email: "test.pending4@kelly-fitness.com", name: "Phạm Thị Test4" },
  ];

  const createdUsers = [];

  for (const userData of newPendingUsers) {
    try {
      console.log(`🔄 Creating pending user: ${userData.email}`);

      // Create Firebase Auth user
      const userRecord = await adminAuth.createUser({
        email: userData.email,
        password: "TestPassword123!",
        displayName: userData.name,
        emailVerified: true,
      });

      console.log(`✅ Firebase Auth user created: ${userData.email}`);

      // Calculate trial expiry (1 day ago to make it expired)
      const trialStartDate = new Date();
      trialStartDate.setDate(trialStartDate.getDate() - 4); // 4 days ago

      const trialExpiryDate = new Date();
      trialExpiryDate.setDate(trialExpiryDate.getDate() - 1); // 1 day ago (expired)

      // Create user profile in Firestore with EXPLICIT pending status
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userData.name,
        photoURL: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),

        // CRITICAL: Trial system fields
        trialStartDate: admin.firestore.Timestamp.fromDate(trialStartDate),
        trialEndDate: admin.firestore.Timestamp.fromDate(trialExpiryDate),
        status: "pending_activation", // 🎯 THIS IS THE KEY FIELD

        // Subscription fields
        subscriptionStatus: "inactive",
        subscriptionPlan: "free",
        subscription: "free", // Make sure this is 'free'
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        subscriptionDurationMonths: 0,

        // User settings
        isActive: true, // User can login but limited access
        activatedByAdmin: false,

        // Default settings
        settings: {
          notifications: true,
          theme: "light",
          language: "vi",
        },

        // Usage tracking
        usage: {
          messagesCount: 0,
          menusCreated: 0,
          lastActivityDate: null,
        },

        // Daily limits
        dailyMessageCount: 0,
        lastResetDate: new Date().toISOString().split("T")[0],
      };

      await adminDb.collection("users").doc(userRecord.uid).set(userProfile);
      console.log(
        `✅ Firestore user profile created with EXPLICIT pending status`
      );

      createdUsers.push({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userData.name,
        status: "pending_activation",
      });

      console.log(`✅ Pending user created successfully!`);
      console.log(`   📧 Email: ${userRecord.email}`);
      console.log(`   🔑 Password: TestPassword123!`);
      console.log(`   👤 Name: ${userData.name}`);
      console.log(`   📊 Status: pending_activation`);
      console.log(`   🆔 UID: ${userRecord.uid}\n`);
    } catch (error) {
      console.error(
        `❌ Failed to create user: ${userData.email}`,
        error.message
      );
    }
  }

  console.log(
    `🎉 Successfully created ${createdUsers.length} more pending users!\n`
  );

  // Verify all pending users in database
  console.log("🔍 Verifying ALL pending users in database...");
  const pendingQuery = await adminDb
    .collection("users")
    .where("status", "==", "pending_activation")
    .get();

  console.log(`📊 Total pending users in database: ${pendingQuery.size}`);

  pendingQuery.forEach((doc) => {
    const data = doc.data();
    console.log(
      `   📧 ${data.email} - Status: ${data.status} - UID: ${doc.id}`
    );
  });

  console.log("\n🎯 Next steps:");
  console.log("1. Refresh admin dashboard: http://localhost:3000/admin");
  console.log("2. Check browser console for debug logs");
  console.log('3. Look for yellow "⏳ Chờ kích hoạt" badges');
  console.log('4. Look for green "Activate" buttons');

  console.log("✅ Script completed successfully!");
}

createMorePendingUsers();
