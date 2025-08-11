#!/usr/bin/env node

/**
 * Admin Test Runner
 * Runs admin access test with proper server setup
 */

const { spawn } = require("child_process");
const { promisify } = require("util");

const sleep = promisify(setTimeout);

async function runAdminTest() {
  console.log("🚀 Starting admin test runner...\n");

  // Start the server
  console.log("📡 Starting Next.js server on port 3002...");
  const serverProcess = spawn("npx", ["next", "dev", "-p", "3002"], {
    stdio: "inherit",
    shell: true,
  });

  // Wait for server to start
  console.log("⏳ Waiting for server to start...");
  await sleep(8000);

  // Run the test
  console.log("🧪 Running admin access test...");
  const testProcess = spawn(
    "npx",
    ["playwright", "test", "tests/admin-debug.spec.ts", "--reporter=list"],
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

runAdminTest().catch(console.error);
