#!/usr/bin/env node

/**
 * Bidirectional Sync Test Runner
 * Tests 2-way data interaction between user and admin
 */

const { spawn } = require("child_process");
const { promisify } = require("util");

const sleep = promisify(setTimeout);

async function runBidirectionalTest() {
  console.log("🔄 Starting bidirectional sync test runner...\n");

  // Kill any existing processes on port 3002
  console.log("🛑 Cleaning up existing processes...");
  try {
    spawn("taskkill", ["/F", "/IM", "node.exe"], {
      stdio: "ignore",
      shell: true,
    });
    await sleep(2000);
  } catch (e) {
    // Ignore errors
  }

  // Start the server
  console.log("📡 Starting Next.js server on port 3002...");
  const serverProcess = spawn("npx", ["next", "dev", "-p", "3002"], {
    stdio: "pipe",
    shell: true,
  });

  // Capture server output
  serverProcess.stdout.on("data", (data) => {
    const output = data.toString();
    if (output.includes("Ready in")) {
      console.log("✅ Server is ready!");
    }
  });

  // Wait for server to start
  console.log("⏳ Waiting for server to start...");
  await sleep(10000);

  // Create test user first
  console.log("👤 Creating test user...");
  const createUserProcess = spawn(
    "node",
    ["scripts/create-free-test-users.js"],
    {
      stdio: "inherit",
      shell: true,
    }
  );

  await new Promise((resolve) => {
    createUserProcess.on("close", () => {
      console.log("✅ Test user created");
      resolve();
    });
  });

  // Run the bidirectional sync test
  console.log("\n🧪 Running bidirectional sync test...");
  const testProcess = spawn(
    "npx",
    [
      "playwright",
      "test",
      "tests/bidirectional-sync-test.spec.ts",
      "--reporter=list",
      "--timeout=60000",
    ],
    {
      stdio: "inherit",
      shell: true,
    }
  );

  testProcess.on("close", (code) => {
    console.log(`\n📊 Test finished with code: ${code}`);

    // Clean up server
    console.log("🛑 Stopping server...");
    serverProcess.kill("SIGTERM");

    if (code === 0) {
      console.log("\n🎉 BIDIRECTIONAL SYNC TEST PASSED!");
      console.log("✅ Data flows correctly between user and admin");
    } else {
      console.log("\n❌ BIDIRECTIONAL SYNC TEST FAILED!");
      console.log("🔍 Check the logs above for details");
    }

    process.exit(code);
  });

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping server and test...");
    serverProcess.kill("SIGTERM");
    testProcess.kill("SIGTERM");
    process.exit(0);
  });
}

runBidirectionalTest().catch(console.error);
