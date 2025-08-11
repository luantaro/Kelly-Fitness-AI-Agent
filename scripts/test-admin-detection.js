const admin = require("firebase-admin");

// Test admin detection logic
const ADMIN_EMAILS = [
  "admin@kellyfitness.com",
  "admin@kelly-fitness.com",
  "luandev@kellyfitness.com",
  "taro2255@gmail.com",
];

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Test emails
const testEmails = [
  "admin@kelly-fitness.com",
  "taro2255@gmail.com",
  "user@example.com",
  "ADMIN@kelly-fitness.com", // Test case sensitivity
];

console.log("🧪 Testing admin email detection:");
testEmails.forEach((email) => {
  const isAdmin = isAdminEmail(email);
  console.log(`📧 ${email}: ${isAdmin ? "👑 ADMIN" : "👤 USER"}`);
});
