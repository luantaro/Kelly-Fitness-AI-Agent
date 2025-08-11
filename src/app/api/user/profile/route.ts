import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    console.log(`📋 Fetching profile for user: ${userId}`);

    // Get user document from Firestore
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`⚠️ User document not found for: ${userId}`);
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found",
          userProfile: {
            name: "",
            age: 0,
            gender: "",
            height: 0,
            weight: 0,
            activityLevel: "moderate",
            goal: "maintain_weight",
            personality: "friendly",
          },
        },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    console.log(`✅ User data found:`, userData);

    // Extract user profile from userData
    const userProfile = {
      name: userData?.name || userData?.displayName || "",
      age: userData?.age || userData?.userProfile?.age || 0,
      gender: userData?.gender || userData?.userProfile?.gender || "",
      height: userData?.height || userData?.userProfile?.height || 0,
      weight: userData?.weight || userData?.userProfile?.weight || 0,
      activityLevel:
        userData?.activityLevel ||
        userData?.userProfile?.activityLevel ||
        "moderate",
      goal: userData?.goal || userData?.userProfile?.goal || "maintain_weight",
      personality:
        userData?.personality ||
        userData?.userProfile?.personality ||
        "friendly",
    };

    console.log(`📊 Extracted profile:`, userProfile);

    return NextResponse.json({
      success: true,
      userProfile,
      lastUpdated:
        userData?.updatedAt ||
        userData?.profileUpdatedAt ||
        new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const body = await request.json();

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    console.log(`💾 Updating profile for user: ${userId}`, body);

    // Get current user data
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`⚠️ User document not found for: ${userId}`);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const currentData = userDoc.data();

    // Update user profile in Firestore
    const updateData = {
      ...currentData,
      name: body.name || currentData?.name,
      age: body.age || currentData?.age,
      gender: body.gender || currentData?.gender,
      height: body.height || currentData?.height,
      weight: body.weight || currentData?.weight,
      activityLevel: body.activityLevel || currentData?.activityLevel,
      goal: body.goal || currentData?.goal,
      personality: body.personality || currentData?.personality,
      userProfile: {
        ...(currentData?.userProfile || {}),
        name: body.name || currentData?.userProfile?.name || currentData?.name,
        age: body.age || currentData?.userProfile?.age || currentData?.age,
        gender:
          body.gender ||
          currentData?.userProfile?.gender ||
          currentData?.gender,
        height:
          body.height ||
          currentData?.userProfile?.height ||
          currentData?.height,
        weight:
          body.weight ||
          currentData?.userProfile?.weight ||
          currentData?.weight,
        activityLevel:
          body.activityLevel ||
          currentData?.userProfile?.activityLevel ||
          currentData?.activityLevel,
        goal: body.goal || currentData?.userProfile?.goal || currentData?.goal,
        personality:
          body.personality ||
          currentData?.userProfile?.personality ||
          currentData?.personality,
      },
      profileUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRef.update(updateData);

    console.log(`✅ Profile updated for user: ${userId}`);

    // Return updated profile
    const updatedProfile = {
      name: updateData.name,
      age: updateData.age,
      gender: updateData.gender,
      height: updateData.height,
      weight: updateData.weight,
      activityLevel: updateData.activityLevel,
      goal: updateData.goal,
      personality: updateData.personality,
    };

    return NextResponse.json({
      success: true,
      userProfile: updatedProfile,
      lastUpdated: updateData.profileUpdatedAt,
    });
  } catch (error: any) {
    console.error("❌ Error updating user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
