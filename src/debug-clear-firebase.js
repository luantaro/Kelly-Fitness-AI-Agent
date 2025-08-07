// Debug script to clear all Firebase data
// RUN: node src/debug-clear-firebase.js

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function clearAllChatHistories() {
  console.log("🔥 Starting to clear all chat histories...");

  try {
    // Get all chat histories
    const snapshot = await db.collection("chatHistories").get();
    console.log(`📊 Found ${snapshot.size} chat histories to delete`);

    if (snapshot.empty) {
      console.log("✅ No chat histories found to delete");
      return;
    }

    // Delete in batches
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      console.log(`🗑️  Deleting: ${doc.id}`);
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("✅ All chat histories deleted successfully!");
  } catch (error) {
    console.error("❌ Error clearing chat histories:", error);
  }
}

// Run the cleanup
clearAllChatHistories()
  .then(() => {
    console.log("🎉 Cleanup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Cleanup failed:", error);
    process.exit(1);
  });
