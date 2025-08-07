// Debug script to inspect all Firebase collections
// RUN: node src/debug-inspect-firebase.js

const admin = require("firebase-admin");

// Initialize Firebase Admin
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function inspectAllCollections() {
  console.log("🔍 Inspecting all Firebase collections...");

  try {
    // List all collections
    const collections = await db.listCollections();
    console.log(
      `📂 Found ${collections.length} collections:`,
      collections.map((c) => c.id)
    );

    for (const collection of collections) {
      console.log(`\n📁 Collection: ${collection.id}`);
      const snapshot = await collection.get();
      console.log(`📊 Documents: ${snapshot.size}`);

      if (snapshot.size > 0) {
        snapshot.docs.forEach((doc, index) => {
          if (index < 5) {
            // Show first 5 documents
            console.log(
              `📄 Doc ${doc.id}:`,
              JSON.stringify(doc.data(), null, 2)
            );
          }
        });
        if (snapshot.size > 5) {
          console.log(`... and ${snapshot.size - 5} more documents`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error inspecting collections:", error);
  }
}

// Run the inspection
inspectAllCollections()
  .then(() => {
    console.log("\n🎉 Inspection completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Inspection failed:", error);
    process.exit(1);
  });
