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
const graphPath = path.join(dir, "graph.json");
let graph = readJson(graphPath);
const designNode = graph.nodes.find((node) => node.id === "02-design");
designNode.worker_profile = "planner";
designNode.claimed_by = "codex";
designNode.parallel_group = "strategy";
designNode.join_policy = "manual_review";
designNode.lease_expires_at = "2099-01-01T00:00:00.000Z";
designNode.handoff_target = "03-plan";
const planNode = graph.nodes.find((node) => node.id === "03-plan");
for (const field of ["worker_profile", "claimed_by", "parallel_group", "join_policy", "lease_expires_at", "handoff_target"]) {
  delete planNode[field];
}
writeJson(graphPath, graph);
const planCardPath = path.join(dir, "nodes", "03-plan.json");
const planCard = readJson(planCardPath);
for (const field of ["worker_profile", "claimed_by", "parallel_group", "join_policy", "lease_expires_at", "handoff_target"]) {
  delete planCard[field];
}
writeJson(planCardPath, planCard);

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

run(["complete", "01-intake", "--handoff", "handoffs/01-intake-to-02-design.json"]);
state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "passed");
assert.equal(state.nodes["02-design"].status, "blocked");

const validateOutput = run(["validate"]);
assert.match(validateOutput, /Workflow valid: feature-x/);

const resumeOutput = run(["resume"]);
assert.match(resumeOutput, /Resume context:/);
assert.match(resumeOutput, /Recent ledger events:/);

const boardOutput = run(["board", "--lang", "zh-CN"]);
assert.match(boardOutput, /Workflow board generated: feature-x/);
assert.match(boardOutput, /board\.json/);
assert.match(boardOutput, /board\.html/);
const board = readJson(path.join(dir, "board.json"));
assert.equal(board.language, "zh-CN");
assert.equal(board.summary.total, 6);
assert.ok(Array.isArray(board.columns.ready));
assert.ok(Array.isArray(board.flow.dependency_edges));
assert.ok(Array.isArray(board.collaboration.worker_profiles));
assert.ok(Array.isArray(board.risks.retry_alerts));
assert.ok(Array.isArray(board.recent_events));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake"));
assert.ok(board.columns.blocked.some((node) => node.id === "02-design"));
assert.ok(board.flow.reject_edges.some((edge) => edge.from === "02-design" && edge.to === "01-intake"));
assert.ok(board.collaboration.worker_profiles.some((lane) => lane.profile === "planner"));
assert.ok(board.collaboration.worker_profiles.some((lane) => lane.profile === "unassigned" && lane.nodes.includes("03-plan")));
assert.ok(board.collaboration.leases.some((lease) => lease.node_id === "02-design"));
assert.ok(!board.risks.blockers.some((line) => /Workflow:/.test(line)));
assert.ok(!board.risks.decisions.some((line) => /Workflow:/.test(line)));
const boardHtml = fs.readFileSync(path.join(dir, "board.html"), "utf8");
assert.match(boardHtml, /总控中心/);
assert.match(boardHtml, /协作泳道/);

fs.rmSync(tmpRoot, { recursive: true, force: true });
console.log("omykit workflow tests passed");
