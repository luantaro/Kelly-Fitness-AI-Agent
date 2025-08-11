import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { checkUserAccess } from "@/lib/userSubscription";

/**
 * 🔑 Trial Status API Endpoint with Admin Bypass
 * This endpoint properly checks admin status and bypasses trial restrictions
 */
export async function GET(request: NextRequest) {
  try {
    console.log(
      "🔍 [Trial Status] Checking user trial status with admin bypass..."
    );

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.log("❌ [Trial Status] No authorization header");
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
      `🔍 [Trial Status] Checking access for user: ${decodedToken.email} (${decodedToken.uid})`
    );

    // Use checkUserAccess function which includes admin bypass
    const email = decodedToken.email || "";
    const accessResult = await checkUserAccess(decodedToken.uid, email);

    console.log(`✅ [Trial Status] Access result:`, accessResult);

    return NextResponse.json({
      success: true,
      hasAccess: accessResult.hasAccess,
      status: accessResult.status,
      daysRemaining: accessResult.daysRemaining,
      message: accessResult.message,
      // Additional fields for compatibility
      trialStatus: {
        isTrialActive: accessResult.hasAccess,
        status: accessResult.status,
        daysRemaining: accessResult.daysRemaining || 0,
        message: accessResult.message,
      },
    });
  } catch (error: any) {
    console.error("❌ [Trial Status] Error:", error);
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
