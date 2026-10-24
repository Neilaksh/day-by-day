#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");

console.log("=".repeat(80));
console.log("SLEEP-LOGGING BUG FIX VALIDATION");
console.log("=".repeat(80));
console.log();

function runCommand(name, command) {
  console.log(`Running: ${name}`);
  console.log("-".repeat(80));
  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: __dirname,
      maxBuffer: 10 * 1024 * 1024,
    });
    console.log(output || "✓ Success (no output)");
    console.log();
    return { success: true, output };
  } catch (error) {
    console.error("✗ Error:");
    console.error(error.stdout || "");
    console.error(error.stderr || "");
    console.log();
    return { success: false, error: error.message };
  }
}

// Run validation commands
const results = {
  typeCheck: runCommand("TypeScript type check", "npx tsc --noEmit"),
  eslint: runCommand("ESLint", "npx eslint . --ext .ts,.tsx"),
  build: runCommand("Production build", "npm run build"),
};

// Summary
console.log("=".repeat(80));
console.log("VALIDATION SUMMARY");
console.log("=".repeat(80));
console.log("TypeScript:", results.typeCheck.success ? "✓ PASS" : "✗ FAIL");
console.log("ESLint:", results.eslint.success ? "✓ PASS" : "✗ FAIL");
console.log("Build:", results.build.success ? "✓ PASS" : "✗ FAIL");
console.log();

const allPassed = results.typeCheck.success && results.eslint.success && results.build.success;
console.log(allPassed ? "✓ ALL CHECKS PASSED" : "✗ SOME CHECKS FAILED");
process.exit(allPassed ? 0 : 1);
