import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID || "kelly-fitness-93e58",
};

// Initialize the app
const app = !getApps().length
  ? initializeApp(firebaseAdminConfig)
  : getApps()[0];

// Export services
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

// Utility function to verify Firebase ID token
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    throw error;
  }
}

// Utility function to get user by UID
export async function getUserByUid(uid: string) {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export default app;

// Admin management functions
export async function getAllUsers(limit: number = 100) {
  try {
    const listUsers = await adminAuth.listUsers(limit);
    return {
      users: listUsers.users.map((user) => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        customClaims: user.customClaims || {},
      })),
      pageToken: listUsers.pageToken,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function toggleUserStatus(uid: string, disabled: boolean) {
  try {
    await adminAuth.updateUser(uid, { disabled });
    return { success: true, uid, disabled };
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw new Error("Failed to update user status");
  }
}

export async function deleteUserAccount(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    // Also delete user data from Firestore
    await adminDb.collection("users").doc(uid).delete();
    return { success: true, uid };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

// Firestore data management
export async function getUserProfiles() {
  try {
    const snapshot = await adminDb.collection("users").get();
    return {
      profiles: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw new Error("Failed to fetch user profiles");
  }
}

export async function getChatHistory(limit: number = 50) {
  try {
    const snapshot = await adminDb
      .collection("chatHistory")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return {
      conversations: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw new Error("Failed to fetch chat history");
  }
}

export async function getSystemAnalytics() {
  try {
    const [usersSnapshot, chatSnapshot] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("chatHistory").get(),
    ]);

    const subscriptionCounts = usersSnapshot.docs.reduce((acc, doc) => {
      const subscription = doc.data().subscription || "free";
      acc[subscription] = (acc[subscription] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: usersSnapshot.size,
      totalConversations: chatSnapshot.size,
      subscriptionBreakdown: subscriptionCounts,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw new Error("Failed to fetch system analytics");
  }
}
