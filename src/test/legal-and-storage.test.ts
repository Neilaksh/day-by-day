import { describe, it, expect } from "vitest";
import { LEGAL_CONFIG, VERIFIED_STORAGE_ITEMS } from "../lib/legal-config";
import fs from "fs";
import path from "path";

describe("Legal Config & Storage Audit", () => {
  it("should have valid legal metadata with required TODO fields defined", () => {
    expect(LEGAL_CONFIG.APP_NAME).toBe("Getting 1% Better Each Day");
    expect(LEGAL_CONFIG.OPERATOR_NAME).toContain("TODO");
    expect(LEGAL_CONFIG.OPERATOR_ADDRESS).toContain("TODO");
    expect(LEGAL_CONFIG.CONTACT_EMAIL).toContain("TODO");
    expect(LEGAL_CONFIG.TERMS_VERSION).toBeDefined();
    expect(LEGAL_CONFIG.PRIVACY_VERSION).toBeDefined();
    expect(LEGAL_CONFIG.COOKIE_POLICY_VERSION).toBeDefined();
  });

  it("should accurately document all localStorage keys used in client code", () => {
    const documentedKeys = VERIFIED_STORAGE_ITEMS.map((item) => item.key);

    // Verify all expected keys are in the policy catalog
    expect(documentedKeys).toContain("theme");
    expect(documentedKeys).toContain("pwa_install_hint_dismissed");
    expect(documentedKeys).toContain("cookie_notice_acknowledged");
    expect(documentedKeys).toContain("terms_accepted_version");
    expect(documentedKeys).toContain("sb-*-auth-token");
    expect(documentedKeys).toContain("day-by-day-v3");
  });

  it("should verify no undocumented localStorage keys are written across src/", () => {
    const documentedKeys = new Set([
      "theme",
      "pwa_install_hint_dismissed",
      "cookie_notice_acknowledged",
      "terms_accepted_version",
      "terms_accepted_at",
      "key", // dynamic key in storage wrapper
    ]);

    function scanFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(scanFiles(fullPath));
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const files = scanFiles(path.resolve(__dirname, ".."));
    const setItemRegex = /localStorage\.setItem\(\s*["']([^"']+)["']/g;
    const foundKeys = new Set<string>();

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf-8");
      let match;
      while ((match = setItemRegex.exec(content)) !== null) {
        if (match[1]) foundKeys.add(match[1]);
      }
    }

    // Every key written in code must be documented
    for (const key of foundKeys) {
      expect(documentedKeys.has(key)).toBe(true);
    }
  });

  it("should confirm no external Google Fonts stylesheets or CDNs are referenced in __root.tsx", () => {
    const rootPath = path.resolve(__dirname, "../routes/__root.tsx");
    const content = fs.readFileSync(rootPath, "utf-8");
    expect(content).not.toContain("fonts.googleapis.com");
    expect(content).not.toContain("fonts.gstatic.com");
  });
});
