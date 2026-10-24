#!/usr/bin/env node

/**
 * Comprehensive verification script for ESLint fixes
 * Tests TypeScript compilation, ESLint, and build process
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";

const timestamp = new Date().toISOString();
let report = `# VERIFICATION REPORT\nGenerated: ${timestamp}\n\n`;

console.log("=".repeat(80));
console.log("STARTING VERIFICATION - " + timestamp);
console.log("=".repeat(80));

const tests = [
  {
    name: "TypeScript Compilation",
    command: "npx tsc --noEmit",
    critical: true,
  },
  {
    name: "ESLint Check",
    command: "npx eslint . --ext .ts,.tsx",
    critical: true,
  },
  {
    name: "Build Process",
    command: "npm run build",
    critical: true,
  },
];

let allPassed = true;

for (const test of tests) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`TEST: ${test.name}`);
  console.log(`Command: ${test.command}`);
  console.log("=".repeat(80));

  report += `## ${test.name}\n\n`;
  report += `**Command:** \`${test.command}\`\n\n`;

  try {
    const startTime = Date.now();
    const output = execSync(test.command, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024,
    });
    const duration = Date.now() - startTime;

    console.log(`✓ PASSED (${duration}ms)`);
    report += `**Result:** ✓ PASSED (${duration}ms)\n\n`;

    if (output.trim()) {
      console.log("Output:", output.substring(0, 500));
      report += `**Output:**\n\`\`\`\n${output.substring(0, 1000)}\n\`\`\`\n\n`;
    }
  } catch (error) {
    const duration = error.duration || 0;
    allPassed = false;

    console.log(`✗ FAILED (exit code: ${error.status})`);
    report += `**Result:** ✗ FAILED (exit code: ${error.status})\n\n`;

    const output = (error.stdout || "") + (error.stderr || "");
    if (output) {
      const lines = output.split("\n").filter((l) => l.trim());
      const errorLines = lines.filter((l) => /error/i.test(l));
      const warningLines = lines.filter((l) => /warn/i.test(l));

      console.log(`Errors: ${errorLines.length}, Warnings: ${warningLines.length}`);
      report += `**Errors:** ${errorLines.length}  \n**Warnings:** ${warningLines.length}\n\n`;

      if (errorLines.length > 0 && errorLines.length <= 20) {
        console.log("\nError details:");
        errorLines.forEach((line) => console.log("  " + line));
        report += `**Error Details:**\n\`\`\`\n${errorLines.join("\n")}\n\`\`\`\n\n`;
      } else if (lines.length > 0) {
        console.log("\nSample output (first 30 lines):");
        const sample = lines.slice(0, 30);
        sample.forEach((line) => console.log("  " + line));
        report += `**Sample Output:**\n\`\`\`\n${sample.join("\n")}\n${lines.length > 30 ? `\n... (${lines.length - 30} more lines)` : ""}\n\`\`\`\n\n`;
      }
    }

    if (test.critical) {
      console.log("⚠ Critical test failed!");
    }
  }
}

console.log(`\n${"=".repeat(80)}`);
const finalResult = allPassed ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED";
console.log(`FINAL RESULT: ${finalResult}`);
console.log("=".repeat(80));

report += `## Final Result\n\n**${finalResult}**\n`;

writeFileSync("verification-report.md", report);
console.log("\nReport saved to: verification-report.md");

process.exit(allPassed ? 0 : 1);
