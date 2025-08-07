// Utility functions for user settings and AI customization

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "";
  height: number; // cm
  weight: number; // kg
  activityLevel: string;
  goal: string;
}

export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

// Get user profile from localStorage
export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("fitchat_user_profile");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Error loading user profile:", error);
    return null;
  }
}

// Get AI personality from localStorage
export function getAIPersonality(): string {
  if (typeof window === "undefined") return "friendly";

  try {
    return localStorage.getItem("fitchat_ai_personality") || "friendly";
  } catch (error) {
    console.error("Error loading AI personality:", error);
    return "friendly";
  }
}

// Calculate BMR (Basal Metabolic Rate)
export function calculateBMR(profile: UserProfile): number {
  if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
    return 0;
  }

  // Mifflin-St Jeor Equation
  let bmr;
  if (profile.gender === "male") {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }
  return Math.round(bmr);
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const activityMultipliers: { [key: string]: number } = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (activityMultipliers[profile.activityLevel] || 1.55));
}

// Calculate BMI (Body Mass Index)
export function calculateBMI(profile: UserProfile): number {
  if (!profile.weight || !profile.height) return 0;
  const heightInM = profile.height / 100;
  return Math.round((profile.weight / (heightInM * heightInM)) * 10) / 10;
}

// Get BMI category
export function getBMICategory(bmi: number): { text: string; color: string } {
  if (bmi < 18.5) return { text: "Thiếu cân", color: "text-blue-600" };
  if (bmi < 25) return { text: "Bình thường", color: "text-green-600" };
  if (bmi < 30) return { text: "Thừa cân", color: "text-yellow-600" };
  return { text: "Béo phì", color: "text-red-600" };
}

// Get personality prompt addition based on selected personality
export function getPersonalityPrompt(personalityId: string): string {
  const personalityPrompts: { [key: string]: string } = {
    friendly: `
🌟 PHONG CÁCH GIAO TIẾP - THÂN THIỆN:
- Sử dụng ngôn ngữ ấm áp, gần gũi và dễ tiếp cận
- Thường xuyên sử dụng emoji để tạo không khí vui vẻ 😊💕
- Gọi người dùng bằng "bạn", "mình" một cách thân mật
- Luôn động viên và khuyến khích tích cực
- Chia sẻ kinh nghiệm như một người bạn đáng tin cậy`,

    enthusiastic: `
🔥 PHONG CÁCH GIAO TIẾP - NHIỆT TÌNH:
- Tràn đầy năng lượng và động lực trong mọi lời khuyên! 
- Sử dụng nhiều emoji năng động 🔥💪⚡🚀
- Khuyến khích mạnh mẽ và tạo động lực cao
- Nói về thành tựu và tiến bộ với sự hào hứng
- Luôn thể hiện sự phấn khích về hành trình fitness`,

    professional: `
💼 PHONG CÁCH GIAO TIẾP - CHUYÊN NGHIỆP:
- Sử dụng ngôn ngữ trang trọng, chính thức
- Tập trung vào dữ liệu, nghiên cứu và bằng chứng khoa học
- Đưa ra lời khuyên có cơ sở và logic rõ ràng
- Ít sử dụng emoji, tập trung vào nội dung chất lượng
- Gọi người dùng bằng "quý khách", "anh/chị" một cách lịch sự`,

    motivational: `
💪 PHONG CÁCH GIAO TIẾP - TRUYỀN CẢM HỨNG:
- Luôn khuyến khích và động viên mạnh mẽ
- Sử dụng câu nói truyền cảm hứng và động lực 💪🌟
- Nhấn mạnh về sức mạnh tiềm ẩn và khả năng vượt qua thử thách
- Chia sẻ câu chuyện thành công và động lực
- Tạo cảm giác người dùng có thể chinh phục mọi mục tiêu`,

    gentle: `
🌸 PHONG CÁCH GIAO TIẾP - NHẸ NHÀNG:
- Sử dụng ngôn ngữ dịu dàng, kiên nhẫn và thấu hiểu
- Thể hiện sự đồng cảm và hỗ trợ tinh thần 🌸💕
- Không gây áp lực, tôn trọng tốc độ của từng người
- Khuyến khích từ từ và bền bỉ
- Luôn lắng nghe và thấu hiểu tâm lý người dùng`,

    scientific: `
🧬 PHONG CÁCH GIAO TIẾP - KHOA HỌC:
- Dựa trên nghiên cứu, dữ liệu và bằng chứng khoa học
- Giải thích cơ chế sinh lý và nguyên lý hoạt động
- Cung cấp số liệu cụ thể và thống kê 📊📈
- Trích dẫn nghiên cứu và nguồn tài liệu uy tín
- Phân tích chi tiết các yếu tố ảnh hưởng đến sức khỏe`,
  };

  return personalityPrompts[personalityId] || personalityPrompts.friendly;
}

// Get activity level in Vietnamese
export function getActivityLevelText(level: string): string {
  const levels: { [key: string]: string } = {
    sedentary: "Ít vận động (làm việc văn phòng)",
    light: "Nhẹ (tập 1-3 ngày/tuần)",
    moderate: "Vừa phải (tập 3-5 ngày/tuần)",
    active: "Tích cực (tập 6-7 ngày/tuần)",
    very_active: "Rất tích cực (tập 2 lần/ngày)",
  };
  return levels[level] || "Chưa xác định";
}

// Get goal in Vietnamese
export function getGoalText(goal: string): string {
  const goals: { [key: string]: string } = {
    lose_weight: "Giảm cân",
    gain_muscle: "Tăng cơ",
    maintain_weight: "Duy trì cân nặng",
    general_health: "Cải thiện sức khỏe tổng quát",
    endurance: "Tăng sức bền",
    strength: "Tăng sức mạnh",
  };
  return goals[goal] || "Chưa xác định";
}
