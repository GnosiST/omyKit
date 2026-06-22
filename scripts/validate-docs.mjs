#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const roots = [
  "README.md",
  "README.zh-CN.md",
  "AGENTS.md",
  "CHANGELOG.md",
  "docs",
  "prompts",
  "skills",
];

const markdownFiles = [];

function walk(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) {
      if (entry === ".git" || entry === "node_modules") continue;
      walk(path.join(target, entry));
    }
    return;
  }
  if (target.endsWith(".md")) markdownFiles.push(target);
}

for (const root of roots) walk(root);

const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
const errors = [];

for (const file of markdownFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("mailto:")) {
      continue;
    }
    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }
    const [rawPath] = target.split("#");
    if (!rawPath) continue;
    const resolved = path.normalize(path.join(path.dirname(file), rawPath));
    if (!fs.existsSync(resolved)) {
      errors.push(`${file}: missing link target ${match[1]}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Checked ${markdownFiles.length} Markdown files; all local links resolve.`);
