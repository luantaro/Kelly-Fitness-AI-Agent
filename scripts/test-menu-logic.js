// Test menu creation logic for free users
const { detectMealPlanRequest } = require("./src/lib/prompts/index.ts");

console.log("🧪 Testing Menu Detection Logic\n");

const testCases = [
  {
    input: "🍽️ Tạo thực đơn 1 tuần theo mục tiêu của bạn",
    specialRequest: "weekly-diet-plan",
    expected: "Should be detected as meal plan",
  },
  {
    input: "Tạo thực đơn cho tôi",
    specialRequest: undefined,
    expected: "Should be detected as meal plan",
  },
  {
    input: "� Let's roll",
    specialRequest: "lets-roll",
    expected: "Should NOT be detected as meal plan",
  },
  {
    input: "Tư vấn dinh dưỡng",
    specialRequest: undefined,
    expected: "Should NOT be detected as meal plan",
  },
];

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. Input: "${testCase.input}"`);
  console.log(`   Special Request: ${testCase.specialRequest || "none"}`);

  try {
    const detection = detectMealPlanRequest(testCase.input);
    const isMenuRequest =
      detection.isDietPlan || testCase.specialRequest === "weekly-diet-plan";

    console.log(`   Detected as meal plan: ${isMenuRequest}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(
      `   Result: ${isMenuRequest ? "🍽️ MEAL PLAN" : "💬 REGULAR CHAT"}\n`
    );
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }
});

console.log("📊 User Account Logic:");
console.log("- Admin accounts: Full access, bypass trial system");
console.log("- New regular accounts: 3 days free trial");
console.log("- After trial: Pending activation by Kelly");
console.log("- Admin dashboard: Shows trial/pending users only (not admins)");
console.log("- Admin can activate with custom duration (months)");
console.log("- Chat messages: Unlimited for trial/activated users");
console.log("- Menu creation: Unlimited for trial/activated users");
console.log("- Access blocked: Only after trial expires before activation");
