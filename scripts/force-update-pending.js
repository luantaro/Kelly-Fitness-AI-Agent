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

async function forceUpdatePendingStatus() {
  console.log("🔧 Force updating pending users status...\n");

  try {
    const pendingEmails = [
      "pending1@kelly-fitness.com",
      "pending2@kelly-fitness.com",
    ];

    for (const email of pendingEmails) {
      console.log(`📧 Updating ${email}...`);

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
      const uid = userDoc.id;

      // Force update with explicit values
      await adminDb.collection("users").doc(uid).update({
        status: "pending_activation",
        subscriptionStatus: "inactive",
        isActive: true, // Make sure this is true
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Clear any conflicting fields
        subscriptionPlan: "free",
        subscription: "free",
      });

      console.log(`   ✅ Updated ${email} - UID: ${uid}`);

      // Verify the update
      const updatedDoc = await adminDb.collection("users").doc(uid).get();
      const updatedData = updatedDoc.data();

      console.log(`   📋 Verified data:`);
      console.log(`      status: ${updatedData.status}`);
      console.log(
        `      subscriptionStatus: ${updatedData.subscriptionStatus}`
      );
      console.log(`      isActive: ${updatedData.isActive}`);
      console.log(`      subscription: ${updatedData.subscription}`);
      console.log("");
    }

    console.log(
      "🎉 Force update completed! Try refreshing admin dashboard now."
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

forceUpdatePendingStatus();
