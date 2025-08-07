// Script to clean ALL Firebase collections
// RUN: node src/debug-clean-all-firebase.js

const admin = require("firebase-admin");

// Initialize Firebase Admin
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanAllCollections() {
  console.log("🔥 Starting COMPLETE Firebase cleanup...");

  const collectionsToClean = [
    "chatHistory",
    "chatMessages",
    "analytics",
    "mealPlans",
  ];

  for (const collectionName of collectionsToClean) {
    try {
      console.log(`\n📁 Processing collection: ${collectionName}`);

      // Get all documents in batches
      let deleted = 0;
      let hasMore = true;

      while (hasMore) {
        const snapshot = await db.collection(collectionName).limit(500).get();

        if (snapshot.empty) {
          hasMore = false;
          console.log(`✅ No more documents in ${collectionName}`);
          break;
        }

        console.log(
          `🗑️  Deleting batch of ${snapshot.size} documents from ${collectionName}`
        );

        // Delete in batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        deleted += snapshot.size;

        console.log(
          `✅ Deleted ${deleted} documents so far from ${collectionName}`
        );
      }

      console.log(
        `🎉 Finished cleaning ${collectionName}. Total deleted: ${deleted}`
      );
    } catch (error) {
      console.error(`❌ Error cleaning ${collectionName}:`, error);
    }
  }
}

// Run the cleanup
cleanAllCollections()
  .then(() => {
    console.log("\n🎉 COMPLETE CLEANUP FINISHED!");
    console.log("💫 Your app is now fresh and ready for testing!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Cleanup failed:", error);
    process.exit(1);
  });
