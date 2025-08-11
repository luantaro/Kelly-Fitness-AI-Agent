// Test script để test API delete user
// Chạy script này trong browser console của admin dashboard

async function testDeleteUser() {
  try {
    // Get admin token (cần login admin trước)
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      console.error("❌ No admin token found. Please login as admin first.");
      return;
    }

    // Test API call
    const response = await fetch("/api/admin/users/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: "test-user-id", // Thay thế bằng user ID thực tế để test
      }),
    });

    console.log("📊 Response status:", response.status);
    console.log("📊 Response headers:", [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      return;
    }

    const result = await response.json();
    console.log("✅ API Response:", result);
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Uncomment để chạy test
// testDeleteUser();
