import { getSystemPrompt } from "./base";
import {
  calculateMacroTargets,
  getGoalDescription,
  getMacroExplanation,
  type UserProfile,
} from "../macroCalculator";

// Meal plan request handler
export function createMealPlanRequest(
  days: number,
  userProfile: UserProfile | null,
  conversationContext: boolean = false
): string {
  const macroInfo = userProfile ? calculateMacroTargets(userProfile) : null;

  const goalText =
    userProfile?.goal === "lose_weight"
      ? "giảm cân"
      : userProfile?.goal === "gain_muscle"
      ? "tăng cơ"
      : "duy trì vóc dáng";

  return `Tạo thực đơn ${goalText} ${days} ngày${
    days === 7 ? " đầy đủ 1 tuần" : ""
  }.

${
  conversationContext
    ? "CONTEXT: User đã từng hỏi về thực đơn trước đó trong cuộc trò chuyện này."
    : ""
}

🎯 THÔNG TIN USER:
${
  userProfile
    ? `
- Tên: ${(userProfile as any).name || "Chưa có"}
- Tuổi: ${userProfile.age || "Chưa có"}
- Giới tính: ${userProfile.gender || "Chưa có"}
- Chiều cao: ${userProfile.height || "Chưa có"}cm
- Cân nặng: ${userProfile.weight || "Chưa có"}kg
- Mục tiêu: ${getGoalDescription(userProfile.goal)}
- Mức độ hoạt động: ${userProfile.activityLevel || "Vừa phải"}

${
  macroInfo
    ? `🎯 MỤC TIÊU MACRO HÀNG NGÀY:
- Calories: ${macroInfo.calories} kcal
- Protein: ${macroInfo.protein}g (${macroInfo.proteinPercent}%)
- Carbs: ${macroInfo.carbs}g (${macroInfo.carbsPercent}%)
- Fat: ${macroInfo.fat}g (${macroInfo.fatPercent}%)
- Giải thích: ${getMacroExplanation(userProfile.goal)}`
    : ""
}
`
    : "Chưa có thông tin cá nhân"
}

📋 YÊU CẦU:
1. Tạo thực đơn ${days} ngày ${days === 7 ? "(NGÀY 1 → NGÀY 7)" : ""}
2. Mỗi ngày có 4 bữa: 🌅 Sáng, 🌞 Trưa, 🌙 Tối, 🍎 Snack
3. Định lượng chi tiết từng món ăn (gram, ml, chiếc)
4. Tính macro cho từng bữa: (P: Xg | C: Xg | F: Xg | Cal: Xkcal)
5. Sử dụng món ăn Việt Nam từ FOOD DATABASE
6. Phù hợp mục tiêu: ${getGoalDescription(
    userProfile?.goal || "maintain_weight"
  )}
${
  macroInfo
    ? `7. Tổng macro mỗi ngày xấp xỉ: ${macroInfo.calories}kcal, ${macroInfo.protein}g protein, ${macroInfo.carbs}g carbs, ${macroInfo.fat}g fat`
    : ""
}
${
  conversationContext
    ? "8. Thể hiện sự hiểu biết về context cuộc trò chuyện trước"
    : ""
}`;
}

// Detect meal plan requests from user messages
export function detectMealPlanRequest(message: string): {
  isDietPlan: boolean;
  days?: number;
  hasContext?: boolean;
} {
  const lowerMessage = message.toLowerCase();

  // Check for day-specific requests
  const dayMatch = lowerMessage.match(/(\d+)\s*(ngày|day)/);
  if (dayMatch) {
    const requestedDays = parseInt(dayMatch[1]);
    if (requestedDays > 0 && requestedDays <= 7) {
      return {
        isDietPlan: true,
        days: requestedDays,
        hasContext: true,
      };
    }
  }

  // Check for general diet plan keywords
  const dietKeywords = ["thực đơn", "diet", "meal plan", "chế độ ăn", "menu"];
  const hasDietKeyword = dietKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  if (hasDietKeyword) {
    return {
      isDietPlan: true,
      days: 7, // Default to 7 days
      hasContext: false,
    };
  }

  return { isDietPlan: false };
}

export { getSystemPrompt };
