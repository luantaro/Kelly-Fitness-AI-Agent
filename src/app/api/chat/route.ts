import { NextRequest, NextResponse } from "next/server";
import {
  getFitnessAdvice,
  getWorkoutPlan,
  getNutritionPlan,
  getLifestyleAdvice,
  getBodyAnalysis,
  getRandomNutritionTopic,
  handleQuickAction,
} from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      context = "general",
      userProfile,
      specialRequest,
      conversationHistory = [], // Nhận conversation history từ frontend
    } = await request.json();

    // Validate input
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Log conversation history for debugging
    console.log("📚 API received conversation history:", {
      length: conversationHistory?.length || 0,
      isArray: Array.isArray(conversationHistory),
      sample: conversationHistory?.slice(-2), // Last 2 messages for debugging
    });

    let response: string;

    // Handle Quick Actions with specialized AI that checks user profile
    if (specialRequest === "weekly-diet-plan") {
      response = await handleQuickAction(
        "weight-loss-menu",
        userProfile,
        conversationHistory
      );
    } else if (specialRequest === "lets-roll") {
      response = await handleQuickAction(
        "lets-roll",
        userProfile,
        conversationHistory
      );
    } else if (specialRequest === "lifestyle-advice") {
      response = await handleQuickAction(
        "lifestyle-advice",
        userProfile,
        conversationHistory
      );
    } else if (specialRequest === "body-analysis") {
      response = await handleQuickAction(
        "body-analysis",
        userProfile,
        conversationHistory
      );
    } else if (specialRequest === "workout-plan") {
      response = await getWorkoutPlan(
        message,
        userProfile?.experience || "beginner",
        userProfile?.timeAvailable || "3-4 ngày/tuần",
        userProfile,
        conversationHistory
      );
    } else if (specialRequest === "nutrition-plan") {
      response = await getNutritionPlan(
        message,
        userProfile?.dietaryRestrictions || "Không có hạn chế",
        userProfile,
        conversationHistory
      );
    } else if (specialRequest === "random-nutrition-topic") {
      response = await getRandomNutritionTopic(
        userProfile,
        conversationHistory
      );
    } else if (context === "fitness" || context === "nutrition") {
      // Use fitness-specific AI for general fitness questions
      response = await getFitnessAdvice(
        message,
        userProfile,
        conversationHistory
      );
    } else {
      // General chat completion with user settings
      response = await getFitnessAdvice(
        message,
        userProfile,
        conversationHistory
      );
    }

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Đã xảy ra lỗi khi xử lý tin nhắn. Vui lòng thử lại sau.",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
