import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guard rail for the architecture rules in docs/ARCHITECTURE.md.
 *
 * The core package must stay pure: no rendering, no browser APIs, no
 * unseeded randomness, no wall-clock time. This test fails if someone
 * (human or AI) accidentally breaks those rules, so the mistake is caught
 * immediately instead of months later when multiplayer is added.
 */
const SRC_DIR = dirname(fileURLToPath(import.meta.url));

const FORBIDDEN: { pattern: RegExp; reason: string }[] = [
  { pattern: /Math\.random\s*\(/, reason: "use SeededRng instead of Math.random()" },
  { pattern: /Date\.now\s*\(/, reason: "core must not read the wall clock; time comes from the simulation tick" },
  { pattern: /new Date\s*\(/, reason: "core must not read the wall clock; time comes from the simulation tick" },
  { pattern: /performance\.now\s*\(/, reason: "core must not read the wall clock; time comes from the simulation tick" },
  { pattern: /from\s+["']phaser["']/, reason: "core must not import the rendering engine" },
  { pattern: /\bdocument\./, reason: "core must not touch the DOM" },
  { pattern: /\bwindow\./, reason: "core must not touch the browser window" },
  { pattern: /\blocalStorage\b/, reason: "core must not touch browser storage; the client handles persistence" },
  { pattern: /\beval\s*\(/, reason: "never evaluate strings as code (imported content must stay data-only)" },
  { pattern: /new Function\s*\(/, reason: "never build functions from strings (imported content must stay data-only)" },
];

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (fullPath.endsWith(".ts") && !fullPath.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("core purity", () => {
  it("contains no forbidden APIs", () => {
    const violations: string[] = [];
    for (const file of collectSourceFiles(SRC_DIR)) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, index) => {
        // Ignore comments so we can explain the rules in writing.
        const code = line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "");
        const trimmed = code.trim();
        if (trimmed.startsWith("*") || trimmed.startsWith("/*")) return;
        for (const { pattern, reason } of FORBIDDEN) {
          if (pattern.test(code)) {
            violations.push(`${file.replace(SRC_DIR, "src")}:${index + 1} - ${reason}`);
          }
        }
      });
    }
    expect(violations).toEqual([]);
  });
});
