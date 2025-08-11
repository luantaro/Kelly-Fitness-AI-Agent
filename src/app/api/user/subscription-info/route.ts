import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, adminDb } from "@/lib/firebase-admin";
import { checkUserAccess } from "@/lib/userSubscription";

/**
 * 🔑 Subscription Info API Endpoint with Admin Bypass
 * This endpoint provides detailed subscription info with admin bypass
 */
export async function GET(request: NextRequest) {
  try {
    console.log(
      "🔍 [Subscription] Getting subscription info with admin bypass..."
    );

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.log("❌ [Subscription] No authorization header");
      return NextResponse.json(
        {
          success: false,
          error: "No authorization header",
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);

    console.log(
      `🔍 [Subscription] Getting info for user: ${decodedToken.email} (${decodedToken.uid})`
    );

    // Get user data from Firestore
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    const userData = userDoc.data();

    // Use checkUserAccess function which includes admin bypass
    const email = decodedToken.email || "";
    const accessResult = await checkUserAccess(decodedToken.uid, email);

    console.log(`✅ [Subscription] Access result:`, accessResult);

    return NextResponse.json({
      success: true,
      // Core subscription data
      hasAccess: accessResult.hasAccess,
      status: accessResult.status,
      isActive: accessResult.hasAccess,
      statusMessage: accessResult.message,
      daysRemaining: accessResult.daysRemaining,

      // Detailed subscription info
      subscription: {
        type: userData?.subscription || "free",
        status: accessResult.status,
        startDate: userData?.subscriptionStartDate,
        endDate: userData?.subscriptionEndDate,
        durationMonths: userData?.subscriptionDurationMonths || 0,
        activatedByAdmin: userData?.activatedByAdmin || false,
        activatedDate: userData?.activatedDate,
      },

      // Trial info
      trialEndDate: userData?.trialEndDate,

      // User info
      subscriptionType: userData?.subscription || "free",
      subscriptionStartDate: userData?.subscriptionStartDate,
      subscriptionEndDate: userData?.subscriptionEndDate,
      activatedByAdmin: userData?.activatedByAdmin || false,
    });
  } catch (error: any) {
    console.error("❌ [Subscription] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid token or server error",
        details: error?.message || "Unknown error",
      },
      { status: 401 }
    );
  }
}
