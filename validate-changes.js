// Validation script for performance and offline improvements
// Run with: node validate-changes.js

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const results = {
  checks: [],
  errors: [],
  warnings: [],
};

function runCommand(name, command) {
  console.log(`\n=== Running: ${name} ===`);
  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: process.cwd(),
    });
    console.log(output);
    results.checks.push({ name, status: "PASS", output });
    return true;
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    results.checks.push({ name, status: "FAIL", error: error.message });
    results.errors.push({ name, error: error.message });
    return false;
  }
}

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? "✓" : "✗"} ${description}: ${filePath}`);
  if (!exists) {
    results.warnings.push(`Missing file: ${filePath}`);
  }
  return exists;
}

console.log("Starting validation...\n");

// 1. TypeScript check
runCommand("TypeScript type check", "npx tsc --noEmit");

// 2. ESLint
runCommand("ESLint", "npx eslint . --ext .ts,.tsx --max-warnings 0");

// 3. Production build
runCommand("Production build", "npm run build");

// 4. Check created files
console.log("\n=== Checking new files ===");
checkFile("src/hooks/use-online-status.ts", "Online status hook");
checkFile("src/components/Skeleton.tsx", "Skeleton components");
checkFile("src/components/OfflineIndicator.tsx", "Offline indicator");

// 5. Check service worker
console.log("\n=== Checking service worker ===");
checkFile("public/sw.js", "Service worker");
const swContent = fs.readFileSync("public/sw.js", "utf8");
console.log(`SW cache version: ${swContent.match(/CACHE_NAME = '([^']+)'/)?.[1] || "NOT FOUND"}`);

// 6. Summary
console.log("\n=== VALIDATION SUMMARY ===");
console.log(`Total checks: ${results.checks.length}`);
console.log(`Passed: ${results.checks.filter((c) => c.status === "PASS").length}`);
console.log(`Failed: ${results.checks.filter((c) => c.status === "FAIL").length}`);
console.log(`Warnings: ${results.warnings.length}`);

if (results.errors.length > 0) {
  console.log("\nERRORS:");
  results.errors.forEach((e) => console.log(`- ${e.name}: ${e.error}`));
  process.exit(1);
}

if (results.warnings.length > 0) {
  console.log("\nWARNINGS:");
  results.warnings.forEach((w) => console.log(`- ${w}`));
}

console.log("\n✓ Validation complete");
