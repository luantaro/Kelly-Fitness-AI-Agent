import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const decodedToken = await verifyIdToken(token);

      // Check if user is admin
      const userDoc = await adminDb
        .collection("users")
        .doc(decodedToken.uid)
        .get();
      const userData = userDoc.data();

      if (!userData || userData.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403 }
        );
      }
    } catch (authError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user statistics
    const usersSnapshot = await adminDb.collection("users").get();
    const users = usersSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalUsers = users.length;
    const activeUsers = users.filter(
      (user: any) => user.status === "active"
    ).length;
    const pendingUsers = users.filter(
      (user: any) => user.status === "pending"
    ).length;
    const premiumUsers = users.filter(
      (user: any) => user.subscriptionStatus === "active"
    ).length;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      pendingUsers,
      premiumUsers,
      success: true,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
