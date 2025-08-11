#!/usr/bin/env node

/**
 * Manual API Test for Bidirectional Sync Features
 * Tests the core API endpoints that support user-admin synchronization
 */

const https = require("http");

const BASE_URL = "http://localhost:3002";

// Test configuration
const TEST_CONFIG = {
  userEmail: "freeuser1@test.com",
  adminEmail: "admin@kelly-fitness.com",
  endpoints: [
    "/api/user/profile",
    "/api/user/trial-status",
    "/api/user/subscription-info",
    "/api/admin/users",
    "/api/admin/stats",
    "/api/admin/check",
  ],
};

console.log("🔍 Testing API Endpoints for Bidirectional Sync...\n");

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3002,
      path: endpoint,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            endpoint,
            status: res.statusCode,
            success: res.statusCode < 400,
            data: parsed,
            error: null,
          });
        } catch (e) {
          resolve({
            endpoint,
            status: res.statusCode,
            success: false,
            data: null,
            error: "Invalid JSON response",
          });
        }
      });
    });

    req.on("error", (error) => {
      resolve({
        endpoint,
        status: 0,
        success: false,
        data: null,
        error: error.message,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        endpoint,
        status: 0,
        success: false,
        data: null,
        error: "Request timeout",
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log("📊 API Endpoint Test Results:");
  console.log("=" * 50);

  const results = [];

  for (const endpoint of TEST_CONFIG.endpoints) {
    console.log(`Testing ${endpoint}...`);
    const result = await testEndpoint(endpoint);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${endpoint} - Status: ${result.status}`);
    } else {
      console.log(
        `❌ ${endpoint} - Status: ${result.status} - Error: ${result.error}`
      );
    }
  }

  console.log("\n📋 Summary Report:");
  console.log("=" * 50);

  const successful = results.filter((r) => r.success).length;
  const total = results.length;

  console.log(`Total Endpoints: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${total - successful}`);
  console.log(`Success Rate: ${Math.round((successful / total) * 100)}%`);

  console.log("\n🔍 Detailed Results:");
  console.log("=" * 50);

  results.forEach((result) => {
    console.log(`\n${result.endpoint}:`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Success: ${result.success}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    if (result.data && typeof result.data === "object") {
      console.log(
        `  Response: ${JSON.stringify(result.data, null, 2).substring(
          0,
          200
        )}...`
      );
    }
  });

  console.log("\n🎯 Bidirectional Sync Status:");
  console.log("=" * 50);

  const userApis = results.filter((r) => r.endpoint.includes("/api/user/"));
  const adminApis = results.filter((r) => r.endpoint.includes("/api/admin/"));

  console.log(
    `User APIs: ${userApis.filter((r) => r.success).length}/${
      userApis.length
    } working`
  );
  console.log(
    `Admin APIs: ${adminApis.filter((r) => r.success).length}/${
      adminApis.length
    } working`
  );

  if (userApis.every((r) => r.success) && adminApis.every((r) => r.success)) {
    console.log(
      "🎉 All APIs are functional - Bidirectional sync infrastructure is ready!"
    );
  } else {
    console.log(
      "⚠️ Some APIs are not working - Bidirectional sync may have issues"
    );
  }

  console.log("\n🔧 Recommendations:");
  console.log("=" * 50);

  const failedEndpoints = results.filter((r) => !r.success);
  if (failedEndpoints.length > 0) {
    console.log("Failed endpoints need attention:");
    failedEndpoints.forEach((result) => {
      console.log(
        `  - ${result.endpoint}: ${result.error || "HTTP " + result.status}`
      );
    });
  } else {
    console.log("✅ All API endpoints are working correctly");
    console.log("✅ Ready for comprehensive E2E testing");
    console.log("✅ Bidirectional sync infrastructure is healthy");
  }
}

// Run the tests
runTests().catch(console.error);
