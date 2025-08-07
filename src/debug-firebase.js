// Debug Firebase connection
import { db, auth } from "./lib/firebase.js";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Test Firebase connection
async function testFirebaseConnection() {
  console.log("🔥 Testing Firebase connection...");

  try {
    // Test auth
    console.log("🔐 Auth instance:", auth);
    console.log("🔐 Current user:", auth.currentUser);

    // Test Firestore
    console.log("📊 Firestore instance:", db);

    // Test writing to Firestore
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      userId: "test-user-123",
    };

    const docRef = await addDoc(collection(db, "test"), testData);
    console.log("✅ Test document written with ID: ", docRef.id);

    // Test reading from Firestore
    const querySnapshot = await getDocs(collection(db, "test"));
    console.log("📖 Test documents count:", querySnapshot.size);

    querySnapshot.forEach((doc) => {
      console.log("📄 Document data:", doc.id, " => ", doc.data());
    });

    // Test chatHistory collection
    const chatHistoryQuery = query(
      collection(db, "chatHistory"),
      where("userId", "==", "test-user-123")
    );

    const chatHistorySnapshot = await getDocs(chatHistoryQuery);
    console.log("💬 Chat history count:", chatHistorySnapshot.size);
  } catch (error) {
    console.error("❌ Firebase test failed:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
  }
}

// Run test
testFirebaseConnection();
