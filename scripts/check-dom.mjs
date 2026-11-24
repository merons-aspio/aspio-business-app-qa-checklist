#!/usr/bin/env node
/**
 * Static DOM contract check.
 *
 * index.html is hand-written, so a renamed or deleted element can silently
 * break startup code such as `$("#someId").onchange = ...`. This script fails
 * the build when:
 *   - index.html contains duplicate element IDs, or
 *   - any TypeScript file under src/ references a literal element ID that is
 *     not declared in index.html or injected by another module at runtime.
 *
 * IDs created dynamically by src/backend.ts and src/mcp.ts are collected from
 * their HTML string literals and `.id = "..."` assignments.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const html = readFileSync(join(root, "index.html"), "utf8");
const srcFiles = readdirSync(srcDir, { recursive: true })
  .map((f) => String(f))
  .filter((f) => f.endsWith(".ts"));
const src = srcFiles
  .map((f) => `\n/* ${f} */\n${readFileSync(join(srcDir, f), "utf8")}`)
  .join("\n");

const ID_ATTR = /\bid\s*=\s*["']([^"']+)["']/g;
const ID_ASSIGN = /\.id\s*=\s*["']([^"']+)["']/g;
const REFS = [
  /\$\(\s*["']#([^"']+)["']\s*\)/g,
  /getElementById\(\s*["']([^"']+)["']\s*\)/g,
  /querySelector(?:All)?\(\s*["'`]#([^"'`\s]+)/g,
  /closest\(\s*["'`]#([^"'`\s]+)/g,
];

const collect = (text, patterns) => {
  const ids = new Set();
  for (const re of patterns) {
    for (const match of text.matchAll(re)) {
      if (match[1] && !match[1].includes("${")) ids.add(match[1]);
    }
  }
  return ids;
};

const htmlIds = [...collect(html, [ID_ATTR])];
const declared = new Set([...htmlIds, ...collect(src, [ID_ATTR, ID_ASSIGN])]);
const referenced = collect(src, REFS);
const missing = [...referenced].filter((id) => !declared.has(id)).sort();

const counts = new Map();
for (const id of htmlIds) counts.set(id, (counts.get(id) || 0) + 1);
const duplicates = [...counts].filter(([, n]) => n > 1).sort(([a], [b]) => a.localeCompare(b));

let failed = false;

if (duplicates.length) {
  failed = true;
  console.error("Duplicate IDs in index.html:");
  for (const [id, n] of duplicates) console.error(`  #${id} (${n} occurrences)`);
}

if (missing.length) {
  failed = true;
  console.error("Element IDs referenced in src/ but never declared:");
  for (const id of missing) console.error(`  #${id}`);
  console.error(
    "\nAdd the element to index.html (or inject it before startup uses it)," +
      " or remove the reference."
  );
}

if (failed) process.exit(1);

console.log(
  `DOM check passed: ${htmlIds.length} static IDs, ${declared.size} declared, ` +
    `${referenced.size} referenced.`
);
