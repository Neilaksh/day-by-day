const { execSync } = require("child_process");

console.log("=".repeat(80));
console.log("VERIFICATION REPORT - " + new Date().toISOString());
console.log("=".repeat(80));

const commands = [
  {
    name: "TypeScript Check",
    cmd: "npx tsc --noEmit",
    description: "Checking for TypeScript errors...",
  },
  {
    name: "ESLint Check",
    cmd: "npx eslint . --ext .ts,.tsx",
    description: "Checking for ESLint errors...",
  },
];

let allPassed = true;

for (const { name, cmd, description } of commands) {
  console.log("\n" + "-".repeat(80));
  console.log(`${name.toUpperCase()}`);
  console.log("-".repeat(80));
  console.log(description);
  console.log(`Command: ${cmd}\n`);

  try {
    const output = execSync(cmd, {
      cwd: "c:\\\\lucky\\\\day-by-day",
      encoding: "utf8",
      stdio: "pipe",
      maxBuffer: 10 * 1024 * 1024,
    });

    console.log("✓ PASSED");
    if (output.trim()) {
      console.log("Output:", output.trim());
    }
  } catch (error) {
    allPassed = false;
    const output = (error.stdout || "") + (error.stderr || "");
    console.log("✗ FAILED");
    console.log(`Exit code: ${error.status || "unknown"}`);

    if (output) {
      const lines = output.split("\n").filter((line) => line.trim());

      // Count errors and warnings
      const errors = lines.filter((line) => /error/.test(line));
      const warnings = lines.filter((line) => /warn/.test(line));

      console.log(`\nErrors found: ${errors.length}`);
      console.log(`Warnings found: ${warnings.length}`);

      // Show sample of errors (first 30 lines)
      if (lines.length > 0) {
        console.log("\nOutput (first 30 lines):");
        lines.slice(0, 30).forEach((line) => console.log(line));
        if (lines.length > 30) {
          console.log(`\n... [${lines.length - 30} more lines omitted]`);
        }
      }
    }
  }
}

console.log("\n" + "=".repeat(80));
console.log("FINAL RESULT: " + (allPassed ? "✓ ALL CHECKS PASSED" : "✗ SOME CHECKS FAILED"));
console.log("=".repeat(80));

process.exit(allPassed ? 0 : 1);
