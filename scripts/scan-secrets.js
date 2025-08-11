#!/usr/bin/env node

/**
 * 🔍 Secret Scanner
 * Scans build output and source code for leaked secrets
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Patterns to detect secrets
const SECRET_PATTERNS = [
  {
    name: "OpenAI API Key",
    pattern: /sk-[a-zA-Z0-9]{48,}/g,
    severity: "CRITICAL",
  },
  {
    name: "Firebase Private Key",
    pattern: /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
    severity: "CRITICAL",
  },
  {
    name: "Bearer Token (Actual)",
    pattern: /Bearer\s+[a-zA-Z0-9\-._~+/]{20,}(?!['"]\s*\+|\$\{|=>)/g,
    severity: "HIGH",
  },
  {
    name: "Firebase Service Account Email",
    pattern:
      /firebase-adminsdk-[a-zA-Z0-9\-]+@[a-zA-Z0-9\-]+\.iam\.gserviceaccount\.com/g,
    severity: "MEDIUM",
  },
  {
    name: "Stripe Secret Key",
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    severity: "CRITICAL",
  },
  {
    name: "AWS Access Key",
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: "CRITICAL",
  },
];

class SecretScanner {
  constructor() {
    this.findings = [];
    this.scannedFiles = 0;
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      this.scannedFiles++;

      SECRET_PATTERNS.forEach(({ name, pattern, severity }) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            this.findings.push({
              file: filePath,
              secretType: name,
              severity,
              preview: this.maskSecret(match),
              line: this.getLineNumber(content, match),
            });
          });
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not scan ${filePath}: ${error.message}`);
    }
  }

  scanDirectory(dirPath, extensions = [".js", ".ts", ".tsx", ".jsx", ".json"]) {
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory ${dirPath} does not exist`);
      return;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (!["node_modules", ".git", ".next/cache"].includes(file)) {
          this.scanDirectory(filePath, extensions);
        }
      } else if (extensions.some((ext) => file.endsWith(ext))) {
        this.scanFile(filePath);
      }
    });
  }

  maskSecret(secret) {
    if (secret.length <= 8) return "[REDACTED]";
    return secret.substring(0, 4) + "..." + secret.substring(secret.length - 4);
  }

  getLineNumber(content, match) {
    const index = content.indexOf(match);
    if (index === -1) return 1;

    const lines = content.substring(0, index).split("\n");
    return lines.length;
  }

  generateReport() {
    console.log("\n🔍 SECRET SCAN REPORT");
    console.log("=====================");
    console.log(`📁 Files scanned: ${this.scannedFiles}`);
    console.log(`🚨 Secrets found: ${this.findings.length}`);

    if (this.findings.length === 0) {
      console.log("✅ No secrets detected!");
      return true;
    }

    // Group by severity
    const bySeverity = this.findings.reduce((acc, finding) => {
      if (!acc[finding.severity]) acc[finding.severity] = [];
      acc[finding.severity].push(finding);
      return acc;
    }, {});

    ["CRITICAL", "HIGH", "MEDIUM", "LOW"].forEach((severity) => {
      if (bySeverity[severity]) {
        console.log(`\n🔴 ${severity} (${bySeverity[severity].length})`);
        bySeverity[severity].forEach((finding) => {
          console.log(`  📄 ${finding.file}:${finding.line}`);
          console.log(`     🔍 ${finding.secretType}: ${finding.preview}`);
        });
      }
    });

    // Return false if critical secrets found
    return !bySeverity.CRITICAL;
  }

  scanBuildOutput() {
    console.log("🔍 Scanning build output for secrets...");

    // Scan .next directory if exists
    if (fs.existsSync(".next")) {
      this.scanDirectory(".next", [".js", ".json"]);
    }

    // Scan dist directory if exists
    if (fs.existsSync("dist")) {
      this.scanDirectory("dist", [".js", ".json"]);
    }
  }

  scanSourceCode() {
    console.log("🔍 Scanning source code for secrets...");

    // Scan src directory
    if (fs.existsSync("src")) {
      this.scanDirectory("src");
    }

    // Scan root config files
    const configFiles = [
      "next.config.js",
      "next.config.ts",
      ".env",
      ".env.local",
      ".env.production",
      "firebase.json",
    ];

    configFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        this.scanFile(file);
      }
    });
  }
}

// Main execution
function main() {
  const scanner = new SecretScanner();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const scanBuild = args.includes("--build");
  const scanSource = args.includes("--source");
  const scanAll = args.includes("--all") || (!scanBuild && !scanSource);

  console.log("🔒 Kelly Fitness AI - Secret Scanner");
  console.log("====================================");

  try {
    if (scanAll || scanSource) {
      scanner.scanSourceCode();
    }

    if (scanAll || scanBuild) {
      scanner.scanBuildOutput();
    }

    const isClean = scanner.generateReport();

    if (!isClean) {
      console.log("\n❌ CRITICAL SECRETS DETECTED!");
      console.log("🚨 DO NOT DEPLOY until secrets are removed!");
      process.exit(1);
    } else {
      console.log("\n✅ Build is clean for deployment!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Scanner failed:", error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = { SecretScanner, SECRET_PATTERNS };

// Run if called directly
if (require.main === module) {
  main();
}
