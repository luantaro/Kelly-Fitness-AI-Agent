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

const adminDb = admin.firestore();

async function checkAndFixPendingUsers() {
  console.log("🔍 Checking pending users status...\n");

  try {
    // Find users with pending emails
    const pendingEmails = [
      "pending1@kelly-fitness.com",
      "pending2@kelly-fitness.com",
    ];

    for (const email of pendingEmails) {
      console.log(`📧 Checking user: ${email}`);

      // Query user by email
      const userQuery = await adminDb
        .collection("users")
        .where("email", "==", email)
        .get();

      if (userQuery.empty) {
        console.log(`❌ User not found: ${email}\n`);
        continue;
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();
      const uid = userDoc.id;

      console.log(`   Current status: ${userData.status || "undefined"}`);
      console.log(
        `   Trial end: ${
          userData.trialEndDate ? userData.trialEndDate.toDate() : "undefined"
        }`
      );
      console.log(
        `   Subscription status: ${userData.subscriptionStatus || "undefined"}`
      );

      // Update to pending_activation if not already set
      if (userData.status !== "pending_activation") {
        console.log(`   🔧 Updating status to pending_activation...`);

        await adminDb.collection("users").doc(uid).update({
          status: "pending_activation",
          subscriptionStatus: "inactive",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`   ✅ Status updated successfully!`);
      } else {
        console.log(`   ✅ Status already correct`);
      }

      console.log(`   🆔 UID: ${uid}\n`);
    }

    console.log("🎉 Check completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkAndFixPendingUsers();
