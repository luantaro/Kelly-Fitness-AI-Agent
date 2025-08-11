// Simple test to fetch user data via API
const fetchUserData = async () => {
  try {
    console.log("Testing API endpoints...");

    // Test the subscription-info endpoint
    const response = await fetch(
      "http://localhost:3004/api/user/subscription-info",
      {
        headers: {
          Authorization: "Bearer test-token", // This will fail but show us the endpoint exists
        },
      }
    );

    console.log("Subscription endpoint response:", response.status);

    if (response.status === 401) {
      console.log("✅ Endpoint exists (requires auth)");
    } else {
      console.log("Response:", await response.text());
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

fetchUserData();
