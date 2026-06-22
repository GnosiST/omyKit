#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const configPath = path.resolve("upstream-sources.json");

if (!fs.existsSync(configPath)) {
  console.error(`Cannot find ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const sources = Array.isArray(config.sources) ? config.sources : [];
const requiresVerification = Boolean(config.source_integrity);

if (sources.length === 0) {
  console.log("No upstream sources configured.");
  process.exit(0);
}

const changed = [];

for (const source of sources) {
  if (!source.id || !source.url || !source.baseline) {
    console.error(`Invalid source entry: ${JSON.stringify(source)}`);
    process.exit(1);
  }

  if (requiresVerification) {
    const verification = source.verification;
    if (!verification || typeof verification !== "object") {
      console.error(`Missing source-integrity verification for ${source.id}`);
      process.exit(1);
    }

    const [repoOwner] = String(source.repo || "").split("/");
    if (
      repoOwner &&
      typeof verification.owner === "string" &&
      verification.owner.toLowerCase() !== repoOwner.toLowerCase()
    ) {
      console.error(
        `Verification owner mismatch for ${source.id}: ${verification.owner} != ${repoOwner}`,
      );
      process.exit(1);
    }

    const invalidVerification =
      typeof verification.owner !== "string" ||
      typeof verification.owner_type !== "string" ||
      !Number.isInteger(verification.stars) ||
      verification.stars < 0 ||
      typeof verification.fork !== "boolean" ||
      typeof verification.archived !== "boolean" ||
      typeof verification.reference_scope !== "string" ||
      verification.reference_scope.length === 0;

    if (invalidVerification) {
      console.error(`Invalid source-integrity verification for ${source.id}`);
      process.exit(1);
    }
  }

  let output;
  try {
    output = execFileSync("git", ["ls-remote", source.url, "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    console.error(`Failed to inspect ${source.id} (${source.url})`);
    if (error.stderr) console.error(String(error.stderr).trim());
    process.exit(1);
  }

  const latest = output.split(/\s+/)[0];
  if (!/^[0-9a-f]{40}$/i.test(latest)) {
    console.error(`Unexpected HEAD response for ${source.id}: ${output}`);
    process.exit(1);
  }

  if (latest === source.baseline) {
    console.log(`OK ${source.id}: ${latest}`);
    continue;
  }

  changed.push({ ...source, latest });
  console.log(`UPDATE ${source.id}: ${source.baseline} -> ${latest}`);
  console.log(`  ${source.repo || source.url}`);
  if (source.role) console.log(`  role: ${source.role}`);
}

if (changed.length > 0) {
  console.log("");
  console.log("Review required:");
  console.log("- Inspect upstream diffs or release notes from the baseline to latest commit.");
  console.log("- Summarize reusable workflow lessons only; do not copy third-party content.");
  console.log("- Use codex-workflow-evolution before changing omyKit.");
  console.log("- Update upstream-sources.json baselines only after review.");
  if (strict) process.exit(1);
}
