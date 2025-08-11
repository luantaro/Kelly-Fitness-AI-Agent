// Test chat API using curl equivalent
const https = require("http");

const postData = JSON.stringify({
  message: "Tạo thực đơn 1 tuần cho tôi",
  userId: "test-free-user-1",
  userEmail: "freeuser1@test.com",
  specialRequest: "weekly-diet-plan",
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/chat",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

console.log("🧪 Testing Chat API on localhost:3000...\n");

const req = https.request(options, (res) => {
  console.log("📡 Response status:", res.statusCode);
  console.log("📋 Response headers:", res.headers);

  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      if (res.statusCode === 200) {
        const jsonData = JSON.parse(data);
        console.log("✅ Success! API is working");
        console.log(
          "📝 Message length:",
          jsonData.message?.length || 0,
          "characters"
        );
        console.log("🕐 Timestamp:", jsonData.timestamp);

        if (jsonData.message) {
          console.log(
            "📄 First 200 chars:",
            jsonData.message.substring(0, 200) + "..."
          );
        }
      } else {
        console.log("❌ Error response:", data);
      }
    } catch (error) {
      console.log("❌ Failed to parse response:", data);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Network Error:", error.message);
  if (error.code === "ECONNREFUSED") {
    console.log("💡 Dev server might not be running on port 3000");
    console.log("   Try: npm run dev");
  }
});

req.write(postData);
req.end();
