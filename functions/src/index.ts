/**
 * Firebase Functions for Kelly Fitness AI
 */

import { onRequest } from "firebase-functions/https";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Simple function without Express
export const nextjsApp = onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const path = req.path || req.url;
  const method = req.method;

  // Route handling
  if (path === "/health") {
    res.json({
      status: "Firebase Functions OK",
      timestamp: new Date().toISOString(),
      path: path,
      method: method,
    });
    return;
  }

  if (path === "/api/chat" && method === "POST") {
    const message = req.body?.message || "Hello";
    res.json({
      success: true,
      data: {
        message: `🤖 Kelly AI (Firebase): ${message}. Tôi là AI trợ lý thể hình từ Firebase Functions!`,
        timestamp: new Date().toISOString(),
        source: "Firebase Functions",
      },
    });
    return;
  }

  if (path === "/api/auth/verify" && method === "POST") {
    res.json({
      success: true,
      user: {
        id: "firebase-user-001",
        email: "demo@kellyfitness.com",
        name: "Firebase Demo User",
      },
    });
    return;
  }

  if (path === "/api/user/profile" && method === "GET") {
    res.json({
      success: true,
      profile: {
        name: "Kelly User",
        email: "demo@kellyfitness.com",
        subscription: "premium",
        quotaUsed: 35,
        quotaLimit: 100,
        features: ["AI Chat", "Nutrition Plans", "Workout Tracking"],
      },
    });
    return;
  }

  // Admin API endpoints
  if (path === "/api/admin/users" && method === "GET") {
    try {
      const db = admin.firestore();
      const usersSnapshot = await db.collection("users").limit(50).get();
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({
        success: true,
        users: users,
        total: users.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch users",
        details: error?.message || "Unknown error",
      });
    }
    return;
  }

  if (path === "/api/admin/user/activate" && method === "POST") {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({
          success: false,
          error: "Missing userId",
        });
        return;
      }

      const db = admin.firestore();
      await db.collection("users").doc(userId).update({
        status: "active",
        subscription: "premium",
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        message: `User ${userId} activated successfully`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Failed to activate user",
        details: error?.message || "Unknown error",
      });
    }
    return;
  }

  if (path === "/api/admin/user/delete" && method === "DELETE") {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({
          success: false,
          error: "Missing userId",
        });
        return;
      }

      const db = admin.firestore();
      await db.collection("users").doc(userId).delete();

      // Also delete from Firebase Auth
      try {
        await admin.auth().deleteUser(userId);
      } catch (authError: any) {
        console.log(
          "Auth user not found or already deleted:",
          authError?.message || "Unknown error"
        );
      }

      res.json({
        success: true,
        message: `User ${userId} deleted successfully`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Failed to delete user",
        details: error?.message || "Unknown error",
      });
    }
    return;
  }

  if (path === "/api/admin/stats" && method === "GET") {
    try {
      const db = admin.firestore();

      // Get user counts
      const activeUsers = await db
        .collection("users")
        .where("status", "==", "active")
        .get();
      const pendingUsers = await db
        .collection("users")
        .where("status", "==", "pending")
        .get();
      const totalUsers = await db.collection("users").get();

      res.json({
        success: true,
        stats: {
          totalUsers: totalUsers.size,
          activeUsers: activeUsers.size,
          pendingUsers: pendingUsers.size,
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch stats",
        details: error?.message || "Unknown error",
      });
    }
    return;
  }

  if (path === "/api/admin/check" && method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: "No authorization header",
        });
        return;
      }

      const token = authHeader.replace("Bearer ", "");
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Check if user is admin
      const db = admin.firestore();
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (!userData || userData.role !== "admin") {
        res.status(403).json({
          success: false,
          error: "Access denied - admin role required",
        });
        return;
      }

      res.json({
        success: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: userData.role,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: "Invalid token",
        details: error?.message || "Unknown error",
      });
    }
    return;
  }

  // Chat API endpoint
  if (path === "/api/chat" && method === "POST") {
    try {
      const { message, conversationId } = req.body;

      // Simple AI response for demo
      res.json({
        success: true,
        data: {
          message: `🤖 Kelly AI: Tôi đã nhận được tin nhắn "${message}". Đây là phản hồi từ Firebase Functions! Tôi là AI trợ lý thể hình và dinh dưỡng.`,
          timestamp: new Date().toISOString(),
          conversationId: conversationId || `conv_${Date.now()}`,
          source: "Firebase Functions",
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Chat API error",
        details: error?.message || "Unknown error",
      });
    }
    return;
  }

  // User trial status
  if (path === "/api/user/trial-status" && method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: "No authorization header",
        });
        return;
      }

      const token = authHeader.replace("Bearer ", "");
      const decodedToken = await admin.auth().verifyIdToken(token);

      const db = admin.firestore();
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();

      res.json({
        success: true,
        trialStatus: {
          isTrialActive:
            userData?.subscription === "trial" ||
            userData?.subscription === "premium",
          trialEndDate: userData?.subscriptionEndDate,
          daysRemaining: userData?.subscription === "premium" ? 999 : 0,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: "Invalid token",
        details: error?.message || "Unknown error",
      });
    }
    return;
  }

  // User subscription info
  if (path === "/api/user/subscription-info" && method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: "No authorization header",
        });
        return;
      }

      const token = authHeader.replace("Bearer ", "");
      const decodedToken = await admin.auth().verifyIdToken(token);

      const db = admin.firestore();
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();

      res.json({
        success: true,
        subscription: {
          type: userData?.subscription || "free",
          status: userData?.status || "active",
          startDate: userData?.subscriptionStartDate,
          endDate: userData?.subscriptionEndDate,
          durationMonths: userData?.subscriptionDurationMonths || 0,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: "Invalid token",
        details: error?.message || "Unknown error",
      });
    }
    return;
  }

  // Default response
  res.status(404).json({
    error: "Endpoint not found",
    path: path,
    method: method,
    available: [
      "/health",
      "/api/chat",
      "/api/auth/verify",
      "/api/user/profile",
      "/api/user/trial-status",
      "/api/user/subscription-info",
      "/api/admin/users",
      "/api/admin/stats",
      "/api/admin/check",
      "/api/admin/user/activate",
      "/api/admin/user/delete",
    ],
  });
});
