// Macro Calculator for simplified goal options
export interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

export interface UserProfile {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: "male" | "female" | "" | null | undefined;
  activityLevel: string;
  goal: string;
}

// Calculate BMR using Mifflin-St Jeor Equation
export function calculateBMR(profile: UserProfile): number {
  if (
    !profile.weight ||
    !profile.height ||
    !profile.age ||
    !profile.gender ||
    (profile.gender !== "male" && profile.gender !== "female")
  ) {
    return 0;
  }

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
    sedentary: 1.2, // Ít vận động
    light: 1.375, // Nhẹ
    moderate: 1.55, // Vừa phải
    active: 1.725, // Tích cực
    very_active: 1.9, // Rất tích cực
  };
  return Math.round(bmr * (activityMultipliers[profile.activityLevel] || 1.55));
}

// Calculate macro targets based on simplified goals
export function calculateMacroTargets(profile: UserProfile): MacroTargets {
  const tdee = calculateTDEE(profile);
  let calories: number;
  let proteinPercent: number;
  let carbsPercent: number;
  let fatPercent: number;

  switch (profile.goal) {
    case "lose_weight": // Giảm cân - giảm mỡ
      calories = Math.round(tdee * 0.8); // Deficit 20%
      proteinPercent = 30; // Protein cao để giữ cơ
      carbsPercent = 40; // Carbs vừa phải
      fatPercent = 30; // Fat vừa phải
      break;

    case "gain_muscle": // Tăng cân - tăng cơ
      calories = Math.round(tdee * 1.15); // Surplus 15%
      proteinPercent = 25; // Protein cao cho tăng cơ
      carbsPercent = 50; // Carbs cao cho năng lượng
      fatPercent = 25; // Fat thấp hơn
      break;

    case "maintain_weight": // Duy trì vóc dáng
    default:
      calories = tdee; // Duy trì TDEE
      proteinPercent = 25; // Protein cân bằng
      carbsPercent = 45; // Carbs cân bằng
      fatPercent = 30; // Fat cân bằng
      break;
  }

  // Calculate macro grams (4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fat)
  const protein = Math.round((calories * proteinPercent) / 100 / 4);
  const carbs = Math.round((calories * carbsPercent) / 100 / 4);
  const fat = Math.round((calories * fatPercent) / 100 / 9);

  return {
    calories,
    protein,
    carbs,
    fat,
    proteinPercent,
    carbsPercent,
    fatPercent,
  };
}

// Get goal description in Vietnamese
export function getGoalDescription(goal: string): string {
  switch (goal) {
    case "lose_weight":
      return "Giảm cân - giảm mỡ";
    case "gain_muscle":
      return "Tăng cân - tăng cơ";
    case "maintain_weight":
      return "Duy trì vóc dáng";
    default:
      return "Duy trì vóc dáng";
  }
}

// Get detailed macro explanation
export function getMacroExplanation(goal: string): string {
  switch (goal) {
    case "lose_weight":
      return "Chế độ deficit calories với protein cao để giữ cơ bắp, carbs và fat vừa phải để duy trì năng lượng.";
    case "gain_muscle":
      return "Chế độ surplus calories với carbs cao cho năng lượng tập luyện, protein cao cho tăng cơ.";
    case "maintain_weight":
      return "Chế độ cân bằng calories với tỷ lệ macro hợp lý để duy trì vóc dáng hiện tại.";
    default:
      return "Chế độ cân bằng calories với tỷ lệ macro hợp lý.";
  }
}
