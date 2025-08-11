console.log("🧪 Testing Updated Chat History Logic\n");

// Test với logic mới
function testNewLogic() {
  const scenarios = [
    {
      name: "Click 'Let's roll' (quick action)",
      isQuickAction: true,
      isMealPlan: false,
      expectedRealInteraction: false,
      expectedSave: false,
    },
    {
      name: "Click 'Tạo thực đơn' (quick action + meal plan)",
      isQuickAction: true,
      isMealPlan: true,
      expectedRealInteraction: true,
      expectedSave: true,
    },
    {
      name: "Type manually 'xin chào'",
      isQuickAction: false,
      isMealPlan: false,
      expectedRealInteraction: true,
      expectedSave: true,
    },
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);

    // Simulate new logic: !isQuickAction || isMealPlan
    const calculatedRealInteraction =
      !scenario.isQuickAction || scenario.isMealPlan;
    const calculatedSave = calculatedRealInteraction; // hasRealInteraction determines save

    console.log(
      `   → Real Interaction: ${
        calculatedRealInteraction ? "Yes" : "No"
      } (Expected: ${scenario.expectedRealInteraction ? "Yes" : "No"})`
    );
    console.log(
      `   → Will Save: ${calculatedSave ? "Yes" : "No"} (Expected: ${
        scenario.expectedSave ? "Yes" : "No"
      })`
    );

    const realInteractionMatch =
      calculatedRealInteraction === scenario.expectedRealInteraction;
    const saveMatch = calculatedSave === scenario.expectedSave;

    console.log(
      `   → Result: ${
        realInteractionMatch && saveMatch ? "✅ PASS" : "❌ FAIL"
      }`
    );
    console.log("");
  });
}

testNewLogic();

console.log("🔍 Logic summary:");
console.log("isRealInteraction = !isQuickAction || isMealPlan");
console.log("");
console.log("Quick Action + Not Meal Plan = false → No Save");
console.log("Quick Action + Meal Plan = true → Save");
console.log("Manual Type + Any = true → Save");
