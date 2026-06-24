#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const strict = args.has("--strict");
const forceReview = args.has("--force-review");
const jsonOutput = args.has("--json");
const configPath = path.resolve("upstream-sources.json");
const reportPath = valueAfter("--report");

function valueAfter(flag) {
  const index = rawArgs.indexOf(flag);
  if (index === -1) return null;
  return rawArgs[index + 1] || null;
}

function log(message = "") {
  if (!jsonOutput) console.log(message);
}

function parseDateOnly(value) {
  if (!value || typeof value !== "string") return null;
  const time = Date.parse(`${value.slice(0, 10)}T00:00:00.000Z`);
  return Number.isFinite(time) ? time : null;
}

function daysSince(dateValue, nowValue = new Date()) {
  const time = parseDateOnly(dateValue);
  if (time === null) return null;
  return Math.floor((Date.UTC(nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()) - time) / 86_400_000);
}

if (!fs.existsSync(configPath)) {
  console.error(`Cannot find ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const sources = Array.isArray(config.sources) ? config.sources : [];
const requiresVerification = Boolean(config.source_integrity);
const reviewIntervalDays = Number.isInteger(config.review_policy?.review_interval_days)
  ? config.review_policy.review_interval_days
  : 14;
const sinceLastReview = daysSince(config.source_integrity?.last_verified_on);
const reviewDue = forceReview || sinceLastReview === null || sinceLastReview >= reviewIntervalDays;

if (sources.length === 0) {
  log("No upstream sources configured.");
  process.exit(0);
}

const changed = [];
const ok = [];

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
    ok.push({ id: source.id, baseline: source.baseline, latest });
    log(`OK ${source.id}: ${latest}`);
    continue;
  }

  const state = reviewDue ? "review_required" : "deferred_within_cadence";
  const entry = { ...source, latest, state };
  changed.push(entry);
  log(`${reviewDue ? "UPDATE" : "DEFER"} ${source.id}: ${source.baseline} -> ${latest}`);
  log(`  ${source.repo || source.url}`);
  if (source.role) log(`  role: ${source.role}`);
}

if (changed.length > 0) {
  log("");
  if (reviewDue) {
    log("Review required:");
    log("- Inspect upstream diffs or release notes from the baseline to latest commit.");
    log("- Summarize reusable workflow lessons only; do not copy third-party content.");
    log("- Use codex-workflow-evolution before changing omyKit.");
    log("- Update upstream-sources.json baselines only after review.");
  } else {
    log(`Drift detected but deferred: last source review was ${sinceLastReview} day(s) ago; review interval is ${reviewIntervalDays} days.`);
    log("- Run with --force-review before releases or when a task depends on current upstream behavior.");
  }
}

const report = {
  checked_at: new Date().toISOString(),
  source_integrity_last_verified_on: config.source_integrity?.last_verified_on || null,
  review_interval_days: reviewIntervalDays,
  days_since_last_review: sinceLastReview,
  review_due: reviewDue,
  force_review: forceReview,
  ok_count: ok.length,
  changed_count: changed.length,
  changed: changed.map((source) => ({
    id: source.id,
    repo: source.repo || null,
    url: source.url,
    baseline: source.baseline,
    latest: source.latest,
    state: source.state,
    role: source.role || null,
  })),
};

if (reportPath) {
  fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
}

if (changed.length > 0 && strict && reviewDue) {
  process.exit(1);
}
