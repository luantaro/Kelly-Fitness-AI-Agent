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

async function createPendingUser(email, displayName) {
  try {
    console.log(`🔄 Creating pending user: ${email}`);

    // Create Firebase Auth user using Admin SDK
    const userRecord = await adminAuth.createUser({
      email: email,
      password: "TestPassword123!",
      displayName: displayName,
      emailVerified: true,
    });

    console.log(`✅ Firebase Auth user created: ${email}`);

    // Calculate trial expiry (3 days ago to make it expired)
    const trialStartDate = new Date();
    trialStartDate.setDate(trialStartDate.getDate() - 4); // 4 days ago

    const trialExpiryDate = new Date();
    trialExpiryDate.setDate(trialExpiryDate.getDate() - 1); // 1 day ago (expired)

    // Create user profile in Firestore with pending status
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: displayName,
      photoURL: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),

      // Trial system fields
      trialStartDate: admin.firestore.Timestamp.fromDate(trialStartDate),
      trialEndDate: admin.firestore.Timestamp.fromDate(trialExpiryDate),
      status: "pending_activation", // This is the key status

      // Subscription fields
      subscriptionStatus: "inactive",
      subscriptionPlan: "free",
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      subscriptionDurationMonths: 0,

      // Settings
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
    };

    await adminDb.collection("users").doc(userRecord.uid).set(userProfile);
    console.log(`✅ Firestore user profile created with pending status`);

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: displayName,
      status: "pending_activation",
    };
  } catch (error) {
    console.error(`❌ Error creating user ${email}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log(
    "🚀 Creating pending activation test users for Kelly Fitness AI...\n"
  );

  const pendingUsers = [
    { email: "pending1@kelly-fitness.com", name: "Nguyễn Văn Pending" },
    { email: "pending2@kelly-fitness.com", name: "Trần Thị Waiting" },
  ];

  const createdUsers = [];

  for (const userData of pendingUsers) {
    try {
      const user = await createPendingUser(userData.email, userData.name);
      createdUsers.push(user);

      console.log(`✅ Pending user created successfully!`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: TestPassword123!`);
      console.log(`   👤 Name: ${user.displayName}`);
      console.log(`   📊 Status: ${user.status}`);
      console.log(`   🆔 UID: ${user.uid}\n`);
    } catch (error) {
      console.error(`❌ Failed to create user: ${userData.email}\n`);
    }
  }

  console.log(
    `🎉 Successfully created ${createdUsers.length} pending users!\n`
  );

  console.log("📝 Pending Users Summary:");
  console.log("════════════════════════════════════════");
  createdUsers.forEach((user, index) => {
    console.log(`👤 Pending User ${index + 1}:`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Password: TestPassword123!`);
    console.log(`   👤 Name: ${user.displayName}`);
    console.log(
      `   📊 Status: ${user.status} (Trial expired, waiting for activation)`
    );
    console.log(`   🆔 UID: ${user.uid}`);
    console.log("");
  });

  console.log("🔗 You can now:");
  console.log("   1. Go to Admin Dashboard (/admin)");
  console.log('   2. See these users in "Pending Activation" status');
  console.log("   3. Test the Activate User modal with custom duration");
  console.log("   4. These users cannot chat until activated by admin");

  console.log("✅ Script completed successfully!");
}

main().catch(console.error);
