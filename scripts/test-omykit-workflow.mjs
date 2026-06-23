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

fs.writeFileSync(path.join(tmpRoot, "README.md"), "# Feature X Project\n\nTemporary project context.\n");

const initOutput = run(["init", "Feature X", "--id", "feature-x"]);
assert.match(initOutput, /Workflow created: feature-x/);

const dir = workflowDir();
const graphPath = path.join(dir, "graph.json");
let graph = readJson(graphPath);
graph.nodes.push({
  id: "02-research",
  type: "research",
  title: "Research",
  depends_on: [],
  required: false,
  retry_limit: 1,
  context_level: "scan",
  owner: "codex",
  worker_profile: "researcher",
  claimed_by: "agent-research",
  parallel_group: "strategy",
  join_policy: "manual_review",
  lease_expires_at: "2099-01-02T00:00:00.000Z",
  handoff_target: "03-plan",
  acceptance: ["Research note is available without blocking design."],
});
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
const statePath = path.join(dir, "state.json");
let state = readJson(statePath);
state.nodes["02-research"] = {
  status: "ready",
  updated_at: new Date().toISOString(),
  last_handoff: null,
  reason: null,
};
writeJson(statePath, state);
writeJson(path.join(dir, "nodes", "02-research.json"), {
  schema_version: "1",
  workflow_id: "feature-x",
  node_id: "02-research",
  type: "research",
  title: "调研：并行节点",
  objective: "验证无依赖 research 节点可以与设计节点并行展示。",
  depends_on: [],
  context_level: "scan",
  acceptance: ["并行 research 节点已进入看板。"],
  allowed_outputs: ["handoffs/02-research.json", "evidence/02-research-summary.txt"],
  handoff_required: true,
  worker_profile: "researcher",
  claimed_by: "agent-research",
  parallel_group: "strategy",
  join_policy: "manual_review",
  lease_expires_at: "2099-01-02T00:00:00.000Z",
  handoff_target: "03-plan",
});
const planCardPath = path.join(dir, "nodes", "03-plan.json");
const planCard = readJson(planCardPath);
for (const field of ["worker_profile", "claimed_by", "parallel_group", "join_policy", "lease_expires_at", "handoff_target"]) {
  delete planCard[field];
}
planCard.title = "计划：实现任务拆解";
planCard.objective = "把看板改进拆成可验证的实现和文档步骤。";
planCard.acceptance = ["计划节点包含可验证步骤。"];
writeJson(planCardPath, planCard);

state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "ready");
assert.equal(state.nodes["02-design"].status, "pending");
assert.equal(state.nodes["02-research"].status, "ready");

const nextOutput = run(["next"]);
assert.match(nextOutput, /01-intake intake - Intake/);
assert.match(nextOutput, /02-research research - Research/);

run(["start", "01-intake"]);
state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "running");
assert.ok(state.active_nodes.includes("01-intake"));

const intakeHandoff = path.join(dir, "handoffs", "01-intake-to-02-design.json");
fs.writeFileSync(path.join(dir, "evidence", "01-intake-summary.txt"), "intake evidence\n");
writeJson(intakeHandoff, {
  workflow_id: "feature-x",
  node_id: "01-intake",
  status: "passed",
  summary: "需求已固化：为 Feature X 创建项目化看板。",
  work_items: [
    {
      title: "记录 Feature X 的目标和验收标准",
      status: "done",
      detail: "把用户目标转成可追踪 workflow 输入。",
      files: ["nodes/01-intake.json"],
      evidence: ["evidence/01-intake-summary.txt"],
    },
  ],
  outputs: ["nodes/01-intake.json"],
  changed_files: [
    {
      path: "nodes/01-intake.json",
      status: "created",
      summary: "需求接收节点卡。",
    },
  ],
  token_usage: {
    source: "manual",
    input_tokens: 100,
    output_tokens: 40,
    total_tokens: 140,
    notes: "test fixture",
  },
  agent_activity: [
    {
      agent_id: "main-codex",
      role: "planner",
      task: "固化 Feature X 需求",
      status: "done",
      token_usage: {
        source: "manual",
        total_tokens: 140,
      },
      evidence: ["evidence/01-intake-summary.txt"],
    },
  ],
  verification: [
    {
      command: "manual intake check",
      result: "passed",
      evidence: "evidence/01-intake-summary.txt",
    },
  ],
});
const completeOutput = run(["complete", "01-intake", "--handoff", "handoffs/01-intake-to-02-design.json"]);
assert.match(completeOutput, /Ready nodes: 02-design design - Design, 02-research research - Research/);
state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "passed");
assert.equal(state.nodes["02-design"].status, "ready");
assert.equal(state.nodes["02-research"].status, "ready");

