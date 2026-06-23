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

function runFails(args, pattern, cwd = tmpRoot) {
  try {
    run(args, cwd);
  } catch (error) {
    assert.match(error.stderr?.toString() || error.message, pattern);
    return;
  }
  assert.fail(`Expected command to fail: ${args.join(" ")}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function workflowDirFor(root) {
  const workflowsRoot = path.join(root, ".omykit", "workflows");
  const entries = fs.readdirSync(workflowsRoot);
  assert.equal(entries.length, 1);
  return path.join(workflowsRoot, entries[0]);
}

function workflowDir() {
  return workflowDirFor(tmpRoot);
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

fs.writeFileSync(path.join(tmpRoot, "README.md"), "# Feature X Project\n\nTemporary project context.\n");

const helpOutput = run(["help"]);
assert.match(helpOutput, /Usage:/);
assert.match(helpOutput, /templates/);
assert.match(helpOutput, /board/);

const templatesList = run(["templates", "list", "--lang", "zh-CN"]);
assert.match(templatesList, /change\.standard/);
assert.match(templatesList, /标准变更/);
assert.match(templatesList, /frontend-ui\.strict/);
const templatesValidate = run(["templates", "validate"]);
assert.match(templatesValidate, /Workflow templates valid: 3/);
const templateShow = run(["templates", "show", "frontend-ui.strict", "--lang", "zh-CN"]);
assert.match(templateShow, /"template_id": "frontend-ui.strict"/);
assert.match(templateShow, /"title": "视觉验收"/);

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
planNode.task_complexity = "expert";
planNode.model_tier = "frontier";
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
planCard.model_tier = "frontier";
writeJson(planCardPath, planCard);

const originalPlanCard = { ...planCard };
planCard.language = 42;
writeJson(planCardPath, planCard);
runFails(["validate"], /language must be string or null/);
writeJson(planCardPath, originalPlanCard);

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
const intakeStart = "2099-01-01T00:00:00.000Z";
const intakeEnd = "2099-01-01T00:08:00.000Z";
writeJson(intakeHandoff, {
  workflow_id: "feature-x",
  node_id: "01-intake",
  status: "passed",
  language: "zh-CN",
  model: "GPT-5.4",
  model_provider: "openai",
  model_tier: "standard",
  model_selection_reason: "测试夹具中的常规规划任务。",
  summary: "需求已固化：为 Feature X 创建项目化看板。",
  intake_decision: {
    goal: "为 Feature X 创建可追踪的项目化看板。",
    route: {
      entry: "change",
      project_type: "maintenance/refactor",
      mode: "Standard",
      next_skill: "codex-change-workflow",
    },
    workflow: {
      shape: "tracked controller workflow",
      controller_enabled: true,
      template_id: "change.standard",
      reason: "任务需要多节点状态、看板和 compact 后续跑。",
    },
    assumptions: [
      {
        text: "用户希望看板反映真实项目信息。",
        impact: "入口节点必须记录可审计的任务目标和路由。",
      },
    ],
    questions: [
      {
        question: "看板是否需要中文展示？",
        options: ["中文", "English"],
        answer: "中文，并允许自定义答案。",
        custom_answer_allowed: true,
        resolved: true,
      },
    ],
    custom_answers_allowed: true,
  },
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
  skills_used: [
    {
      name: "omykit",
      source: "local_skill",
      path: "/Users/irainbow/.codex/skills/omykit/SKILL.md",
      purpose: "路由并操作可追踪 workflow。",
      triggered_by: "$omykit",
      evidence: ["evidence/01-intake-summary.txt"],
    },
  ],
  token_usage: {
    source: "manual",
    provider: "openai",
    model: "GPT-5.4",
    input_tokens: 100,
    output_tokens: 40,
    total_tokens: 140,
    notes: "test fixture",
  },
  context_usage: {
    source: "manual_fixture",
    context_level: "scan",
    source_bytes: 1200,
    estimated_tokens: 300,
    input_files: 2,
    notes: "test fixture",
  },
  timing: {
    started_at: intakeStart,
    completed_at: intakeEnd,
    duration_ms: 480000,
    estimated_minutes: 10,
    source: "manual_fixture",
  },
  agent_activity: [
    {
      agent_id: "main-codex",
      role: "planner",
      scope: "nodes/01-intake.json and evidence/01-intake-summary.txt",
      task: "固化 Feature X 需求",
      status: "done",
      mode: "main-agent",
      model_tier: "standard",
      model: "GPT-5.4",
      model_selection_reason: "测试夹具中的常规规划任务。",
      started_at: intakeStart,
      completed_at: intakeEnd,
      token_usage: {
        source: "manual",
        total_tokens: 140,
      },
      context_usage: {
        source: "manual_fixture",
        context_level: "scan",
        estimated_tokens: 300,
        input_files: 2,
      },
      skills_used: [
        {
          name: "omykit",
          source: "local_skill",
          purpose: "创建 intake handoff 测试夹具。",
          evidence: ["evidence/01-intake-summary.txt"],
        },
      ],
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
const badUsageHandoff = path.join(dir, "handoffs", "01-intake-missing-usage-source.json");
writeJson(badUsageHandoff, {
  workflow_id: "feature-x",
  node_id: "01-intake",
  status: "passed",
  summary: "Invalid fixture with missing usage sources.",
  outputs: ["nodes/01-intake.json"],
  verification: [
    {
      command: "manual intake check",
      result: "passed",
    },
  ],
  token_usage: {
    total_tokens: 7,
  },
  context_usage: {
    estimated_tokens: 11,
  },
});
runFails(["validate"], /source is required/);
fs.rmSync(badUsageHandoff);
const badSkillHandoff = path.join(dir, "handoffs", "01-intake-bad-skill.json");
writeJson(badSkillHandoff, {
  workflow_id: "feature-x",
  node_id: "01-intake",
  status: "passed",
  summary: "Invalid fixture with missing skill name.",
  outputs: ["nodes/01-intake.json"],
  skills_used: [
    {
      purpose: "missing skill name",
    },
  ],
  verification: [
    {
      command: "manual intake check",
      result: "passed",
    },
  ],
});
runFails(["validate"], /handoff\.skills_used\[0\]\.name is required/);
fs.rmSync(badSkillHandoff);
const badIntakeDecisionHandoff = path.join(dir, "handoffs", "01-intake-bad-intake-decision.json");
writeJson(badIntakeDecisionHandoff, {
  workflow_id: "feature-x",
  node_id: "01-intake",
  status: "passed",
  summary: "Invalid fixture with missing custom-answer policy.",
  intake_decision: {
    goal: "Bad intake fixture.",
    route: {
      entry: "change",
      project_type: "maintenance/refactor",
      mode: "Standard",
      next_skill: "codex-change-workflow",
    },
    workflow: {
      shape: "tracked controller workflow",
    },
    assumptions: [],
    questions: [
      {
        question: "Pick one fixed option?",
        custom_answer_allowed: false,
        resolved: true,
      },
    ],
    custom_answers_allowed: false,
  },
  outputs: ["nodes/01-intake.json"],
  verification: [
    {
      command: "manual intake check",
      result: "passed",
    },
  ],
});
runFails(["validate"], /custom_answers_allowed must be true/);
fs.rmSync(badIntakeDecisionHandoff);
const completeOutput = run(["complete", "01-intake", "--handoff", "handoffs/01-intake-to-02-design.json"]);
assert.match(completeOutput, /Ready nodes: 02-design design - Design, 02-research research - Research/);
state = readJson(path.join(dir, "state.json"));
assert.equal(state.nodes["01-intake"].status, "passed");
assert.ok(state.nodes["01-intake"].started_at);
assert.ok(state.nodes["01-intake"].completed_at);
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

const badDeliveryHandoff = path.join(dir, "handoffs", "06-delivery-missing-evolution.json");
fs.writeFileSync(path.join(dir, "evidence", "06-delivery-summary.txt"), "delivery review evidence\n");
writeJson(badDeliveryHandoff, {
  workflow_id: "feature-x",
  node_id: "06-delivery",
  status: "passed",
  language: "zh-CN",
  summary: "完成交付但没有记录 workflow 进化复盘。",
  work_items: [
    {
      title: "整理交付证据",
      status: "done",
      detail: "缺少进化候选记录，应该被校验拦截。",
      evidence: ["evidence/06-delivery-summary.txt"],
    },
  ],
  outputs: ["evidence/06-delivery-summary.txt"],
  verification: [
    {
      command: "manual delivery review",
      result: "passed",
      evidence: "evidence/06-delivery-summary.txt",
    },
  ],
});
runFails(["validate"], /passed delivery handoff requires evolution_candidates/);
fs.rmSync(badDeliveryHandoff);

const badEvolutionHandoff = path.join(dir, "handoffs", "06-delivery-bad-evolution.json");
writeJson(badEvolutionHandoff, {
  workflow_id: "feature-x",
  node_id: "06-delivery",
  status: "passed",
  language: "zh-CN",
  summary: "进化候选缺少证据。",
  work_items: [
    {
      title: "记录 workflow 进化候选",
      status: "done",
      evidence: ["evidence/06-delivery-summary.txt"],
    },
  ],
  outputs: ["evidence/06-delivery-summary.txt"],
  verification: [
    {
      command: "manual delivery review",
      result: "passed",
      evidence: "evidence/06-delivery-summary.txt",
    },
  ],
  evolution_candidates: [
    {
      lesson: "交付节点应记录进化候选。",
      scope: "generic_omykit",
      promotion_status: "candidate",
      evidence: [],
    },
  ],
});
runFails(["validate"], /evolution_candidates\[0\]\.evidence must contain at least one evidence path/);
fs.rmSync(badEvolutionHandoff);

const deliveryHandoff = path.join(dir, "handoffs", "06-delivery.json");
writeJson(deliveryHandoff, {
  workflow_id: "feature-x",
  node_id: "06-delivery",
  status: "passed",
  language: "zh-CN",
  summary: "完成交付复盘，并记录可提升到 omyKit 的候选经验。",
  work_items: [
    {
      title: "记录 workflow 进化候选",
      status: "done",
      detail: "把交付复盘沉淀为可审计候选，而不是只写自然语言总结。",
      evidence: ["evidence/06-delivery-summary.txt"],
    },
  ],
  outputs: ["evidence/06-delivery-summary.txt"],
  verification: [
    {
      command: "manual delivery review",
      result: "passed",
      evidence: "evidence/06-delivery-summary.txt",
    },
  ],
  evolution_candidates: [
    {
      lesson: "交付节点应记录进化候选，避免复盘停留在口头总结。",
      scope: "generic_omykit",
      promotion_status: "candidate",
      owner: "codex-workflow-evolution",
      update_surface: "workflow template / scorecard",
      rationale: "适用于所有 tracked workflow 的交付复盘。",
      next_action: "Run codex-workflow-evolution abstraction test.",
      evidence: ["evidence/06-delivery-summary.txt"],
    },
  ],
});
state = readJson(path.join(dir, "state.json"));
state.nodes["06-delivery"] = {
  status: "passed",
  updated_at: new Date().toISOString(),
  last_handoff: "handoffs/06-delivery.json",
  reason: null,
  started_at: "2099-01-01T01:00:00.000Z",
  completed_at: "2099-01-01T01:10:00.000Z",
};
writeJson(path.join(dir, "state.json"), state);

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
assert.equal(board.template.template_id, "change.standard");
assert.equal(board.template.layers.model_profile, "balanced");
assert.ok(Array.isArray(board.scorecard.checks));
assert.ok(board.scorecard.checks.some((check) => check.id === "intake-decision-recorded" && check.status === "passed"));
assert.ok(board.scorecard.checks.some((check) => check.id === "evolution-review-recorded" && check.status === "passed"));
assert.ok(board.scorecard.checks.some((check) => check.id === "board-language" && check.status === "failed"));
assert.ok(board.recommendations.some((item) => item.id === "scorecard-required-not-failed"));
assert.ok(board.recommendations.some((item) => item.id === "run-workflow-evolution"));
const projectedNodes = Object.values(board.columns).flat();
const projectedPlan = projectedNodes.find((node) => node.id === "03-plan");
assert.equal(projectedPlan.task_complexity, "expert");
assert.equal(projectedPlan.model_tier, "frontier");
assert.equal(projectedPlan.recommended_model, "GPT-5.5");
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
assert.ok(Array.isArray(board.context.by_node));
assert.ok(Array.isArray(board.context.by_agent));
assert.ok(Array.isArray(board.skills.by_node));
assert.ok(Array.isArray(board.skills.by_skill));
assert.ok(Array.isArray(board.skills.by_agent));
assert.ok(Array.isArray(board.models.by_node));
assert.ok(Array.isArray(board.models.recommended_by_model));
assert.ok(Array.isArray(board.models.actual_by_model));
assert.ok(Array.isArray(board.timing.by_node));
assert.ok(Array.isArray(board.evolution.candidates));
assert.ok(Array.isArray(board.project.main_changes));
assert.ok(Array.isArray(board.recommendations));
assert.deepEqual(board.improvement_plan, board.recommendations);
assert.ok(Array.isArray(board.risks.retry_alerts));
assert.ok(Array.isArray(board.recent_events));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake"));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && /需求已固化/.test(node.handoff_summary)));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.work_items.some((item) => /Feature X/.test(item.title))));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.intake_decision?.goal === "为 Feature X 创建可追踪的项目化看板。"));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.intake_decision?.route.entry === "change"));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.intake_decision?.workflow.template_id === "change.standard"));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.intake_decision?.custom_answers_allowed === true));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.intake_decision?.questions.some((question) => question.custom_answer_allowed === true)));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.changed_files.some((file) => file.path === "nodes/01-intake.json")));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.token_usage.total_tokens === 140));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.context_usage.estimated_tokens === 300));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.timing.duration_minutes === 8));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.model_tier === "fast"));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.recommended_model === "GPT-5.4-Mini"));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.actual_models.some((model) => model.model === "GPT-5.4")));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.agent_activity.some((activity) => activity.agent_id === "main-codex" && activity.scope)));
assert.ok(board.columns.passed.some((node) => node.id === "01-intake" && node.skills_used.some((skill) => skill.name === "omykit")));
assert.equal(board.summary.skills_used, 1);
assert.equal(board.summary.actual_models, 1);
assert.equal(board.summary.intake_decisions, 1);
assert.equal(board.summary.evolution_candidates, 1);
assert.ok(board.columns.passed.some((node) => node.id === "06-delivery" && node.evolution_candidates.some((item) => item.scope === "generic_omykit")));
assert.ok(board.evolution.by_node.some((item) => item.node_id === "06-delivery" && item.candidates.length === 1));
assert.ok(board.evolution.candidates.some((item) => /交付节点应记录进化候选/.test(item.lesson) && item.owner === "codex-workflow-evolution"));
assert.equal(board.evolution.by_scope.generic_omykit, 1);
assert.equal(board.evolution.by_status.candidate, 1);
assert.equal(board.evolution.generic_candidates.length, 1);
assert.equal(board.usage.totals.total_tokens, 220);
assert.equal(board.usage.recorded_nodes, 2);
assert.ok(board.usage.missing_nodes.includes("02-research"));
assert.ok(board.usage.by_agent.some((agent) => agent.agent_id === "main-codex" && agent.total_tokens === 140));
assert.ok(board.usage.by_parallel_group.some((group) => group.parallel_group === "strategy" && group.nodes.includes("02-research")));
assert.equal(board.context.totals.estimated_tokens, 300);
assert.ok(board.context.by_agent.some((agent) => agent.agent_id === "main-codex" && agent.estimated_tokens === 300));
assert.ok(board.context.missing_nodes.includes("02-research"));
assert.ok(board.skills.by_skill.some((skill) => skill.name === "omykit" && skill.nodes.includes("01-intake")));
assert.ok(board.skills.by_agent.some((agent) => agent.agent_id === "main-codex" && agent.skill === "omykit"));
assert.ok(board.skills.missing_nodes.includes("02-research"));
assert.equal(board.models.actual_recorded_nodes, 1);
assert.ok(board.models.actual_by_model.some((model) => model.model === "GPT-5.4" && model.nodes.includes("01-intake")));
assert.ok(board.models.recommended_by_model.some((model) => model.model === "GPT-5.5" && model.nodes.includes("03-plan")));
assert.ok(board.models.missing_actual_nodes.includes("02-research"));
assert.ok(board.project.main_changes.some((change) => change.path === "nodes/01-intake.json" && /需求接收节点卡/.test(change.summary)));
assert.ok(board.recommendations.some((item) => item.id === "missing-token-usage"));
assert.ok(board.recommendations.some((item) => item.id === "missing-context-usage"));
assert.ok(board.recommendations.some((item) => item.id === "missing-skill-usage"));
assert.ok(board.recommendations.some((item) => item.id === "missing-model-usage"));
assert.ok(board.recommendations.some((item) => item.id === "resolve-02-design"));
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
assert.match(boardHtml, /入口决策/);
assert.match(boardHtml, /为 Feature X 创建可追踪的项目化看板/);
assert.match(boardHtml, /允许自定义答案/);
assert.match(boardHtml, /Token 消耗/);
assert.match(boardHtml, /Skill 使用记录/);
assert.match(boardHtml, /使用的 Skills/);
assert.match(boardHtml, /模型使用记录/);
assert.match(boardHtml, /推荐模型/);
assert.match(boardHtml, /实际模型/);
assert.match(boardHtml, /GPT-5\.4/);
assert.match(boardHtml, /整改建议/);
assert.match(boardHtml, /上下文用量/);
assert.match(boardHtml, /工作流模板/);
assert.match(boardHtml, /Scorecard 验票/);
assert.match(boardHtml, /Workflow 进化/);
assert.match(boardHtml, /交付节点应记录进化候选/);
assert.match(boardHtml, /codex-workflow-evolution/);
assert.match(boardHtml, /技术数据/);
assert.match(boardHtml, /data-filter-status="blocked"/);
assert.match(boardHtml, /aria-pressed="false"/);
assert.match(boardHtml, /id="node-01-intake"/);
assert.match(boardHtml, /data-node-id="01-intake"/);
assert.match(boardHtml, /class="event-list"/);
assert.match(boardHtml, /class="panel technical-data"/);
assert.match(boardHtml, /需求已固化/);
assert.match(boardHtml, /main-codex/);
assert.doesNotMatch(boardHtml, /\{"passed"/);
const eventListHtml = boardHtml.slice(boardHtml.indexOf('class="event-list"'), boardHtml.indexOf('class="panel technical-data"'));
assert.doesNotMatch(eventListHtml, /&quot;event&quot;/);

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
assert.match(englishHtml, /Improvement Plan/);
assert.match(englishHtml, /Technical Data/);
assert.match(englishHtml, /Click a metric/);

const tmpZh = fs.mkdtempSync(path.join(os.tmpdir(), "omykit-workflow-zh-"));
fs.writeFileSync(path.join(tmpZh, "README.md"), "# 中文 UI 项目\n\nTemporary project context.\n");
const zhInit = run(["init", "中文 UI 看板", "--id", "ui-board", "--template", "frontend-ui.strict"], tmpZh);
assert.match(zhInit, /Workflow created: ui-board/);
const zhDir = workflowDirFor(tmpZh);
run(["board"], tmpZh);
const inferredZhBoard = readJson(path.join(zhDir, "board.json"));
assert.equal(inferredZhBoard.language, "zh-CN");
assert.equal(inferredZhBoard.template.template_id, "frontend-ui.strict");
assert.equal(inferredZhBoard.summary.total, 7);
assert.ok(inferredZhBoard.columns.ready.some((node) => node.id === "01-intake" && node.display_title === "UI 需求接收"));
assert.ok(inferredZhBoard.scorecard.checks.some((check) => check.scorecard_id === "frontend-ui"));
assert.ok(inferredZhBoard.scorecard.checks.some((check) => check.id === "board-language" && check.status === "passed"));
const inferredZhHtml = fs.readFileSync(path.join(zhDir, "board.html"), "utf8");
assert.match(inferredZhHtml, /<html lang="zh-CN">/);
assert.match(inferredZhHtml, /严格前端 UI/);
assert.match(inferredZhHtml, /目标页面、用户意图、状态、约束和视觉验收标准已经明确/);
fs.rmSync(tmpZh, { recursive: true, force: true });

fs.rmSync(tmpRoot, { recursive: true, force: true });
console.log("omykit workflow tests passed");
