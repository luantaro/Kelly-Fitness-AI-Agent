// Test chat API directly
const fetch = require("node-fetch");

async function testChatAPI() {
  console.log("🧪 Testing Chat API directly...\n");

  try {
    const response = await fetch("http://localhost:3002/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Tạo thực đơn 1 tuần cho tôi",
        userId: "test-free-user-1",
        userEmail: "freeuser1@test.com",
        specialRequest: "weekly-diet-plan",
      }),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
      return;
    }

    const data = await response.json();
    console.log("✅ Success! Response received:");
    console.log("📝 Message length:", data.message?.length || 0, "characters");
    console.log("🕐 Timestamp:", data.timestamp);

    if (data.message) {
      console.log(
        "📄 First 200 chars:",
        data.message.substring(0, 200) + "..."
      );
    }
  } catch (error) {
    console.error("❌ Network/API Error:", error.message);
  }
}

testChatAPI();