run(["start", "02-design"]);
state = readJson(path.join(dir, "state.json"));
assert.ok(state.active_nodes.includes("02-design"));
const rejectHandoff = path.join(dir, "handoffs", "02-design-to-01-intake.reject.json");
fs.writeFileSync(path.join(dir, "evidence", "02-design-review.txt"), "design review evidence\n");
writeJson(rejectHandoff, {
  workflow_id: "feature-x",
  node_id: "02-design",
  status: "failed",
  summary: "Design found intake gap.",
  reject_to: "01-intake",
  reason: "Success criteria were incomplete.",
  evidence: ["evidence/02-design-review.txt"],
  required_fix: "Clarify acceptance criteria before design continues.",
  token_usage: {
    source: "manual",
    total_tokens: 80,
  },
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
assert.equal(state.nodes["02-research"].status, "ready");
assert.ok(!state.active_nodes.includes("02-design"));

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
assert.equal(board.summary.total, 7);
assert.equal(board.project.name, "Feature X Project");
assert.equal(board.project.workflow_id, "feature-x");
assert.ok(Array.isArray(board.project.key_files));
assert.ok(Array.isArray(board.project.git.status));
assert.ok(Array.isArray(board.columns.ready));
assert.ok(Array.isArray(board.flow.dependency_edges));
assert.ok(Array.isArray(board.collaboration.worker_profiles));
assert.ok(Array.isArray(board.usage.by_node));
assert.ok(Array.isArray(board.usage.by_agent));
assert.ok(Array.isArray(board.usage.by_parallel_group));
assert.ok(Array.isArray(board.risks.retry_alerts));
assert.ok(Array.isArray(board.recent_events));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake"));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && /需求已固化/.test(node.handoff_summary)));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.work_items.some((item) => /Feature X/.test(item.title))));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.changed_files.some((file) => file.path === "nodes/01-intake.json")));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.token_usage.total_tokens === 140));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.agent_activity.some((activity) => activity.agent_id === "main-codex")));
assert.equal(board.usage.totals.total_tokens, 220);
assert.equal(board.usage.recorded_nodes, 2);
assert.ok(board.usage.missing_nodes.includes("02-research"));
assert.ok(board.usage.by_agent.some((agent) => agent.agent_id === "main-codex" && agent.total_tokens === 140));
assert.ok(board.usage.by_parallel_group.some((group) => group.parallel_group === "strategy" && group.nodes.includes("02-research")));
assert.ok(board.columns.blocked.some((node) => node.id === "02-design"));
assert.ok(board.columns.ready.some((node) => node.id === "02-research"));
assert.ok(board.flow.reject_edges.some((edge) => edge.from === "02-design" && edge.to === "01-intake"));
assert.ok(board.flow.parallel_groups.some((group) => group.group === "strategy" && group.nodes.includes("02-research")));
assert.ok(board.collaboration.worker_profiles.some((lane) => lane.profile === "planner"));
assert.ok(board.collaboration.worker_profiles.some((lane) => lane.profile === "researcher"));
assert.ok(board.collaboration.worker_profiles.some((lane) => lane.profile === "unassigned" && lane.nodes.includes("03-plan")));
assert.ok(board.collaboration.leases.some((lease) => lease.node_id === "02-design"));
assert.ok(board.collaboration.leases.some((lease) => lease.node_id === "02-research"));
assert.ok(!board.risks.blockers.some((line) => /Workflow:/.test(line)));
assert.ok(!board.risks.decisions.some((line) => /Workflow:/.test(line)));
const boardHtml = fs.readFileSync(path.join(dir, "board.html"), "utf8");
assert.match(boardHtml, /总控中心/);
assert.match(boardHtml, /项目快照/);
assert.match(boardHtml, /协作泳道/);
assert.match(boardHtml, /任务追踪/);
assert.match(boardHtml, /Token 消耗/);
assert.match(boardHtml, /需求已固化/);
assert.match(boardHtml, /main-codex/);

run(["board", "--lang", "中文"]);
const zhAliasBoard = readJson(path.join(dir, "board.json"));
assert.equal(zhAliasBoard.language, "zh-CN");
const zhAliasHtml = fs.readFileSync(path.join(dir, "board.html"), "utf8");
assert.match(zhAliasHtml, /<html lang="zh-CN">/);

run(["board", "--lang", "en"]);
const englishBoard = readJson(path.join(dir, "board.json"));
assert.equal(englishBoard.language, "en");
const englishHtml = fs.readFileSync(path.join(dir, "board.html"), "utf8");
assert.match(englishHtml, /Command Center/);
assert.match(englishHtml, /Task Tracker/);

fs.rmSync(tmpRoot, { recursive: true, force: true });
console.log("omykit workflow tests passed");
