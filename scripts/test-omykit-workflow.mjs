#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const controller = path.join(repoRoot, "scripts", "omykit-workflow.mjs");
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "omykit-workflow-"));

function run(args, cwd = tmpRoot) {
  return execFileSync(process.execPath, [controller, ...args], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function workflowDir() {
  const workflowsRoot = path.join(tmpRoot, ".omykit", "workflows");
  const entries = fs.readdirSync(workflowsRoot);
  assert.equal(entries.length, 1);
  return path.join(workflowsRoot, entries[0]);
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

const initOutput = run(["init", "Feature X", "--id", "feature-x"]);
assert.match(initOutput, /Workflow created: feature-x/);

const dir = workflowDir();
let state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "ready");
assert.equal(state.nodes["02-design"].status, "pending");

const nextOutput = run(["next"]);
assert.match(nextOutput, /01-intake intake - Intake/);

run(["start", "01-intake"]);
state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "running");

const intakeHandoff = path.join(dir, "handoffs", "01-intake-to-02-design.json");
writeJson(intakeHandoff, {
  workflow_id: "feature-x",
  node_id: "01-intake",
  status: "passed",
  summary: "Intake captured.",
  outputs: ["nodes/01-intake.json"],
  verification: [
    {
      command: "manual intake check",
      result: "passed",
      evidence: "evidence/01-intake-summary.txt",
    },
  ],
});
const completeOutput = run(["complete", "01-intake", "--handoff", "handoffs/01-intake-to-02-design.json"]);
assert.match(completeOutput, /Ready nodes: 02-design design - Design/);
state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "passed");
assert.equal(state.nodes["02-design"].status, "ready");

run(["start", "02-design"]);
const rejectHandoff = path.join(dir, "handoffs", "02-design-to-01-intake.reject.json");
writeJson(rejectHandoff, {
  workflow_id: "feature-x",
  node_id: "02-design",
  status: "failed",
  summary: "Design found intake gap.",
  reject_to: "01-intake",
  reason: "Success criteria were incomplete.",
  evidence: ["evidence/02-design-review.txt"],
  required_fix: "Clarify acceptance criteria before design continues.",
});
const rejectOutput = run([
  "reject",
  "02-design",
  "--to",
  "01-intake",
  "--handoff",
  "handoffs/02-design-to-01-intake.reject.json",
]);
assert.match(rejectOutput, /Failed nodes: 02-design design - Design/);
state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "ready");
assert.equal(state.nodes["02-design"].status, "failed");

const blockOutput = run(["block", "02-design", "--reason", "Waiting for user confirmation"]);
assert.match(blockOutput, /Blocked nodes: 02-design design - Design/);
state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["02-design"].status, "blocked");

const validateOutput = run(["validate"]);
assert.match(validateOutput, /Workflow valid: feature-x/);

const resumeOutput = run(["resume"]);
assert.match(resumeOutput, /Resume context:/);
assert.match(resumeOutput, /Recent ledger events:/);

fs.rmSync(tmpRoot, { recursive: true, force: true });
console.log("omykit workflow tests passed");
