#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = "1";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_TEMPLATE_ID = "change.standard";
const COLUMN_STATUSES = ["pending", "ready", "running", "blocked", "failed", "passed", "skipped"];
const STATUSES = new Set(["pending", "ready", "running", "passed", "failed", "blocked", "skipped"]);
const TERMINAL_STATUSES = new Set(["passed", "skipped"]);
const HANDOFF_STATUSES = new Set(["passed", "failed", "blocked", "skipped"]);
const SCORECARD_SEVERITIES = new Set(["required", "recommended"]);
const NODE_TYPES = new Set([
  "intake",
  "research",
  "design",
  "plan",
  "implement",
  "verify",
  "review",
  "delivery",
  "evolution",
]);
const MODES = new Set(["Lite", "Standard", "Strict"]);
const CONTEXT_LEVELS = new Set(["scan", "focus", "deep"]);
const JOIN_POLICIES = new Set(["all_required", "any_passed", "manual_review"]);
const TASK_COMPLEXITIES = new Set(["simple", "standard", "complex", "expert"]);
const MODEL_TIERS = new Set(["fast", "standard", "frontier"]);
const AGENT_ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{1,80}$/;
const COLLABORATION_FIELDS = [
  "worker_profile",
  "claimed_by",
  "parallel_group",
  "join_policy",
  "lease_expires_at",
  "handoff_target",
  "task_complexity",
  "model_tier",
  "model_selection_reason",
  "estimated_minutes",
  "language",
  "agent",
  "model_profile",
  "runtime_profile",
  "safety_profile",
  "scorecard",
  "objective",
  "title_i18n",
  "objective_i18n",
  "acceptance_i18n",
  "allowed_outputs",
];
const DEFAULT_MODE = "Standard";
const BOARD_LABELS = {
  en: {
    pageTitle: "omyKit Board",
    commandCenter: "Command Center",
    clickMetricHint: "Click a metric to jump to matching nodes.",
    showingStatus: "Showing",
    clearFilter: "Clear filter",
    complete: "complete",
    next: "Next",
    criticalPath: "Critical path",
    total: "Total",
    ready: "Ready",
    running: "Running",
    blocked: "Blocked",
    failed: "Failed",
    passed: "Passed",
    skipped: "Skipped",
    pending: "Pending",
    flowMap: "Flow Map",
    dependencies: "Dependencies",
    rejectEdges: "Reject Edges",
    noEdges: "No edges",
    noRejectEdges: "No reject edges",
    collaborationLanes: "Collaboration Lanes",
    nodes: "Nodes",
    counts: "Counts",
    unclaimedReady: "Unclaimed ready",
    claimedRunning: "Claimed running",
    leases: "Leases",
    workBoard: "Work Board",
    empty: "empty",
    none: "none",
    nodeDetails: "Node Details",
    objective: "Objective",
    dependsOn: "Depends On",
    acceptance: "Acceptance",
    outputs: "Outputs",
    requiredChecks: "Required Checks",
    evidencePaths: "Evidence Paths",
    openRisks: "Open Risks",
    notes: "Notes",
    riskPanel: "Risk And Decision Panel",
    blockers: "Blockers",
    failedHandoffs: "Failed Handoffs",
    retryAlerts: "Retry Alerts",
    skippedRequired: "Skipped Required",
    decisions: "Decisions",
    recentEvents: "Recent Events",
    projection: "Board Projection",
    generated: "generated",
    projectSnapshot: "Project Snapshot",
    mainChanges: "Main Changes",
    noMainChanges: "No project changes recorded",
    projectPath: "Project path",
    gitBranch: "Git branch",
    gitCommit: "Git commit",
    gitDirty: "Working tree",
    dirty: "dirty",
    clean: "clean",
    activeChanges: "Active changes",
    recentCommits: "Recent commits",
    keyFiles: "Key files",
    topLevel: "Top-level structure",
    workflowFiles: "Workflow files",
    handoffSummary: "Handoff Summary",
    verification: "Verification",
    noActiveChanges: "No active tracked changes",
    type: "Type",
    worker: "Worker",
    claimed: "Claimed",
    retry: "Retry",
    handoff: "Handoff",
    evidence: "Evidence",
    taskTracker: "Task Tracker",
    statusNodes: "Status Nodes",
    workItems: "Work Items",
    changedFiles: "Changed Files",
    changeSummary: "Change Summary",
    tokenUsage: "Token Usage",
    tokenTotal: "Total tokens",
    tokenRecorded: "Recorded nodes",
    tokenMissing: "Missing token records",
    tokenCoverage: "Token coverage",
    contextUsage: "Context Usage",
    contextCoverage: "Context coverage",
    contextTotal: "Approx context tokens",
    contextMissing: "Missing context records",
    timeUsage: "Time",
    elapsed: "Elapsed",
    estimatedRemaining: "Estimated remaining",
    averageNodeTime: "Average node time",
    template: "Template",
    templateId: "Template id",
    templateVersion: "Template version",
    workflowTemplate: "Workflow Template",
    scorecard: "Scorecard",
    score: "Score",
    scorecardPassed: "Passed checks",
    scorecardFailed: "Failed checks",
    scorecardWarnings: "Warnings",
    scorecardPending: "Pending checks",
    severity: "Severity",
    profile: "Profile",
    agent: "Agent",
    modelProfile: "Model profile",
    runtimeProfile: "Runtime profile",
    safetyProfile: "Safety profile",
    safetyLimits: "Safety limits",
    scorecardHelp: "Scorecard checks recorded workflow evidence instead of trusting narrative claims.",
    startedAt: "Started",
    completedAt: "Completed",
    duration: "Duration",
    eta: "ETA",
    modelTier: "Model tier",
    modelSelection: "Model selection",
    complexity: "Complexity",
    assignment: "Assignment",
    role: "Role",
    scope: "Scope",
    parallelGroups: "Parallel Groups",
    agentActivity: "Agent Activity",
    agentPolicy: "Agent Policy",
    actualWork: "Actual Work",
    nodeContract: "Node Contract",
    timeline: "Timeline",
    timelineHelp: "Recent events are the audit trail for starts, completions, rejects, and blocks.",
    flowHelp: "Flow map shows dependency order and reject paths; click node ids elsewhere for details.",
    collaborationHelp: "Lanes group work by role and model tier. They show coordination records, not automatic dispatch.",
    improvementPlan: "Improvement Plan",
    noRecommendations: "No action required from the current board data.",
    actionHint: "Action",
    inspectNode: "Inspect node",
    openDetails: "Open details",
    technicalData: "Technical Data",
    rawProjection: "Raw board projection",
    statusBreakdown: "Status breakdown",
    claimedBy: "Claimed by",
    noClaims: "No claimed running nodes",
    noLeases: "No active leases",
    noWorkItems: "No work items recorded",
    noChangedFiles: "No changed files recorded",
    noAgentActivity: "No agent activity recorded",
    notRecorded: "not recorded",
    exists: "exists",
    missingPath: "missing",
    source: "source",
    files: "files",
    checks: "checks",
    work: "work",
    agents: "agents",
    tokens: "tokens",
    unclaimed: "unclaimed",
    missing: "missing",
    deliveryComplete: "Delivery complete or no ready nodes.",
    resolveFailed: "Resolve or reject from",
    unblock: "Unblock",
    recordBlocker: "or record a blocking handoff.",
    start: "Start",
    completeHandoff: "Complete",
    withHandoff: "with a structured handoff.",
  },
  "zh-CN": {
    pageTitle: "omyKit 看板",
    commandCenter: "总控中心",
    clickMetricHint: "点击指标可跳转到对应状态节点。",
    showingStatus: "正在查看",
    clearFilter: "清除筛选",
    complete: "完成",
    next: "下一步",
    criticalPath: "关键路径",
    total: "总数",
    ready: "就绪",
    running: "进行中",
    blocked: "阻塞",
    failed: "失败",
    passed: "通过",
    skipped: "跳过",
    pending: "等待",
    flowMap: "流程地图",
    dependencies: "依赖边",
    rejectEdges: "打回边",
    noEdges: "无边",
    noRejectEdges: "无打回边",
    collaborationLanes: "协作泳道",
    nodes: "节点",
    counts: "计数",
    unclaimedReady: "未认领就绪节点",
    claimedRunning: "已认领进行中节点",
    leases: "租约",
    workBoard: "工作看板",
    empty: "空",
    none: "无",
    nodeDetails: "节点详情",
    objective: "目标",
    dependsOn: "依赖",
    acceptance: "验收条件",
    outputs: "输出",
    requiredChecks: "必要检查",
    evidencePaths: "证据路径",
    openRisks: "开放风险",
    notes: "备注",
    riskPanel: "风险与决策",
    blockers: "阻塞项",
    failedHandoffs: "失败交接",
    retryAlerts: "重试告警",
    skippedRequired: "跳过的必需节点",
    decisions: "决策",
    recentEvents: "最近事件",
    projection: "看板投影数据",
    generated: "生成于",
    projectSnapshot: "项目快照",
    mainChanges: "主要改动",
    noMainChanges: "未记录项目改动",
    projectPath: "项目路径",
    gitBranch: "Git 分支",
    gitCommit: "Git 提交",
    gitDirty: "工作区",
    dirty: "有改动",
    clean: "干净",
    activeChanges: "当前改动",
    recentCommits: "最近提交",
    keyFiles: "关键文件",
    topLevel: "顶层结构",
    workflowFiles: "工作流文件",
    handoffSummary: "交接摘要",
    verification: "验证",
    noActiveChanges: "没有已跟踪改动",
    type: "类型",
    worker: "Worker",
    claimed: "负责人",
    retry: "重试",
    handoff: "交接",
    evidence: "证据",
    taskTracker: "任务追踪",
    statusNodes: "状态节点",
    workItems: "工作项",
    changedFiles: "变更文件",
    changeSummary: "改动说明",
    tokenUsage: "Token 消耗",
    tokenTotal: "总 token",
    tokenRecorded: "已记录节点",
    tokenMissing: "未记录 token 的节点",
    tokenCoverage: "Token 覆盖率",
    contextUsage: "上下文用量",
    contextCoverage: "上下文覆盖率",
    contextTotal: "估算上下文 token",
    contextMissing: "未记录上下文的节点",
    timeUsage: "时间",
    elapsed: "已用时",
    estimatedRemaining: "预计剩余",
    averageNodeTime: "平均节点耗时",
    template: "模板",
    templateId: "模板 ID",
    templateVersion: "模板版本",
    workflowTemplate: "工作流模板",
    scorecard: "Scorecard 验票",
    score: "得分",
    scorecardPassed: "通过检查",
    scorecardFailed: "失败检查",
    scorecardWarnings: "提醒",
    scorecardPending: "待观察检查",
    severity: "级别",
    profile: "配置",
    agent: "智能体",
    modelProfile: "模型配置",
    runtimeProfile: "运行配置",
    safetyProfile: "安全限位",
    safetyLimits: "安全限位",
    scorecardHelp: "Scorecard 会检查真实 workflow 证据，而不是相信口头完成声明。",
    startedAt: "开始",
    completedAt: "完成",
    duration: "耗时",
    eta: "预计完成",
    modelTier: "模型档位",
    modelSelection: "模型选择",
    complexity: "复杂度",
    assignment: "分工",
    role: "角色",
    scope: "范围",
    parallelGroups: "并行组",
    agentActivity: "子智能体活动",
    agentPolicy: "智能体策略",
    actualWork: "实际完成",
    nodeContract: "节点合同",
    timeline: "时间线",
    timelineHelp: "最近事件是启动、完成、打回和阻塞的审计轨迹。",
    flowHelp: "流程地图展示依赖顺序和打回路径；节点详情里可以查看具体任务。",
    collaborationHelp: "协作泳道按角色和模型档位分组，只展示协作记录，不代表自动调度。",
    improvementPlan: "整改建议",
    noRecommendations: "当前看板数据没有发现需要处理的问题。",
    actionHint: "处理",
    inspectNode: "查看节点",
    openDetails: "打开详情",
    technicalData: "技术数据",
    rawProjection: "原始看板投影",
    statusBreakdown: "状态分布",
    claimedBy: "认领人",
    noClaims: "没有已认领的进行中节点",
    noLeases: "没有有效租约",
    noWorkItems: "未记录工作项",
    noChangedFiles: "未记录变更文件",
    noAgentActivity: "未记录子智能体活动",
    notRecorded: "未记录",
    exists: "存在",
    missingPath: "缺失",
    source: "来源",
    files: "文件",
    checks: "检查",
    work: "工作项",
    agents: "智能体",
    tokens: "tokens",
    unclaimed: "未认领",
    missing: "缺失",
    deliveryComplete: "交付已完成，或没有就绪节点。",
    resolveFailed: "处理或打回",
    unblock: "解除阻塞",
    recordBlocker: "或记录阻塞 handoff。",
    start: "启动",
    completeHandoff: "完成",
    withHandoff: "并提交结构化 handoff。",
  },
};
const DEFAULT_NODE_TRANSLATIONS = {
  "zh-CN": {
    intake: {
      title: "需求接收",
      objective: "固化用户目标、约束、交付物、语言和成功标准。",
      acceptance: ["目标、约束、交付物、语言和成功标准已经明确。"],
    },
    design: {
      title: "方案设计",
      objective: "确定方案、边界、风险和验证策略。",
      acceptance: ["方案、边界、风险和验证策略已经清楚。"],
    },
    plan: {
      title: "执行计划",
      objective: "把已接受的方案拆成小的实现和验证步骤。",
      acceptance: ["执行步骤有顺序、有边界，并且每一步都可验证。"],
    },
    implement: {
      title: "实现",
      objective: "应用限定范围内的变更并收集聚焦证据。",
      acceptance: ["请求的交付物变更已实现，并且范围受控。"],
    },
    verify: {
      title: "验证",
      objective: "运行相关检查并记录通过、失败、跳过或剩余风险。",
      acceptance: ["相关检查已通过，或剩余风险已明确记录。"],
    },
    delivery: {
      title: "交付",
      objective: "汇总最终证据并明确完成状态。",
      acceptance: ["最终交付包含证据、跳过的检查、风险和后续步骤。"],
    },
  },
};

function now() {
  return new Date().toISOString();
}

function dateStamp() {
  return now().slice(0, 10);
}

function workflowsRoot(cwd = process.cwd()) {
  return path.join(cwd, ".omykit", "workflows");
}

function slugify(value) {
  const slug = String(value || "workflow")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "workflow";
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readJsonIfExists(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return readJson(file);
  } catch {
    return null;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function templatesRoot() {
  return process.env.OMYKIT_TEMPLATES_DIR || path.join(PACKAGE_ROOT, "workflow-templates");
}

function stripYamlComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if ((char === '"' || char === "'") && line[i - 1] !== "\\") {
      quote = quote === char ? null : quote || char;
      continue;
    }
    if (char === "#" && !quote && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i).trimEnd();
    }
  }
  return line.trimEnd();
}

function splitYamlKeyValue(content, file, line) {
  const index = content.indexOf(":");
  if (index === -1) throw new Error(`${file}:${line} expected key: value`);
  const key = content.slice(0, index).trim();
  if (!key) throw new Error(`${file}:${line} empty key`);
  return [key, content.slice(index + 1).trim()];
}

function parseYamlScalar(raw) {
  const value = raw.trim();
  if (value === "") return "";
  if (value === "[]") return [];
  if (value === "{}") return {};
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    const body = value.slice(1, -1);
    return value.startsWith('"') ? body.replace(/\\"/g, '"').replace(/\\n/g, "\n") : body.replace(/''/g, "'");
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function parseYamlSubset(text, file = "yaml") {
  const records = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    if (/^\s*$/.test(raw)) continue;
    if (/^\s*#/.test(raw)) continue;
    const indent = raw.match(/^ */)[0].length;
    const content = stripYamlComment(raw.slice(indent));
    if (!content) continue;
    records.push({ indent, content, line: i + 1 });
  }

  function parseBlock(index, indent) {
    if (index >= records.length || records[index].indent < indent) return [{}, index];
    if (records[index].indent > indent) {
      throw new Error(`${file}:${records[index].line} unexpected indentation`);
    }
    return records[index].content.startsWith("- ")
      ? parseArray(index, indent)
      : parseObject(index, indent);
  }

  function parseObject(index, indent) {
    const object = {};
    let cursor = index;
    while (cursor < records.length) {
      const record = records[cursor];
      if (record.indent < indent) break;
      if (record.indent > indent) throw new Error(`${file}:${record.line} unexpected indentation`);
      if (record.content.startsWith("- ")) break;
      const [key, rest] = splitYamlKeyValue(record.content, file, record.line);
      if (rest === "") {
        const [value, next] = parseBlock(cursor + 1, indent + 2);
        object[key] = value;
        cursor = next;
      } else {
        object[key] = parseYamlScalar(rest);
        cursor += 1;
      }
    }
    return [object, cursor];
  }

  function parseArray(index, indent) {
    const array = [];
    let cursor = index;
    while (cursor < records.length) {
      const record = records[cursor];
      if (record.indent < indent) break;
      if (record.indent > indent) throw new Error(`${file}:${record.line} unexpected indentation`);
      if (!record.content.startsWith("- ")) break;
      const itemText = record.content.slice(2).trim();
      if (itemText === "") {
        const [value, next] = parseBlock(cursor + 1, indent + 2);
        array.push(value);
        cursor = next;
        continue;
      }
      if (/^[A-Za-z0-9_.-]+:\s*/.test(itemText)) {
        const [key, rest] = splitYamlKeyValue(itemText, file, record.line);
        const item = {};
        if (rest === "") {
          const [value, next] = parseBlock(cursor + 1, indent + 2);
          item[key] = value;
          cursor = next;
        } else {
          item[key] = parseYamlScalar(rest);
          cursor += 1;
        }
        if (cursor < records.length && records[cursor].indent > indent) {
          const [tail, next] = parseBlock(cursor, indent + 2);
          if (!tail || typeof tail !== "object" || Array.isArray(tail)) {
            throw new Error(`${file}:${records[cursor].line} array item continuation must be an object`);
          }
          Object.assign(item, tail);
          cursor = next;
        }
        array.push(item);
      } else {
        array.push(parseYamlScalar(itemText));
        cursor += 1;
      }
    }
    return [array, cursor];
  }

  if (records.length === 0) return {};
  const [value, next] = parseBlock(0, records[0].indent);
  if (next < records.length) throw new Error(`${file}:${records[next].line} could not parse remaining content`);
  return value;
}

function readYaml(file) {
  return parseYamlSubset(fs.readFileSync(file, "utf8"), file);
}

function isI18nObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    && (Object.prototype.hasOwnProperty.call(value, "en") || Object.prototype.hasOwnProperty.call(value, "zh-CN"));
}

function localizedValue(value, language = "en", fallback = "en") {
  if (isI18nObject(value)) {
    if (value[language] !== undefined) return value[language];
    if (value[fallback] !== undefined) return value[fallback];
    const first = Object.values(value).find((item) => item !== undefined && item !== null);
    return first ?? "";
  }
  return value;
}

function asStringArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (value === undefined || value === null || value === "") return [];
  return [String(value)];
}

function inferLanguageFromText(value) {
  return /[\u3400-\u9fff]/.test(String(value || "")) ? "zh-CN" : "en";
}

function templateFiles() {
  const root = templatesRoot();
  const dir = path.join(root, "templates");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((entry) => entry.endsWith(".yaml") || entry.endsWith(".yml"))
    .sort()
    .map((entry) => path.join(dir, entry));
}

function loadWorkflowTemplate(templateId = DEFAULT_TEMPLATE_ID) {
  const id = String(templateId || DEFAULT_TEMPLATE_ID);
  const candidate = path.isAbsolute(id)
    ? id
    : path.join(templatesRoot(), "templates", `${id}.yaml`);
  if (!fs.existsSync(candidate)) {
    throw new Error(`Cannot find workflow template: ${id}`);
  }
  const template = readYaml(candidate);
  return { ...template, __file: candidate };
}

function listWorkflowTemplates() {
  return templateFiles().map((file) => ({
    ...readYaml(file),
    __file: file,
  }));
}

function scorecardFile(scorecardId) {
  return path.join(templatesRoot(), "common", "scorecards", `${scorecardId}.yaml`);
}

function loadScorecardDefinition(scorecardId) {
  const file = scorecardFile(scorecardId);
  if (!fs.existsSync(file)) throw new Error(`Cannot find scorecard: ${scorecardId}`);
  const scorecard = readYaml(file);
  return { ...scorecard, __file: file };
}

function loadScorecardsForGraph(graph) {
  const ids = graph.metadata?.scorecards || graph.metadata?.layers?.scorecards || [];
  return asStringArray(ids).map((id) => loadScorecardDefinition(id));
}

function validateCommonLayerReference(kind, id, errors, label) {
  if (!id) return;
  const fileByKind = {
    agents: "agents.yaml",
    model_profile: "model-profiles.yaml",
    runtime_profile: "runtime-profiles.yaml",
    safety_limits: "safety-limits.yaml",
  };
  const fileName = fileByKind[kind];
  if (!fileName) return;
  const file = path.join(templatesRoot(), "common", fileName);
  if (!fs.existsSync(file)) {
    errors.push(`${label}: missing common layer file ${fileName}`);
    return;
  }
  const doc = readYaml(file);
  const collections = {
    agents: "agent_sets",
    model_profile: "model_profiles",
    runtime_profile: "runtime_profiles",
    safety_limits: "safety_limits",
  };
  const entries = doc[collections[kind]];
  if (!Array.isArray(entries) || !entries.some((entry) => entry.id === id)) {
    errors.push(`${label}: missing ${kind} reference ${id}`);
  }
}

function compileTemplateNode(rawNode, language) {
  const titleI18n = isI18nObject(rawNode.title) ? rawNode.title : null;
  const objectiveI18n = isI18nObject(rawNode.objective) ? rawNode.objective : null;
  const acceptanceI18n = isI18nObject(rawNode.acceptance) ? rawNode.acceptance : null;
  const title = String(localizedValue(rawNode.title, language) || rawNode.id || "Untitled");
  const objective = String(localizedValue(rawNode.objective, language) || "");
  const acceptance = asStringArray(localizedValue(rawNode.acceptance, language));
  const node = {
    id: String(rawNode.id || ""),
    type: String(rawNode.type || ""),
    title,
    depends_on: Array.isArray(rawNode.depends_on) ? rawNode.depends_on.map(String) : [],
    required: rawNode.required !== false,
    retry_limit: Number.isInteger(rawNode.retry_limit) ? rawNode.retry_limit : 1,
    context_level: rawNode.context_level || "focus",
    owner: rawNode.owner || "codex",
    worker_profile: rawNode.worker_profile || rawNode.agent || null,
    claimed_by: rawNode.claimed_by ?? null,
    parallel_group: rawNode.parallel_group || null,
    join_policy: rawNode.join_policy || "all_required",
    lease_expires_at: rawNode.lease_expires_at ?? null,
    handoff_target: rawNode.handoff_target ?? null,
    acceptance,
  };
  const optionalFields = [
    "language",
    "task_complexity",
    "model_tier",
    "model_selection_reason",
    "estimated_minutes",
    "agent",
    "model_profile",
    "runtime_profile",
    "safety_profile",
    "scorecard",
  ];
  for (const field of optionalFields) {
    if (rawNode[field] !== undefined) node[field] = rawNode[field];
  }
  if (objective) node.objective = objective;
  if (titleI18n) node.title_i18n = titleI18n;
  if (objectiveI18n) node.objective_i18n = objectiveI18n;
  if (acceptanceI18n) node.acceptance_i18n = acceptanceI18n;
  if (Array.isArray(rawNode.allowed_outputs)) node.allowed_outputs = rawNode.allowed_outputs.map(String);
  return node;
}

function compileTemplateToGraph(template, input) {
  const language = input.language || "en";
  const mode = input.mode || template.default_mode || DEFAULT_MODE;
  const layers = template.layers && typeof template.layers === "object" ? template.layers : {};
  const nodes = (template.nodes || []).map((node) => compileTemplateNode(node, language));
  return {
    schema_version: SCHEMA_VERSION,
    workflow_id: input.workflowId,
    title: input.title,
    mode,
    created_at: now(),
    metadata: {
      controller: "omykit-workflow",
      language,
      template_id: template.template_id || input.templateId || DEFAULT_TEMPLATE_ID,
      template_version: template.template_version || null,
      template_name: localizedValue(template.name, language) || template.template_id || input.templateId || DEFAULT_TEMPLATE_ID,
      template_description: localizedValue(template.description, language) || null,
      template_file: template.__file || null,
      layers,
      scorecards: asStringArray(layers.scorecards),
    },
    nodes,
  };
}

function validateScorecardDefinition(scorecard) {
  const errors = [];
  if (scorecard.schema_version !== SCHEMA_VERSION) errors.push(`${scorecard.__file || "scorecard"}: schema_version must be 1`);
  if (!scorecard.scorecard_id) errors.push(`${scorecard.__file || "scorecard"}: scorecard_id is required`);
  if (!Array.isArray(scorecard.checks) || scorecard.checks.length === 0) {
    errors.push(`${scorecard.__file || "scorecard"}: checks must be a non-empty array`);
    return errors;
  }
  const seen = new Set();
  for (const check of scorecard.checks) {
    if (!check.id) errors.push(`${scorecard.scorecard_id}: check.id is required`);
    if (check.id && seen.has(check.id)) errors.push(`${scorecard.scorecard_id}: duplicate check ${check.id}`);
    if (check.id) seen.add(check.id);
    if (!SCORECARD_SEVERITIES.has(check.severity || "recommended")) {
      errors.push(`${scorecard.scorecard_id}.${check.id}: severity must be required or recommended`);
    }
    if (!check.evidence || !check.evidence.type) {
      errors.push(`${scorecard.scorecard_id}.${check.id}: evidence.type is required`);
    }
  }
  return errors;
}

function validateWorkflowTemplate(template) {
  const errors = [];
  const label = template.__file || template.template_id || "template";
  if (template.schema_version !== SCHEMA_VERSION) errors.push(`${label}: schema_version must be 1`);
  if (!template.template_id) errors.push(`${label}: template_id is required`);
  if (!template.template_version) errors.push(`${label}: template_version is required`);
  if (!template.name) errors.push(`${label}: name is required`);
  if (!Array.isArray(template.nodes) || template.nodes.length === 0) {
    errors.push(`${label}: nodes must be a non-empty array`);
    return errors;
  }
  const layers = template.layers && typeof template.layers === "object" ? template.layers : {};
  validateCommonLayerReference("agents", layers.agents, errors, label);
  validateCommonLayerReference("model_profile", layers.model_profile, errors, label);
  validateCommonLayerReference("runtime_profile", layers.runtime_profile, errors, label);
  validateCommonLayerReference("safety_limits", layers.safety_limits, errors, label);
  for (const id of asStringArray(layers.scorecards)) {
    try {
      errors.push(...validateScorecardDefinition(loadScorecardDefinition(id)));
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
    }
  }
  try {
    const graph = compileTemplateToGraph(template, {
      title: "Template validation",
      workflowId: "template-validation",
      mode: template.default_mode || DEFAULT_MODE,
      language: "en",
      templateId: template.template_id,
    });
    errors.push(...validateGraph(graph).map((error) => `${label}: ${error}`));
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
  }
  return errors;
}

function appendText(file, text) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, text);
}

function appendLedger(workflowDir, event) {
  appendText(path.join(workflowDir, "ledger.jsonl"), `${JSON.stringify({ at: now(), ...event })}\n`);
}

function parseArgs(argv) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      options[key] = next;
      i += 1;
    } else {
      options[key] = true;
    }
  }
  return { positional, options };
}

function commandHelp() {
  return `Usage:
  node scripts/omykit-workflow.mjs init "feature title" [--id workflow-id] [--mode Standard] [--template change.standard] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs templates [list|validate|show <template-id>] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs status [--workflow workflow-id]
  node scripts/omykit-workflow.mjs next [--workflow workflow-id]
  node scripts/omykit-workflow.mjs validate [--workflow workflow-id]
  node scripts/omykit-workflow.mjs scorecard [--workflow workflow-id] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs start <node-id> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs complete <node-id> --handoff <path> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs reject <node-id> --to <node-id> --handoff <path> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs block <node-id> --reason <text> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs board [--workflow workflow-id] [--open] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs resume [--workflow workflow-id]`;
}

function listWorkflowDirs(root = workflowsRoot()) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, "graph.json")))
    .sort();
}

function resolveWorkflowDir(options = {}) {
  const root = workflowsRoot();
  if (options.workflow) {
    const workflowDir = path.join(root, String(options.workflow));
    if (!fs.existsSync(workflowDir)) {
      throw new Error(`Cannot find workflow: ${options.workflow}`);
    }
    return workflowDir;
  }

  const dirs = listWorkflowDirs(root);
  if (dirs.length === 0) {
    throw new Error("No omyKit workflow found. Run init first.");
  }
  return dirs[dirs.length - 1];
}

function relativeToWorkflow(workflowDir, file) {
  const relative = path.relative(workflowDir, file);
  return relative.startsWith("..") ? file : relative;
}

function projectRootFromWorkflow(workflowDir) {
  return path.dirname(path.dirname(path.dirname(workflowDir)));
}

function loadWorkflow(workflowDir) {
  return {
    workflowDir,
    graph: readJson(path.join(workflowDir, "graph.json")),
    state: readJson(path.join(workflowDir, "state.json")),
  };
}

function nodeMap(graph) {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

function stateEntry(status, reason = null, lastHandoff = null, extra = {}) {
  return {
    status,
    updated_at: now(),
    last_handoff: lastHandoff,
    reason,
    ...extra,
  };
}

function defaultGraphNodes() {
  return [
    {
      id: "01-intake",
      type: "intake",
      title: "Intake",
      depends_on: [],
      required: true,
      retry_limit: 1,
      context_level: "scan",
      owner: "codex",
      worker_profile: "planner",
      claimed_by: null,
      parallel_group: "discovery",
      join_policy: "all_required",
      lease_expires_at: null,
      handoff_target: "02-design",
      acceptance: ["Goal, constraints, deliverable, language, and success criteria are explicit."],
    },
    {
      id: "02-design",
      type: "design",
      title: "Design",
      depends_on: ["01-intake"],
      required: true,
      retry_limit: 2,
      context_level: "focus",
      owner: "codex",
      worker_profile: "planner",
      claimed_by: null,
      parallel_group: "strategy",
      join_policy: "all_required",
      lease_expires_at: null,
      handoff_target: "03-plan",
      acceptance: ["Approach, boundaries, risks, and verification strategy are clear."],
    },
    {
      id: "03-plan",
      type: "plan",
      title: "Plan",
      depends_on: ["02-design"],
      required: true,
      retry_limit: 2,
      context_level: "focus",
      owner: "codex",
      worker_profile: "planner",
      claimed_by: null,
      parallel_group: "strategy",
      join_policy: "all_required",
      lease_expires_at: null,
      handoff_target: "04-implement",
      acceptance: ["Execution steps are ordered, scoped, and individually verifiable."],
    },
    {
      id: "04-implement",
      type: "implement",
      title: "Implement",
      depends_on: ["03-plan"],
      required: true,
      retry_limit: 3,
      context_level: "focus",
      owner: "codex",
      worker_profile: "coder",
      claimed_by: null,
      parallel_group: "implementation",
      join_policy: "all_required",
      lease_expires_at: null,
      handoff_target: "05-verify",
      acceptance: ["Requested artifact changes are implemented and scoped to the task."],
    },
    {
      id: "05-verify",
      type: "verify",
      title: "Verify",
      depends_on: ["04-implement"],
      required: true,
      retry_limit: 2,
      context_level: "focus",
      owner: "codex",
      worker_profile: "tester",
      claimed_by: null,
      parallel_group: "verification",
      join_policy: "all_required",
      lease_expires_at: null,
      handoff_target: "06-delivery",
      acceptance: ["Relevant checks have passed or residual risk is explicitly captured."],
    },
    {
      id: "06-delivery",
      type: "delivery",
      title: "Delivery",
      depends_on: ["05-verify"],
      required: true,
      retry_limit: 1,
      context_level: "focus",
      owner: "codex",
      worker_profile: "delivery",
      claimed_by: null,
      parallel_group: "delivery",
      join_policy: "manual_review",
      lease_expires_at: null,
      handoff_target: null,
      acceptance: ["Final handoff includes evidence, skipped checks, risks, and next steps."],
    },
  ];
}

function nodeObjective(node) {
  const objectives = {
    intake: "Capture the user goal, constraints, deliverable, language, and success criteria.",
    research: "Gather bounded evidence needed by later nodes without changing artifacts.",
    design: "Choose the approach, boundaries, risks, and verification strategy.",
    plan: "Break the accepted design into small implementation and verification steps.",
    implement: "Apply scoped changes and collect focused evidence.",
    verify: "Run relevant checks and report pass, fail, skip, or residual risk.",
    review: "Review quality, risks, and omissions before delivery.",
    delivery: "Package final evidence and make completion status explicit.",
    evolution: "Promote only reusable workflow lessons into omyKit.",
  };
  return objectives[node.type] || `Complete ${node.title}.`;
}

function defaultNodePolicy(node) {
  const byType = {
    intake: { task_complexity: "simple", model_tier: "fast", estimated_minutes: 10 },
    research: { task_complexity: "standard", model_tier: "standard", estimated_minutes: 25 },
    design: { task_complexity: "complex", model_tier: "frontier", estimated_minutes: 30 },
    plan: { task_complexity: "standard", model_tier: "standard", estimated_minutes: 20 },
    implement: { task_complexity: "complex", model_tier: "standard", estimated_minutes: 45 },
    verify: { task_complexity: "standard", model_tier: "standard", estimated_minutes: 25 },
    review: { task_complexity: "complex", model_tier: "frontier", estimated_minutes: 30 },
    delivery: { task_complexity: "simple", model_tier: "fast", estimated_minutes: 15 },
    evolution: { task_complexity: "complex", model_tier: "frontier", estimated_minutes: 30 },
  };
  const base = byType[node.type] || byType.plan;
  const complexity = node.task_complexity || base.task_complexity;
  const value = {
    ...base,
    task_complexity: complexity,
    model_tier: node.model_tier || modelTierForComplexity(complexity, base.model_tier),
  };
  return {
    ...value,
    model_selection_reason: modelSelectionReason(value.task_complexity, value.model_tier),
  };
}

function modelTierForComplexity(complexity, fallbackTier = "standard") {
  if (complexity === "expert") return "frontier";
  if (complexity === "simple") return "fast";
  if (complexity === "standard") return "standard";
  return fallbackTier;
}

function modelSelectionReason(complexity, tier) {
  if (tier === "fast") return "Clear, low-risk, bounded task; use the fastest capable model.";
  if (tier === "frontier") return "Requires architecture, design, review, or broad judgment; use the strongest available model.";
  return `Task complexity is ${complexity}; use a balanced model before escalating.`;
}

function nodeCard(graph, node) {
  const policy = defaultNodePolicy(node);
  const card = {
    schema_version: SCHEMA_VERSION,
    workflow_id: graph.workflow_id,
    node_id: node.id,
    type: node.type,
    title: node.title,
    objective: node.objective || nodeObjective(node),
    depends_on: node.depends_on,
    context_level: node.context_level || "focus",
    acceptance: node.acceptance,
    allowed_outputs: Array.isArray(node.allowed_outputs) && node.allowed_outputs.length > 0 ? node.allowed_outputs : [
      `handoffs/${node.id}.json`,
      `evidence/${node.id}-summary.txt`,
    ],
    handoff_required: true,
    task_complexity: node.task_complexity || policy.task_complexity,
    model_tier: node.model_tier || policy.model_tier,
    model_selection_reason: node.model_selection_reason || policy.model_selection_reason,
    estimated_minutes: Number.isFinite(node.estimated_minutes) ? node.estimated_minutes : policy.estimated_minutes,
  };
  for (const field of COLLABORATION_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(node, field)) card[field] = node[field];
  }
  return card;
}

function initialState(graph) {
  const entries = {};
  for (const node of graph.nodes) {
    entries[node.id] = stateEntry(node.depends_on.length === 0 ? "ready" : "pending");
  }
  return {
    schema_version: SCHEMA_VERSION,
    workflow_id: graph.workflow_id,
    updated_at: now(),
    active_node: null,
    active_nodes: [],
    nodes: entries,
    retry_edges: {},
  };
}

function validateI18nValue(value, label, errors) {
  if (value === undefined) return;
  if (!isI18nObject(value)) {
    errors.push(`${label} must be an object with en or zh-CN`);
    return;
  }
  for (const [language, localized] of Object.entries(value)) {
    if (!["en", "zh-CN"].includes(language)) errors.push(`${label}.${language} is not a supported language key`);
    if (Array.isArray(localized)) {
      for (const item of localized) {
        if (typeof item !== "string" || !item) errors.push(`${label}.${language} array entries must be non-empty strings`);
      }
    } else if (typeof localized !== "string" || !localized) {
      errors.push(`${label}.${language} must be a non-empty string or string array`);
    }
  }
}

function validateGraph(graph) {
  const errors = [];
  if (graph.schema_version !== SCHEMA_VERSION) errors.push("graph.schema_version must be 1");
  if (!graph.workflow_id) errors.push("graph.workflow_id is required");
  if (!graph.title) errors.push("graph.title is required");
  if (!MODES.has(graph.mode)) errors.push(`graph.mode must be one of ${[...MODES].join(", ")}`);
  if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) errors.push("graph.nodes must be a non-empty array");
  if (errors.length > 0) return errors;

  const seen = new Set();
  const map = nodeMap(graph);
  for (const node of graph.nodes) {
    if (!node.id) errors.push("node.id is required");
    if (seen.has(node.id)) errors.push(`duplicate node id: ${node.id}`);
    seen.add(node.id);
    if (!NODE_TYPES.has(node.type)) errors.push(`invalid node type for ${node.id}: ${node.type}`);
    if (!node.title) errors.push(`node.title is required for ${node.id}`);
    if (node.objective !== undefined && typeof node.objective !== "string") {
      errors.push(`node.objective must be string for ${node.id}`);
    }
    validateI18nValue(node.title_i18n, `node.title_i18n for ${node.id}`, errors);
    validateI18nValue(node.objective_i18n, `node.objective_i18n for ${node.id}`, errors);
    validateI18nValue(node.acceptance_i18n, `node.acceptance_i18n for ${node.id}`, errors);
    if (!Array.isArray(node.depends_on)) errors.push(`node.depends_on must be an array for ${node.id}`);
    if (typeof node.required !== "boolean") errors.push(`node.required must be boolean for ${node.id}`);
    if (!Number.isInteger(node.retry_limit) || node.retry_limit < 0) {
      errors.push(`node.retry_limit must be a non-negative integer for ${node.id}`);
    }
    if (!Array.isArray(node.acceptance) || node.acceptance.length === 0) {
      errors.push(`node.acceptance must be a non-empty array for ${node.id}`);
    }
    if (node.context_level && !CONTEXT_LEVELS.has(node.context_level)) {
      errors.push(`invalid context_level for ${node.id}: ${node.context_level}`);
    }
    for (const field of ["worker_profile", "parallel_group", "handoff_target"]) {
      if (node[field] !== undefined && node[field] !== null && typeof node[field] !== "string") {
        errors.push(`node.${field} must be string or null for ${node.id}`);
      }
    }
    for (const field of ["claimed_by", "lease_expires_at"]) {
      if (node[field] !== undefined && node[field] !== null && typeof node[field] !== "string") {
        errors.push(`node.${field} must be string or null for ${node.id}`);
      }
    }
    if (node.join_policy !== undefined && !JOIN_POLICIES.has(node.join_policy)) {
      errors.push(`invalid join_policy for ${node.id}: ${node.join_policy}`);
    }
    if (node.task_complexity !== undefined && !TASK_COMPLEXITIES.has(node.task_complexity)) {
      errors.push(`invalid task_complexity for ${node.id}: ${node.task_complexity}`);
    }
    if (node.model_tier !== undefined && !MODEL_TIERS.has(node.model_tier)) {
      errors.push(`invalid model_tier for ${node.id}: ${node.model_tier}`);
    }
    if (node.task_complexity === "expert" && node.model_tier !== undefined && node.model_tier !== "frontier") {
      errors.push(`node.model_tier must be frontier when task_complexity is expert for ${node.id}`);
    }
    if (node.language !== undefined && node.language !== null && typeof node.language !== "string") {
      errors.push(`node.language must be string or null for ${node.id}`);
    }
    if (node.model_selection_reason !== undefined && typeof node.model_selection_reason !== "string") {
      errors.push(`node.model_selection_reason must be string for ${node.id}`);
    }
    if (node.estimated_minutes !== undefined && (!Number.isFinite(node.estimated_minutes) || node.estimated_minutes < 0)) {
      errors.push(`node.estimated_minutes must be a non-negative number for ${node.id}`);
    }
    for (const field of ["agent", "model_profile", "runtime_profile", "safety_profile", "scorecard"]) {
      if (node[field] !== undefined && node[field] !== null && typeof node[field] !== "string") {
        errors.push(`node.${field} must be string or null for ${node.id}`);
      }
    }
    if (node.allowed_outputs !== undefined && (!Array.isArray(node.allowed_outputs) || node.allowed_outputs.some((item) => typeof item !== "string" || !item))) {
      errors.push(`node.allowed_outputs must be an array of non-empty strings for ${node.id}`);
    }
    for (const dependency of node.depends_on || []) {
      if (!map.has(dependency)) errors.push(`${node.id} depends on missing node ${dependency}`);
      if (dependency === node.id) errors.push(`${node.id} cannot depend on itself`);
    }
    if (node.handoff_target && !map.has(node.handoff_target)) {
      errors.push(`${node.id} handoff_target is missing node ${node.handoff_target}`);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(nodeId, trail) {
    if (visiting.has(nodeId)) {
      errors.push(`dependency cycle: ${[...trail, nodeId].join(" -> ")}`);
      return;
    }
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    const node = map.get(nodeId);
    for (const dependency of node?.depends_on || []) visit(dependency, [...trail, nodeId]);
    visiting.delete(nodeId);
    visited.add(nodeId);
  }
  for (const node of graph.nodes) visit(node.id, []);

  return errors;
}

function validateState(graph, state) {
  const errors = [];
  if (state.schema_version !== SCHEMA_VERSION) errors.push("state.schema_version must be 1");
  if (state.workflow_id !== graph.workflow_id) errors.push("state.workflow_id must match graph.workflow_id");
  if (!state.updated_at) errors.push("state.updated_at is required");
  if (!state.nodes || typeof state.nodes !== "object") errors.push("state.nodes is required");
  if (!state.retry_edges || typeof state.retry_edges !== "object") errors.push("state.retry_edges is required");
  if (errors.length > 0) return errors;

  const graphNodes = new Set(graph.nodes.map((node) => node.id));
  for (const node of graph.nodes) {
    const entry = state.nodes[node.id];
    if (!entry) {
      errors.push(`state missing node ${node.id}`);
      continue;
    }
    if (!STATUSES.has(entry.status)) errors.push(`invalid status for ${node.id}: ${entry.status}`);
    if (!entry.updated_at) errors.push(`state.nodes.${node.id}.updated_at is required`);
  }
  for (const nodeId of Object.keys(state.nodes)) {
    if (!graphNodes.has(nodeId)) errors.push(`state has extra node ${nodeId}`);
  }
  if (state.active_node !== null && !graphNodes.has(state.active_node)) {
    errors.push(`active_node does not exist: ${state.active_node}`);
  }
  if (state.active_nodes !== undefined) {
    if (!Array.isArray(state.active_nodes)) {
      errors.push("active_nodes must be an array when present");
    } else {
      for (const nodeId of state.active_nodes) {
        if (!graphNodes.has(nodeId)) errors.push(`active_nodes entry does not exist: ${nodeId}`);
      }
    }
  }
  return errors;
}

function validateNodeCards(workflowDir, graph) {
  const errors = [];
  for (const node of graph.nodes) {
    const cardPath = path.join(workflowDir, "nodes", `${node.id}.json`);
    if (!fs.existsSync(cardPath)) {
      errors.push(`missing node card: nodes/${node.id}.json`);
      continue;
    }
    let card;
    try {
      card = readJson(cardPath);
    } catch (error) {
      errors.push(`invalid node card JSON for ${node.id}: ${error.message}`);
      continue;
    }
    if (card.schema_version !== SCHEMA_VERSION) errors.push(`node card ${node.id} schema_version must be 1`);
    if (card.workflow_id !== graph.workflow_id) errors.push(`node card ${node.id} workflow_id mismatch`);
    if (card.node_id !== node.id) errors.push(`node card ${node.id} node_id mismatch`);
    if (card.type !== node.type) errors.push(`node card ${node.id} type mismatch`);
    if (!card.objective) errors.push(`node card ${node.id} objective is required`);
    if (card.objective !== undefined && typeof card.objective !== "string") {
      errors.push(`node card ${node.id} objective must be string`);
    }
    validateI18nValue(card.title_i18n, `node card ${node.id} title_i18n`, errors);
    validateI18nValue(card.objective_i18n, `node card ${node.id} objective_i18n`, errors);
    validateI18nValue(card.acceptance_i18n, `node card ${node.id} acceptance_i18n`, errors);
    if (!Array.isArray(card.acceptance) || card.acceptance.length === 0) {
      errors.push(`node card ${node.id} acceptance must be non-empty`);
    }
    if (!Array.isArray(card.allowed_outputs) || card.allowed_outputs.length === 0) {
      errors.push(`node card ${node.id} allowed_outputs must be non-empty`);
    }
    if (card.task_complexity !== undefined && !TASK_COMPLEXITIES.has(card.task_complexity)) {
      errors.push(`node card ${node.id} task_complexity is invalid`);
    }
    if (card.model_tier !== undefined && !MODEL_TIERS.has(card.model_tier)) {
      errors.push(`node card ${node.id} model_tier is invalid`);
    }
    if (card.task_complexity === "expert" && card.model_tier !== undefined && card.model_tier !== "frontier") {
      errors.push(`node card ${node.id} model_tier must be frontier when task_complexity is expert`);
    }
    if (card.language !== undefined && card.language !== null && typeof card.language !== "string") {
      errors.push(`node card ${node.id} language must be string or null`);
    }
    if (card.model_selection_reason !== undefined && typeof card.model_selection_reason !== "string") {
      errors.push(`node card ${node.id} model_selection_reason must be string`);
    }
    if (card.estimated_minutes !== undefined && (!Number.isFinite(card.estimated_minutes) || card.estimated_minutes < 0)) {
      errors.push(`node card ${node.id} estimated_minutes must be non-negative number`);
    }
    for (const field of ["agent", "model_profile", "runtime_profile", "safety_profile", "scorecard"]) {
      if (card[field] !== undefined && card[field] !== null && typeof card[field] !== "string") {
        errors.push(`node card ${node.id} ${field} must be string or null`);
      }
    }
  }
  return errors;
}

function validateTokenUsageShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${label} must be an object`];
  }
  if (!value.source || typeof value.source !== "string") {
    errors.push(`${label}.source is required`);
  }
  for (const field of ["input_tokens", "output_tokens", "reasoning_tokens", "cached_tokens", "total_tokens"]) {
    if (value[field] !== undefined && (!Number.isInteger(value[field]) || value[field] < 0)) {
      errors.push(`${label}.${field} must be a non-negative integer`);
    }
  }
  return errors;
}

function validateContextUsageShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${label} must be an object`];
  }
  if (!value.source || typeof value.source !== "string") {
    errors.push(`${label}.source is required`);
  }
  if (value.context_level !== undefined && !CONTEXT_LEVELS.has(value.context_level)) {
    errors.push(`${label}.context_level must be one of ${[...CONTEXT_LEVELS].join(", ")}`);
  }
  for (const field of ["source_bytes", "estimated_tokens", "input_files"]) {
    if (value[field] !== undefined && (!Number.isInteger(value[field]) || value[field] < 0)) {
      errors.push(`${label}.${field} must be a non-negative integer`);
    }
  }
  return errors;
}

function validateTimingShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${label} must be an object`];
  }
  if (value.duration_ms !== undefined && (!Number.isInteger(value.duration_ms) || value.duration_ms < 0)) {
    errors.push(`${label}.duration_ms must be a non-negative integer`);
  }
  if (value.estimated_minutes !== undefined && (!Number.isFinite(value.estimated_minutes) || value.estimated_minutes < 0)) {
    errors.push(`${label}.estimated_minutes must be a non-negative number`);
  }
  return errors;
}

function validateTaskTrackingFields(handoff) {
  const errors = [];
  if (handoff.language !== undefined && typeof handoff.language !== "string") {
    errors.push("handoff.language must be a string");
  }
  errors.push(...validateContextUsageShape(handoff.context_usage, "handoff.context_usage"));
  errors.push(...validateTimingShape(handoff.timing, "handoff.timing"));
  if (handoff.work_items !== undefined) {
    if (!Array.isArray(handoff.work_items)) {
      errors.push("handoff.work_items must be an array");
    } else {
      handoff.work_items.forEach((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          errors.push(`handoff.work_items[${index}] must be an object`);
          return;
        }
        if (!item.title) errors.push(`handoff.work_items[${index}].title is required`);
        if (!item.status) errors.push(`handoff.work_items[${index}].status is required`);
      });
    }
  }
  if (handoff.changed_files !== undefined) {
    if (!Array.isArray(handoff.changed_files)) {
      errors.push("handoff.changed_files must be an array");
    } else {
      handoff.changed_files.forEach((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          errors.push(`handoff.changed_files[${index}] must be an object`);
          return;
        }
        if (!item.path) errors.push(`handoff.changed_files[${index}].path is required`);
      });
    }
  }
  errors.push(...validateTokenUsageShape(handoff.token_usage, "handoff.token_usage"));
  if (handoff.agent_activity !== undefined) {
    if (!Array.isArray(handoff.agent_activity)) {
      errors.push("handoff.agent_activity must be an array");
    } else {
      const agentIds = new Set();
      handoff.agent_activity.forEach((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          errors.push(`handoff.agent_activity[${index}] must be an object`);
          return;
        }
        if (!item.agent_id) errors.push(`handoff.agent_activity[${index}].agent_id is required`);
        if (item.agent_id && !AGENT_ID_PATTERN.test(item.agent_id)) {
          errors.push(`handoff.agent_activity[${index}].agent_id must use lowercase letters, digits, dot, colon, underscore, or hyphen`);
        }
        if (item.agent_id) {
          if (agentIds.has(item.agent_id)) errors.push(`handoff.agent_activity[${index}].agent_id duplicates another agent`);
          agentIds.add(item.agent_id);
        }
        if (!item.role) errors.push(`handoff.agent_activity[${index}].role is required`);
        if (!item.scope) errors.push(`handoff.agent_activity[${index}].scope is required`);
        if (!item.task) errors.push(`handoff.agent_activity[${index}].task is required`);
        if (!item.status) errors.push(`handoff.agent_activity[${index}].status is required`);
        if (item.model_tier !== undefined && !MODEL_TIERS.has(item.model_tier)) {
          errors.push(`handoff.agent_activity[${index}].model_tier must be one of ${[...MODEL_TIERS].join(", ")}`);
        }
        errors.push(...validateTokenUsageShape(item.token_usage, `handoff.agent_activity[${index}].token_usage`));
        errors.push(...validateContextUsageShape(item.context_usage, `handoff.agent_activity[${index}].context_usage`));
      });
    }
  }
  return errors;
}

function validateHandoff(graph, handoff) {
  const errors = [];
  const map = nodeMap(graph);
  if (handoff.workflow_id !== graph.workflow_id) errors.push("handoff.workflow_id must match graph.workflow_id");
  if (!map.has(handoff.node_id)) errors.push(`handoff node does not exist: ${handoff.node_id}`);
  if (!HANDOFF_STATUSES.has(handoff.status)) errors.push(`invalid handoff status: ${handoff.status}`);
  if (!handoff.summary) errors.push("handoff.summary is required");
  errors.push(...validateTaskTrackingFields(handoff));

  if (handoff.status === "passed") {
    if (!Array.isArray(handoff.outputs)) errors.push("passed handoff requires outputs array");
    if (!Array.isArray(handoff.verification)) errors.push("passed handoff requires verification array");
    for (const item of handoff.verification || []) {
      if (!item.command) errors.push("verification item requires command");
      if (!["passed", "failed", "skipped"].includes(item.result)) {
        errors.push(`verification result must be passed, failed, or skipped: ${item.result}`);
      }
    }
  }
  if (handoff.status === "failed") {
    if (!handoff.reject_to) errors.push("failed handoff requires reject_to");
    if (handoff.reject_to && !map.has(handoff.reject_to)) {
      errors.push(`reject_to node does not exist: ${handoff.reject_to}`);
    }
    if (!handoff.reason) errors.push("failed handoff requires reason");
    if (!Array.isArray(handoff.evidence) || handoff.evidence.length === 0) {
      errors.push("failed handoff requires evidence array");
    }
    if (!handoff.required_fix) errors.push("failed handoff requires required_fix");
  }
  if (handoff.status === "blocked") {
    if (!handoff.blocker_type) errors.push("blocked handoff requires blocker_type");
    if (!handoff.blocked_scope) errors.push("blocked handoff requires blocked_scope");
  }
  if (handoff.status === "skipped" && !handoff.reason) {
    errors.push("skipped handoff requires reason");
  }
  return errors;
}

function validateHandoffFiles(workflowDir, graph) {
  const errors = [];
  const handoffDir = path.join(workflowDir, "handoffs");
  if (!fs.existsSync(handoffDir)) return errors;
  for (const entry of fs.readdirSync(handoffDir)) {
    if (!entry.endsWith(".json")) continue;
    const file = path.join(handoffDir, entry);
    try {
      errors.push(...validateHandoff(graph, readJson(file)).map((error) => `handoffs/${entry}: ${error}`));
    } catch (error) {
      errors.push(`handoffs/${entry}: invalid JSON: ${error.message}`);
    }
  }
  return errors;
}

function validateWorkflow(workflowDir) {
  const errors = [];
  for (const file of ["graph.json", "state.json", "ledger.jsonl", "decisions.md", "blockers.md"]) {
    if (!fs.existsSync(path.join(workflowDir, file))) errors.push(`missing ${file}`);
  }
  if (errors.length > 0) return errors;

  let graph;
  let state;
  try {
    graph = readJson(path.join(workflowDir, "graph.json"));
  } catch (error) {
    errors.push(`invalid graph.json: ${error.message}`);
    return errors;
  }
  try {
    state = readJson(path.join(workflowDir, "state.json"));
  } catch (error) {
    errors.push(`invalid state.json: ${error.message}`);
    return errors;
  }

  errors.push(...validateGraph(graph));
  if (errors.length === 0) {
    errors.push(...validateState(graph, state));
    errors.push(...validateNodeCards(workflowDir, graph));
    errors.push(...validateHandoffFiles(workflowDir, graph));
  }
  return errors;
}

function saveState(workflowDir, state) {
  state.updated_at = now();
  writeJson(path.join(workflowDir, "state.json"), state);
}

function activeNodes(state) {
  return Array.isArray(state.active_nodes) ? state.active_nodes : state.active_node ? [state.active_node] : [];
}

function markActive(state, nodeId) {
  const active = new Set(activeNodes(state));
  active.add(nodeId);
  state.active_nodes = [...active];
  state.active_node = nodeId;
}

function clearActive(state, ...nodeIds) {
  const remove = new Set(nodeIds.filter(Boolean));
  state.active_nodes = activeNodes(state).filter((nodeId) => !remove.has(nodeId));
  if (remove.has(state.active_node)) {
    state.active_node = state.active_nodes[state.active_nodes.length - 1] || null;
  }
}

function dependenciesSatisfied(node, state) {
  return node.depends_on.every((dependency) => TERMINAL_STATUSES.has(state.nodes[dependency]?.status));
}

function recalculateReady(graph, state) {
  for (const node of graph.nodes) {
    const entry = state.nodes[node.id];
    if (entry.status === "pending" && dependenciesSatisfied(node, state)) {
      state.nodes[node.id] = stateEntry("ready", "Dependencies satisfied", entry.last_handoff || null);
    }
  }
}

function readyNodes(graph, state) {
  return graph.nodes.filter((node) => state.nodes[node.id]?.status === "ready");
}

function nodesWithStatus(graph, state, status) {
  return graph.nodes.filter((node) => state.nodes[node.id]?.status === status);
}

function formatNode(node) {
  return `${node.id} ${node.type} - ${node.title}`;
}

function formatNodeList(nodes) {
  return nodes.length > 0 ? nodes.map(formatNode).join(", ") : "none";
}

function printStatus(graph, state) {
  const ready = readyNodes(graph, state);
  const running = nodesWithStatus(graph, state, "running");
  const blocked = nodesWithStatus(graph, state, "blocked");
  const failed = nodesWithStatus(graph, state, "failed");
  const passed = nodesWithStatus(graph, state, "passed");
  const skipped = nodesWithStatus(graph, state, "skipped");
  const action =
    failed.length > 0
      ? `resolve or reject from ${failed[0].id}`
      : blocked.length > 0 && ready.length === 0
        ? `unblock ${blocked[0].id}`
        : ready.length > 0
          ? `start ${ready[0].id}`
          : running.length > 0
            ? `complete ${running[0].id} with a handoff`
            : "delivery complete or no ready nodes";

  console.log(`Workflow: ${graph.workflow_id} (${graph.mode})`);
  console.log(`Ready nodes: ${formatNodeList(ready)}`);
  console.log(`Running nodes: ${formatNodeList(running)}`);
  console.log(`Blocked nodes: ${formatNodeList(blocked)}`);
  console.log(`Failed nodes: ${formatNodeList(failed)}`);
  console.log(`Passed nodes: ${passed.length}`);
  console.log(`Skipped nodes: ${skipped.length}`);
  console.log(`Next recommended action: ${action}`);
  console.log("Required evidence: structured handoff JSON for each completed, failed, blocked, or skipped node.");
}

function readRecentLedger(workflowDir, limit = 3) {
  const file = path.join(workflowDir, "ledger.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .slice(-limit);
}

function readTextIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function runOptional(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function parseGitStatus(output) {
  if (!output) return [];
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const normalized = line[2] === " " ? line : ` ${line}`;
      return {
        status: normalized.slice(0, 2).trim() || "modified",
        path: normalized.slice(3).trim(),
      };
    });
}

function firstMarkdownHeading(file) {
  const text = readTextIfExists(file);
  const heading = text.split(/\r?\n/).find((line) => /^#\s+/.test(line));
  return heading ? heading.replace(/^#\s+/, "").trim() : null;
}

function listExistingFiles(root, candidates) {
  return candidates
    .filter((candidate) => fs.existsSync(path.join(root, candidate)))
    .map((candidate) => {
      const absolute = path.join(root, candidate);
      return { path: candidate, type: fs.statSync(absolute).isDirectory() ? "dir" : "file" };
    });
}

function topLevelEntries(root, limit = 24) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => ![".git", ".omykit", "node_modules", ".venv", "dist", "build", "coverage"].includes(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((entry) => ({ name: entry.name, type: entry.isDirectory() ? "dir" : "file" }));
}

function buildProjectSnapshot(workflowDir, graph) {
  const root = projectRootFromWorkflow(workflowDir);
  const packageJson = readJsonIfExists(path.join(root, "package.json"));
  const status = parseGitStatus(runOptional("git", ["status", "--short"], root));
  const recentCommits = (runOptional("git", ["log", "--oneline", "-5"], root) || "")
    .split(/\r?\n/)
    .filter(Boolean);

  return {
    name: packageJson?.name || firstMarkdownHeading(path.join(root, "README.md")) || path.basename(root),
    description: packageJson?.description || null,
    root,
    relative_workflow_dir: path.relative(root, workflowDir),
    workflow_id: graph.workflow_id,
    workflow_title: graph.title,
    git: {
      branch: runOptional("git", ["rev-parse", "--abbrev-ref", "HEAD"], root),
      commit: runOptional("git", ["rev-parse", "--short", "HEAD"], root),
      remote: runOptional("git", ["config", "--get", "remote.origin.url"], root),
      dirty: status.length > 0,
      status,
      recent_commits: recentCommits,
    },
    key_files: listExistingFiles(root, [
      "AGENTS.md",
      "README.md",
      "README.zh-CN.md",
      "CHANGELOG.md",
      "VERSION",
      "package.json",
      "pnpm-lock.yaml",
      "package-lock.json",
      "pyproject.toml",
      "Cargo.toml",
      "go.mod",
      "docs",
      "skills",
      "scripts",
      "schemas",
    ]),
    top_level: topLevelEntries(root),
  };
}

function readMarkdownItems(file, limit = 8) {
  return readTextIfExists(file)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !/^Workflow:/i.test(line))
    .slice(-limit);
}

function normalizeBoardLanguage(value) {
  const language = String(value || "en").toLowerCase();
  if (["zh", "zh-cn", "cn", "chinese", "中文", "简体中文"].includes(language)) return "zh-CN";
  return "en";
}

function resolveWorkflowLanguage(options, graph, handoffs = null) {
  if (options?.lang) return normalizeBoardLanguage(options.lang);
  if (graph?.metadata?.language) return normalizeBoardLanguage(graph.metadata.language);
  if (graph?.language) return normalizeBoardLanguage(graph.language);
  const records = handoffs?.records || [];
  const latestLanguage = [...records].reverse().find((record) => record.language)?.language;
  if (latestLanguage) return normalizeBoardLanguage(latestLanguage);
  return inferLanguageFromText(graph?.title);
}

function boardText(language) {
  return BOARD_LABELS[language] || BOARD_LABELS.en;
}

function readLedgerEvents(workflowDir, limit = 10) {
  return readRecentLedger(workflowDir, limit).map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return { raw: line };
    }
  });
}

function loadNodeCards(workflowDir, graph) {
  const cards = new Map();
  for (const node of graph.nodes) {
    const file = path.join(workflowDir, "nodes", `${node.id}.json`);
    if (!fs.existsSync(file)) continue;
    cards.set(node.id, readJson(file));
  }
  return cards;
}

function loadHandoffs(workflowDir) {
  const handoffDir = path.join(workflowDir, "handoffs");
  const records = [];
  const byPath = new Map();
  const byNode = new Map();
  if (!fs.existsSync(handoffDir)) return { records, byPath, byNode };

  for (const entry of fs.readdirSync(handoffDir).filter((name) => name.endsWith(".json")).sort()) {
    const file = path.join(handoffDir, entry);
    const relativePath = relativeToWorkflow(workflowDir, file);
    let record;
    try {
      const handoff = readJson(file);
      record = { ...handoff, path: relativePath };
    } catch (error) {
      record = { path: relativePath, status: "invalid", error: error.message };
    }
    records.push(record);
    byPath.set(relativePath, record);
    if (record.node_id) {
      if (!byNode.has(record.node_id)) byNode.set(record.node_id, []);
      byNode.get(record.node_id).push(record);
    }
  }
  return { records, byPath, byNode };
}

function latestHandoffForNode(entry, handoffs, nodeId) {
  if (entry?.last_handoff) {
    const fromState = handoffs.byPath.get(entry.last_handoff);
    if (fromState) return fromState;
    return { path: entry.last_handoff, node_id: nodeId, status: "missing" };
  }
  const records = handoffs.byNode.get(nodeId) || [];
  return records.length > 0 ? records[records.length - 1] : null;
}

function collectEvidencePaths(handoff) {
  if (!handoff || handoff.status === "missing" || handoff.status === "invalid") return [];
  const paths = new Set();
  for (const value of handoff.outputs || []) paths.add(value);
  for (const value of handoff.evidence || []) paths.add(value);
  for (const item of handoff.work_items || []) {
    for (const value of item.evidence || []) paths.add(value);
  }
  for (const item of handoff.verification || []) {
    if (item.evidence) paths.add(item.evidence);
  }
  return [...paths];
}

function evidenceItems(workflowDir, handoff) {
  const root = projectRootFromWorkflow(workflowDir);
  return collectEvidencePaths(handoff).map((itemPath) => {
    const workflowPath = path.join(workflowDir, itemPath);
    const projectPath = path.join(root, itemPath);
    const exists = fs.existsSync(workflowPath) || fs.existsSync(projectPath);
    return { path: itemPath, exists };
  });
}

function evidenceStatus(entry, handoff, items = []) {
  if (handoff?.status === "missing") return "missing";
  if (handoff?.status === "invalid") return "invalid";
  if (handoff) return items.some((item) => !item.exists) ? "partial" : "present";
  if (["passed", "failed", "blocked", "skipped"].includes(entry?.status)) return "missing";
  return "not_required_yet";
}

function localizedNodeText(node, card, language) {
  const translated = DEFAULT_NODE_TRANSLATIONS[language]?.[node.type];
  const title = localizedValue(card.title_i18n || node.title_i18n, language);
  const objective = localizedValue(card.objective_i18n || node.objective_i18n, language);
  const acceptance = localizedValue(card.acceptance_i18n || node.acceptance_i18n, language);
  return {
    title: title || translated?.title || node.title,
    objective: objective || translated?.objective || card.objective || node.objective || nodeObjective(node),
    acceptance: asStringArray(acceptance).length > 0
      ? asStringArray(acceptance)
      : translated?.acceptance || card.acceptance || node.acceptance || [],
  };
}

function normalizeTokenUsage(value) {
  if (!value || typeof value !== "object") {
    return {
      recorded: false,
      source: "not_recorded",
      input_tokens: null,
      output_tokens: null,
      reasoning_tokens: null,
      cached_tokens: null,
      total_tokens: null,
      notes: null,
    };
  }
  const input = Number.isFinite(value.input_tokens) ? value.input_tokens : value.prompt_tokens ?? null;
  const output = Number.isFinite(value.output_tokens) ? value.output_tokens : value.completion_tokens ?? null;
  const reasoning = Number.isFinite(value.reasoning_tokens) ? value.reasoning_tokens : null;
  const cached = Number.isFinite(value.cached_tokens) ? value.cached_tokens : null;
  const summed = [input, output, reasoning].filter((item) => Number.isFinite(item)).reduce((sum, item) => sum + item, 0);
  const total = Number.isFinite(value.total_tokens) ? value.total_tokens : summed || null;
  const source = typeof value.source === "string" && value.source ? value.source : null;
  return {
    recorded: Boolean(source) && Number.isFinite(total),
    source: source || "not_recorded",
    provider: value.provider || null,
    model: value.model || null,
    input_tokens: Number.isFinite(input) ? input : null,
    output_tokens: Number.isFinite(output) ? output : null,
    reasoning_tokens: Number.isFinite(reasoning) ? reasoning : null,
    cached_tokens: Number.isFinite(cached) ? cached : null,
    total_tokens: Number.isFinite(total) ? total : null,
    recorded_at: value.recorded_at || null,
    notes: value.notes || null,
  };
}

function mergeTokenUsage(target, usage) {
  if (!usage?.recorded) return;
  for (const field of ["input_tokens", "output_tokens", "reasoning_tokens", "cached_tokens", "total_tokens"]) {
    if (Number.isFinite(usage[field])) target[field] += usage[field];
  }
}

function normalizeContextUsage(value, fallbackLevel) {
  if (!value || typeof value !== "object") {
    return {
      recorded: false,
      source: "not_recorded",
      context_level: fallbackLevel || null,
      source_bytes: null,
      estimated_tokens: null,
      input_files: null,
      notes: null,
    };
  }
  const estimatedTokens = Number.isFinite(value.estimated_tokens) ? value.estimated_tokens : null;
  const sourceBytes = Number.isFinite(value.source_bytes) ? value.source_bytes : null;
  const source = typeof value.source === "string" && value.source ? value.source : null;
  return {
    recorded: Boolean(source) && (Number.isFinite(estimatedTokens) || Number.isFinite(sourceBytes) || Number.isFinite(value.input_files)),
    source: source || "not_recorded",
    context_level: value.context_level || fallbackLevel || null,
    source_bytes: sourceBytes,
    estimated_tokens: estimatedTokens,
    input_files: Number.isFinite(value.input_files) ? value.input_files : null,
    notes: value.notes || null,
  };
}

function mergeContextUsage(target, usage) {
  if (!usage?.recorded) return;
  if (Number.isFinite(usage.source_bytes)) target.source_bytes += usage.source_bytes;
  if (Number.isFinite(usage.estimated_tokens)) target.estimated_tokens += usage.estimated_tokens;
  if (Number.isFinite(usage.input_files)) target.input_files += usage.input_files;
}

function parseTimestamp(value) {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function isoFromMs(value) {
  return Number.isFinite(value) ? new Date(value).toISOString() : null;
}

function terminalEventName(eventName) {
  return ["node.complete", "node.reject", "node.block", "node.skip"].includes(eventName);
}

function normalizeTiming(handoff, timeline, entry, estimatedMinutes) {
  const timing = handoff?.timing && typeof handoff.timing === "object" ? handoff.timing : {};
  const startEvent = timeline.find((event) => event.event === "node.start");
  const terminalEvent = [...timeline].reverse().find((event) => terminalEventName(event.event));
  const startedAt = timing.started_at || startEvent?.at || null;
  const completedAt = timing.completed_at || terminalEvent?.at || (["passed", "failed", "blocked", "skipped"].includes(entry?.status) ? entry?.updated_at : null);
  const startedMs = parseTimestamp(startedAt);
  const completedMs = parseTimestamp(completedAt);
  const durationMs = Number.isFinite(timing.duration_ms)
    ? timing.duration_ms
    : startedMs !== null && completedMs !== null && completedMs >= startedMs
      ? completedMs - startedMs
      : null;
  const estimate = Number.isFinite(timing.estimated_minutes) ? timing.estimated_minutes : estimatedMinutes ?? null;
  const etaMs = startedMs !== null && Number.isFinite(estimate) && !completedAt ? startedMs + estimate * 60_000 : null;
  return {
    started_at: startedAt,
    completed_at: completedAt,
    duration_ms: durationMs,
    duration_minutes: Number.isFinite(durationMs) ? Math.round((durationMs / 60_000) * 10) / 10 : null,
    estimated_minutes: Number.isFinite(estimate) ? estimate : null,
    estimated_completion_at: timing.estimated_completion_at || isoFromMs(etaMs),
    source: timing.source || (startedAt || completedAt ? "ledger" : "not_recorded"),
  };
}

function normalizeWorkItems(handoff) {
  const items = Array.isArray(handoff?.work_items) ? handoff.work_items : [];
  if (items.length > 0) {
    return items.map((item, index) => {
      if (typeof item === "string") {
        return { title: item, status: handoff.status || "recorded", detail: null, files: [], evidence: [], index };
      }
      return {
        title: item.title || item.task || `work item ${index + 1}`,
        status: item.status || handoff.status || "recorded",
        detail: item.detail || item.summary || null,
        files: Array.isArray(item.files) ? item.files : [],
        evidence: Array.isArray(item.evidence) ? item.evidence : [],
        index,
      };
    });
  }
  if (handoff?.summary) {
    return [{
      title: handoff.summary,
      status: handoff.status || "recorded",
      detail: null,
      files: [],
      evidence: [],
      index: 0,
      source: "handoff.summary",
    }];
  }
  return [];
}

function workflowInternalPath(value) {
  return /^(nodes|handoffs|evidence)\//.test(value) || ["board.json", "board.html"].includes(value);
}

function normalizeChangedFiles(handoff) {
  const files = Array.isArray(handoff?.changed_files) ? handoff.changed_files : [];
  if (files.length > 0) {
    return files.map((item) => {
      if (typeof item === "string") return { path: item, status: "changed", summary: null };
      return {
        path: item.path,
        status: item.status || "changed",
        summary: item.summary || null,
      };
    }).filter((item) => item.path);
  }
  return (handoff?.outputs || [])
    .filter((item) => typeof item === "string" && !workflowInternalPath(item))
    .map((item) => ({ path: item, status: "output", summary: "derived from handoff.outputs" }));
}

function normalizeAgentActivity(handoff) {
  const activity = Array.isArray(handoff?.agent_activity) ? handoff.agent_activity : [];
  return activity.map((item, index) => ({
    agent_id: item.agent_id || item.name || `agent-${index + 1}`,
    role: item.role || "worker",
    scope: item.scope || null,
    task: item.task || item.summary || "",
    status: item.status || "recorded",
    mode: item.mode || "subagent",
    model_tier: item.model_tier || null,
    model: item.model || null,
    model_selection_reason: item.model_selection_reason || null,
    started_at: item.started_at || null,
    completed_at: item.completed_at || null,
    evidence: Array.isArray(item.evidence) ? item.evidence : [],
    token_usage: normalizeTokenUsage(item.token_usage),
    context_usage: normalizeContextUsage(item.context_usage, null),
  }));
}

function deriveTokenUsageFromAgents(agentActivity) {
  const recorded = agentActivity.filter((item) => item.token_usage.recorded);
  if (recorded.length === 0) return normalizeTokenUsage(null);
  const totals = {
    input_tokens: 0,
    output_tokens: 0,
    reasoning_tokens: 0,
    cached_tokens: 0,
    total_tokens: 0,
  };
  for (const item of recorded) mergeTokenUsage(totals, item.token_usage);
  return {
    recorded: true,
    source: "derived_from_agent_activity",
    provider: null,
    model: null,
    ...totals,
    recorded_at: null,
    notes: "Summed from agent_activity token records.",
  };
}

function deriveContextUsageFromAgents(agentActivity, fallbackLevel) {
  const recorded = agentActivity.filter((item) => item.context_usage.recorded);
  if (recorded.length === 0) return normalizeContextUsage(null, fallbackLevel);
  const totals = { source_bytes: 0, estimated_tokens: 0, input_files: 0 };
  for (const item of recorded) mergeContextUsage(totals, item.context_usage);
  return {
    recorded: true,
    source: "derived_from_agent_activity",
    context_level: fallbackLevel || null,
    source_bytes: totals.source_bytes || null,
    estimated_tokens: totals.estimated_tokens || null,
    input_files: totals.input_files || null,
    notes: "Summed from agent_activity context records.",
  };
}

function readNodeLedgerEvents(allEvents, nodeId) {
  return allEvents
    .filter((event) => event.node_id === nodeId)
    .map((event) => ({
      at: event.at || null,
      event: event.event || "unknown",
      handoff: event.handoff || null,
      reject_to: event.reject_to || null,
      reason: event.reason || null,
      token_usage: normalizeTokenUsage(event.token_usage),
      context_usage: normalizeContextUsage(event.context_usage, null),
    }));
}

function retryInfoForNode(state, nodeId) {
  const info = { incoming: 0, outgoing: 0, total: 0 };
  for (const [edge, count] of Object.entries(state.retry_edges || {})) {
    const [from, to] = edge.split("->");
    if (from === nodeId) info.outgoing += count;
    if (to === nodeId) info.incoming += count;
  }
  info.total = info.incoming + info.outgoing;
  return info;
}

function collaborationValue(node, card, field, fallback) {
  const value = node[field] ?? card[field];
  return value === undefined || value === null || value === "" ? fallback : value;
}

function projectNode(workflowDir, state, cards, handoffs, allEvents, node, language) {
  const entry = state.nodes[node.id] || {};
  const card = cards.get(node.id) || {};
  const policy = defaultNodePolicy(node);
  const handoff = latestHandoffForNode(entry, handoffs, node.id);
  const retry = retryInfoForNode(state, node.id);
  const display = localizedNodeText(node, card, language);
  const evidence = evidenceItems(workflowDir, handoff);
  const workItems = normalizeWorkItems(handoff);
  const changedFiles = normalizeChangedFiles(handoff);
  const agentActivity = normalizeAgentActivity(handoff);
  const explicitTokenUsage = normalizeTokenUsage(handoff?.token_usage);
  const tokenUsage = explicitTokenUsage.recorded ? explicitTokenUsage : deriveTokenUsageFromAgents(agentActivity);
  const timeline = readNodeLedgerEvents(allEvents, node.id);
  const taskComplexity = collaborationValue(node, card, "task_complexity", policy.task_complexity);
  const cardTierMatchesComplexity = !card.task_complexity || card.task_complexity === taskComplexity;
  const modelTier = node.model_tier
    || (cardTierMatchesComplexity ? card.model_tier : null)
    || modelTierForComplexity(taskComplexity, policy.model_tier);
  const cardReasonMatchesPolicy = cardTierMatchesComplexity && (!card.model_tier || card.model_tier === modelTier);
  const modelReason = node.model_selection_reason
    || (cardReasonMatchesPolicy ? card.model_selection_reason : null)
    || modelSelectionReason(taskComplexity, modelTier);
  const estimatedMinutes = Number.isFinite(node.estimated_minutes)
    ? node.estimated_minutes
    : Number.isFinite(card.estimated_minutes)
      ? card.estimated_minutes
      : policy.estimated_minutes;
  const explicitContextUsage = normalizeContextUsage(handoff?.context_usage, node.context_level || card.context_level || "focus");
  const contextUsage = explicitContextUsage.recorded
    ? explicitContextUsage
    : deriveContextUsageFromAgents(agentActivity, node.context_level || card.context_level || "focus");
  const timing = normalizeTiming(handoff, timeline, entry, estimatedMinutes);
  return {
    id: node.id,
    title: node.title,
    display_title: display.title,
    type: node.type,
    status: entry.status || "missing",
    owner: node.owner || "codex",
    required: node.required,
    context_level: node.context_level || card.context_level || "focus",
    language: handoff?.language || card.language || node.language || null,
    task_complexity: taskComplexity,
    model_tier: modelTier,
    model_selection_reason: modelReason,
    estimated_minutes: estimatedMinutes,
    worker_profile: collaborationValue(node, card, "worker_profile", "unassigned"),
    agent: collaborationValue(node, card, "agent", null),
    model_profile: collaborationValue(node, card, "model_profile", null),
    runtime_profile: collaborationValue(node, card, "runtime_profile", null),
    safety_profile: collaborationValue(node, card, "safety_profile", null),
    scorecard: collaborationValue(node, card, "scorecard", null),
    claimed_by: collaborationValue(node, card, "claimed_by", null),
    parallel_group: collaborationValue(node, card, "parallel_group", "none"),
    join_policy: collaborationValue(node, card, "join_policy", "all_required"),
    lease_expires_at: collaborationValue(node, card, "lease_expires_at", null),
    handoff_target: collaborationValue(node, card, "handoff_target", null),
    retry_count: retry.total,
    retry_incoming: retry.incoming,
    retry_outgoing: retry.outgoing,
    last_handoff: entry.last_handoff || handoff?.path || null,
    handoff_status: handoff?.status || null,
    handoff_summary: handoff?.summary || null,
    evidence_status: evidenceStatus(entry, handoff, evidence),
    objective: card.objective || node.objective || nodeObjective(node),
    display_objective: display.objective,
    depends_on: node.depends_on || [],
    inputs: node.depends_on || [],
    inputs_used: handoff?.inputs_used || [],
    allowed_scope: card.allowed_scope || [],
    acceptance: card.acceptance || node.acceptance || [],
    display_acceptance: display.acceptance,
    required_checks: (handoff?.verification || []).map((item) => ({
      command: item.command,
      result: item.result,
      evidence: item.evidence || null,
    })),
    outputs: card.allowed_outputs || node.allowed_outputs || [],
    handoff_outputs: handoff?.outputs || [],
    evidence_paths: collectEvidencePaths(handoff),
    evidence_items: evidence,
    work_items: workItems,
    changed_files: changedFiles,
    agent_activity: agentActivity,
    token_usage: tokenUsage,
    context_usage: contextUsage,
    timing,
    timeline,
    open_risks: ["failed", "blocked"].includes(entry.status) && entry.reason ? [entry.reason] : [],
    non_blocking_notes: handoff?.non_blocking_notes || [],
    updated_at: entry.updated_at || null,
    reason: entry.reason || null,
  };
}

function statusCounts(projectedNodes) {
  const counts = {};
  for (const status of COLUMN_STATUSES) counts[status] = 0;
  for (const node of projectedNodes) {
    if (counts[node.status] === undefined) counts[node.status] = 0;
    counts[node.status] += 1;
  }
  return counts;
}

function completionPercent(counts, total) {
  if (total === 0) return 0;
  return Math.round((((counts.passed || 0) + (counts.skipped || 0)) / total) * 100);
}

function nextRecommendedAction(graph, state, language = "en") {
  const text = boardText(language);
  const ready = readyNodes(graph, state);
  const running = nodesWithStatus(graph, state, "running");
  const blocked = nodesWithStatus(graph, state, "blocked");
  const failed = nodesWithStatus(graph, state, "failed");
  if (failed.length > 0) return `${text.resolveFailed} ${failed[0].id}.`;
  if (blocked.length > 0 && ready.length === 0) return `${text.unblock} ${blocked[0].id} ${text.recordBlocker}`;
  if (ready.length > 0) return `${text.start} ${ready[0].id}.`;
  if (running.length > 0) return `${text.completeHandoff} ${running[0].id} ${text.withHandoff}`;
  return text.deliveryComplete;
}

function dependencyEdges(graph) {
  const edges = [];
  for (const node of graph.nodes) {
    for (const dependency of node.depends_on || []) {
      edges.push({ from: dependency, to: node.id, type: "depends_on" });
    }
  }
  return edges;
}

function buildRejectEdges(handoffs, state) {
  const edges = new Map();
  for (const handoff of handoffs.records) {
    if (handoff.status !== "failed" || !handoff.reject_to) continue;
    const key = `${handoff.node_id}->${handoff.reject_to}`;
    edges.set(key, {
      from: handoff.node_id,
      to: handoff.reject_to,
      type: "reject",
      handoff: handoff.path,
      reason: handoff.reason || null,
      retry_count: state.retry_edges?.[key] || 0,
    });
  }
  for (const [edge, count] of Object.entries(state.retry_edges || {})) {
    if (edges.has(edge)) {
      edges.get(edge).retry_count = count;
      continue;
    }
    const [from, to] = edge.split("->");
    edges.set(edge, { from, to, type: "reject", handoff: null, reason: null, retry_count: count });
  }
  return [...edges.values()];
}

function criticalPath(graph) {
  const map = nodeMap(graph);
  const memo = new Map();
  function longestPathTo(nodeId) {
    if (memo.has(nodeId)) return memo.get(nodeId);
    const node = map.get(nodeId);
    if (!node) return [];
    const dependencyPaths = (node.depends_on || []).map(longestPathTo);
    const longestDependency = dependencyPaths.reduce((best, candidate) => {
      return candidate.length > best.length ? candidate : best;
    }, []);
    const value = [...longestDependency, nodeId];
    memo.set(nodeId, value);
    return value;
  }
  return graph.nodes.reduce((best, node) => {
    const candidate = longestPathTo(node.id);
    return candidate.length > best.length ? candidate : best;
  }, []);
}

function buildParallelGroups(projectedNodes) {
  const groups = new Map();
  for (const node of projectedNodes) {
    if (!node.parallel_group || node.parallel_group === "none") continue;
    if (!groups.has(node.parallel_group)) {
      groups.set(node.parallel_group, {
        group: node.parallel_group,
        nodes: [],
        statuses: {},
        join_policies: new Set(),
      });
    }
    const group = groups.get(node.parallel_group);
    group.nodes.push(node.id);
    group.statuses[node.status] = (group.statuses[node.status] || 0) + 1;
    group.join_policies.add(node.join_policy);
  }
  return [...groups.values()].map((group) => ({
    group: group.group,
    nodes: group.nodes,
    statuses: group.statuses,
    join_policies: [...group.join_policies],
  }));
}

function buildCollaboration(projectedNodes) {
  const profiles = new Map();
  for (const node of projectedNodes) {
    const profile = node.worker_profile || "unassigned";
    if (!profiles.has(profile)) {
      profiles.set(profile, { profile, nodes: [], counts: {}, claimed_by: [] });
    }
    const lane = profiles.get(profile);
    lane.nodes.push(node.id);
    lane.counts[node.status] = (lane.counts[node.status] || 0) + 1;
    if (node.claimed_by) lane.claimed_by.push({ node_id: node.id, claimed_by: node.claimed_by });
  }
  const workerProfiles = [...profiles.values()].map((lane) => ({
    profile: lane.profile,
    nodes: lane.nodes,
    counts: lane.counts,
    claimed_by: lane.claimed_by,
  }));
  const overloaded = workerProfiles
    .filter((lane) => (lane.counts.running || 0) > 1 || (lane.counts.running || 0) + (lane.counts.ready || 0) > 2)
    .map((lane) => ({
      profile: lane.profile,
      ready: lane.counts.ready || 0,
      running: lane.counts.running || 0,
    }));
  return {
    worker_profiles: workerProfiles,
    unclaimed_ready: projectedNodes
      .filter((node) => node.status === "ready" && !node.claimed_by)
      .map((node) => node.id),
    claimed_running: projectedNodes
      .filter((node) => node.status === "running" && node.claimed_by)
      .map((node) => ({ node_id: node.id, claimed_by: node.claimed_by })),
    leases: projectedNodes
      .filter((node) => node.lease_expires_at)
      .map((node) => ({ node_id: node.id, lease_expires_at: node.lease_expires_at, claimed_by: node.claimed_by })),
    overloaded_worker_profiles: overloaded,
  };
}

function buildUsage(projectedNodes) {
  const totals = {
    input_tokens: 0,
    output_tokens: 0,
    reasoning_tokens: 0,
    cached_tokens: 0,
    total_tokens: 0,
  };
  const byNode = [];
  const byAgent = new Map();
  const byParallelGroup = new Map();
  const missingNodes = [];
  for (const node of projectedNodes) {
    const groupName = node.parallel_group || "none";
    if (!byParallelGroup.has(groupName)) {
      byParallelGroup.set(groupName, {
        parallel_group: groupName,
        nodes: [],
        missing_nodes: [],
        input_tokens: 0,
        output_tokens: 0,
        reasoning_tokens: 0,
        cached_tokens: 0,
        total_tokens: 0,
      });
    }
    const group = byParallelGroup.get(groupName);
    group.nodes.push(node.id);
    if (node.token_usage.recorded) {
      mergeTokenUsage(totals, node.token_usage);
      mergeTokenUsage(group, node.token_usage);
      byNode.push({ node_id: node.id, ...node.token_usage });
    } else {
      missingNodes.push(node.id);
      group.missing_nodes.push(node.id);
    }
    for (const activity of node.agent_activity) {
      if (!activity.token_usage.recorded) continue;
      const key = `${activity.agent_id}:${activity.role}`;
      if (!byAgent.has(key)) {
        byAgent.set(key, {
          agent_id: activity.agent_id,
          role: activity.role,
          input_tokens: 0,
          output_tokens: 0,
          reasoning_tokens: 0,
          cached_tokens: 0,
          total_tokens: 0,
        });
      }
      mergeTokenUsage(byAgent.get(key), activity.token_usage);
    }
  }
  return {
    totals,
    recorded_nodes: byNode.length,
    missing_nodes: missingNodes,
    coverage_percent: projectedNodes.length === 0 ? 100 : Math.round((byNode.length / projectedNodes.length) * 100),
    by_node: byNode,
    by_agent: [...byAgent.values()],
    by_parallel_group: [...byParallelGroup.values()],
  };
}

function buildContextUsage(projectedNodes) {
  const totals = { source_bytes: 0, estimated_tokens: 0, input_files: 0 };
  const byNode = [];
  const byAgent = new Map();
  const missingNodes = [];
  for (const node of projectedNodes) {
    if (node.context_usage.recorded) {
      mergeContextUsage(totals, node.context_usage);
      byNode.push({ node_id: node.id, ...node.context_usage });
    } else {
      missingNodes.push(node.id);
    }
    for (const activity of node.agent_activity) {
      if (!activity.context_usage.recorded) continue;
      const key = `${activity.agent_id}:${activity.role}`;
      if (!byAgent.has(key)) {
        byAgent.set(key, {
          agent_id: activity.agent_id,
          role: activity.role,
          source_bytes: 0,
          estimated_tokens: 0,
          input_files: 0,
        });
      }
      mergeContextUsage(byAgent.get(key), activity.context_usage);
    }
  }
  return {
    totals,
    recorded_nodes: byNode.length,
    missing_nodes: missingNodes,
    coverage_percent: projectedNodes.length === 0 ? 100 : Math.round((byNode.length / projectedNodes.length) * 100),
    by_node: byNode,
    by_agent: [...byAgent.values()],
  };
}

function buildTiming(projectedNodes) {
  const durations = projectedNodes
    .map((node) => node.timing.duration_ms)
    .filter((value) => Number.isFinite(value));
  const firstStart = projectedNodes
    .map((node) => parseTimestamp(node.timing.started_at))
    .filter((value) => value !== null)
    .sort((a, b) => a - b)[0] ?? null;
  const lastEnd = projectedNodes
    .map((node) => parseTimestamp(node.timing.completed_at))
    .filter((value) => value !== null)
    .sort((a, b) => b - a)[0] ?? null;
  const remainingEstimate = projectedNodes
    .filter((node) => !["passed", "skipped"].includes(node.status))
    .reduce((sum, node) => sum + (Number.isFinite(node.timing.estimated_minutes) ? node.timing.estimated_minutes : 0), 0);
  return {
    elapsed_ms: firstStart !== null && lastEnd !== null && lastEnd >= firstStart ? lastEnd - firstStart : null,
    elapsed_minutes: firstStart !== null && lastEnd !== null && lastEnd >= firstStart ? Math.round(((lastEnd - firstStart) / 60_000) * 10) / 10 : null,
    recorded_nodes: durations.length,
    average_node_minutes: durations.length === 0 ? null : Math.round((durations.reduce((sum, value) => sum + value, 0) / durations.length / 60_000) * 10) / 10,
    estimated_remaining_minutes: remainingEstimate,
    by_node: projectedNodes.map((node) => ({ node_id: node.id, ...node.timing })),
  };
}

function buildProjectChanges(projectedNodes, gitStatus) {
  const byPath = new Map();
  for (const item of gitStatus || []) {
    byPath.set(item.path, { path: item.path, status: item.status, summaries: [] });
  }
  for (const node of projectedNodes) {
    for (const file of node.changed_files) {
      if (!byPath.has(file.path)) byPath.set(file.path, { path: file.path, status: file.status || "changed", summaries: [] });
      const entry = byPath.get(file.path);
      if (file.summary) entry.summaries.push(`${node.id}: ${file.summary}`);
    }
  }
  return [...byPath.values()].map((item) => ({
    path: item.path,
    status: item.status,
    summary: item.summaries.join(" | ") || null,
  }));
}

function recommendation(id, severity, title, detail, action, nodeIds = []) {
  return { id, severity, title, detail, action, node_ids: [...new Set(nodeIds.filter(Boolean))] };
}

function buildRecommendations(projectedNodes, usage, context, risks, project, language = "en") {
  const items = [];
  const isZh = language === "zh-CN";
  const text = boardText(language);
  const failedOrBlocked = projectedNodes.filter((node) => ["failed", "blocked"].includes(node.status));
  for (const node of failedOrBlocked) {
    items.push(recommendation(
      `resolve-${node.id}`,
      node.status === "failed" ? "high" : "medium",
      isZh
        ? `${node.id} ${node.display_title || node.title} 处于${statusTitle(node.status, text)}`
        : `${node.id} ${node.display_title || node.title} is ${node.status}`,
      node.reason || node.handoff_summary || (isZh ? "下游继续前需要处理该节点。" : "Node needs attention before downstream work can continue."),
      node.status === "failed"
        ? (isZh ? `查看 ${node.last_handoff || node.id}，按 required_fix 修复或打回上游。` : `Inspect ${node.last_handoff || node.id} and reject/fix upstream output.`)
        : (isZh ? `记录 blocker handoff，或解除 ${node.id} 的阻塞。` : `Record a blocker handoff or unblock ${node.id}.`),
      [node.id],
    ));
  }
  const readyUnclaimed = projectedNodes.filter((node) => node.status === "ready" && !node.claimed_by);
  if (readyUnclaimed.length > 0) {
    items.push(recommendation(
      "claim-ready-nodes",
      "medium",
      isZh ? "存在未认领的就绪节点" : "Ready nodes are unclaimed",
      isZh ? "就绪节点没有负责人时，后续执行容易停在计划层。" : "Ready nodes without owners can stall execution.",
      isZh ? `认领或启动：${readyUnclaimed.map((node) => node.id).join(", ")}。` : `Claim or start: ${readyUnclaimed.map((node) => node.id).join(", ")}.`,
      readyUnclaimed.map((node) => node.id),
    ));
  }
  const runningNodes = projectedNodes.filter((node) => node.status === "running");
  if (runningNodes.length > 0) {
    items.push(recommendation(
      "complete-running-nodes",
      "medium",
      isZh ? "存在进行中的节点" : "Nodes are still running",
      isZh ? "进行中节点需要在完成、失败、阻塞或跳过时提交结构化 handoff。" : "Running nodes need a structured handoff when done, failed, blocked, or skipped.",
      isZh ? `完成后为 ${runningNodes.map((node) => node.id).join(", ")} 写入 handoff。` : `Write handoffs for ${runningNodes.map((node) => node.id).join(", ")} when complete.`,
      runningNodes.map((node) => node.id),
    ));
  }
  const missingEvidence = projectedNodes.filter((node) => node.evidence_items.some((item) => !item.exists));
  if (missingEvidence.length > 0) {
    items.push(recommendation(
      "missing-evidence",
      "medium",
      isZh ? "存在缺失的证据路径" : "Evidence paths are missing",
      isZh ? "部分 handoff 证据路径在 workflow 目录或项目根目录中找不到。" : "Some handoff evidence paths cannot be found from the workflow directory or project root.",
      isZh ? "补齐证据文件，或修正 handoff 中的路径。" : "Create the missing evidence files or update the handoff paths.",
      missingEvidence.map((node) => node.id),
    ));
  }
  if (usage.missing_nodes.length > 0) {
    items.push(recommendation(
      "missing-token-usage",
      "low",
      isZh ? "Token 消耗记录不完整" : "Token usage coverage is incomplete",
      isZh ? "更多节点记录来源感知 token 后，看板才能分析真实消耗趋势。" : "The board cannot show full token cost trends until more nodes record source-aware token usage.",
      isZh ? "工具暴露精确用量时记录 token_usage；拿不到时保持缺失，不要编造。" : "Record token_usage when the provider or tool exposes exact usage; otherwise leave it missing.",
      usage.missing_nodes,
    ));
  }
  if (context.missing_nodes.length > 0) {
    items.push(recommendation(
      "missing-context-usage",
      "low",
      isZh ? "上下文大小记录不完整" : "Context size coverage is incomplete",
      isZh ? "上下文记录可以帮助后续优化 compact、检索和子智能体拆分策略。" : "Context records are needed to optimize future workflow cost and compact behavior.",
      isZh ? "后续节点记录 context_usage.source_bytes、estimated_tokens、input_files 和 source。" : "Record context_usage.source_bytes, estimated_tokens, input_files, and source for future nodes.",
      context.missing_nodes,
    ));
  }
  const overloaded = projectedNodes.filter((node) => node.agent_activity.length > 3);
  if (overloaded.length > 0) {
    items.push(recommendation(
      "agent-fanout-review",
      "low",
      isZh ? "检测到较大的子智能体扇出" : "Large agent fan-out detected",
      isZh ? "同一节点使用很多子智能体可能有价值，但如果范围重叠会浪费上下文。" : "Many agent activities on one node can be useful, but may waste context if their scopes overlap.",
      isZh ? "确认每个子智能体都有独立角色、边界上下文和不重叠产物。" : "Confirm each subagent has a distinct role, bounded context, and non-overlapping output.",
      overloaded.map((node) => node.id),
    ));
  }
  const noChangeSummary = (project?.main_changes || []).filter((change) => !change.summary);
  if (project?.git?.dirty && noChangeSummary.length > 0) {
    items.push(recommendation(
      "missing-change-summary",
      "low",
      isZh ? "部分当前改动缺少主要改动说明" : "Some active changes lack summaries",
      isZh ? "只列文件名不能说明这些改动完成了什么，也不利于回滚和审查。" : "A file list alone does not explain what the changes achieved or support review and rollback.",
      isZh ? "在相关节点 handoff.changed_files 中补充 summary。" : "Add summary fields to handoff.changed_files for the relevant nodes.",
      [],
    ));
  }
  const workFilesWithoutChanges = projectedNodes.filter((node) => (
    node.work_items.some((item) => item.files?.length > 0) && node.changed_files.length === 0
  ));
  if (workFilesWithoutChanges.length > 0) {
    items.push(recommendation(
      "work-files-without-changes",
      "low",
      isZh ? "工作项文件没有进入变更摘要" : "Work item files are not summarized as changed files",
      isZh ? "任务详情里出现文件，但项目快照无法说明这些文件的主要变化。" : "Task details mention files, but the project snapshot cannot explain the main changes.",
      isZh ? "把实际改动文件提升到 changed_files，或说明它们只是参考输入。" : "Promote changed files into changed_files, or clarify that they were reference inputs only.",
      workFilesWithoutChanges.map((node) => node.id),
    ));
  }
  const laneLoad = new Map();
  for (const node of projectedNodes) {
    const profile = node.worker_profile || "unassigned";
    if (!laneLoad.has(profile)) laneLoad.set(profile, { profile, ready: 0, running: 0, nodes: [] });
    const lane = laneLoad.get(profile);
    if (["ready", "running"].includes(node.status)) lane.nodes.push(node.id);
    if (node.status === "ready") lane.ready += 1;
    if (node.status === "running") lane.running += 1;
  }
  for (const lane of [...laneLoad.values()].filter((item) => item.running > 1 || item.ready + item.running > 2)) {
    items.push(recommendation(
      `overloaded-${lane.profile}`,
      "low",
      isZh ? `${lane.profile} 泳道负载偏高` : `${lane.profile} lane is overloaded`,
      isZh ? "同一角色同时承担过多 ready/running 节点会降低并行收益。" : "Too many ready/running nodes in one role lowers the value of parallelism.",
      isZh ? "拆分角色、缩小节点范围，或释放不必要的认领。" : "Split the role, reduce node scope, or release unnecessary claims.",
      lane.nodes,
    ));
  }
  for (const alert of risks.retry_alerts || []) {
    if (alert.exceeded) {
      items.push(recommendation(
        `retry-${alert.edge}`,
        "high",
        isZh ? `${alert.edge} 超过重试上限` : `Retry limit exceeded for ${alert.edge}`,
        isZh ? "同一打回循环已经超过配置的重试限制。" : "The same reject loop exceeded its configured retry limit.",
        isZh ? "停止自动重试，进行人工设计决策。" : "Stop automatic retries and make a human design decision.",
        [alert.from, alert.to],
      ));
    }
  }
  return items;
}

function buildRisks(workflowDir, graph, state, projectedNodes, handoffs) {
  const map = nodeMap(graph);
  return {
    blockers: readMarkdownItems(path.join(workflowDir, "blockers.md")),
    failed_handoffs: handoffs.records
      .filter((handoff) => handoff.status === "failed")
      .map((handoff) => ({
        node_id: handoff.node_id,
        reject_to: handoff.reject_to || null,
        reason: handoff.reason || null,
        required_fix: handoff.required_fix || null,
        handoff: handoff.path,
      })),
    skipped_required: projectedNodes
      .filter((node) => node.required && node.status === "skipped")
      .map((node) => node.id),
    retry_alerts: Object.entries(state.retry_edges || {}).map(([edge, count]) => {
      const [from, to] = edge.split("->");
      const target = map.get(to);
      const retryLimit = target?.retry_limit ?? null;
      return {
        edge,
        from,
        to,
        count,
        retry_limit: retryLimit,
        exceeded: retryLimit !== null ? count > retryLimit : false,
      };
    }),
    decisions: readMarkdownItems(path.join(workflowDir, "decisions.md")),
  };
}

function scorecardCheckTitle(check, language) {
  return String(localizedValue(check.title, language) || check.id || "check");
}

function scorecardResult(check, status, language, failingNodes = [], detail = null) {
  const isZh = language === "zh-CN";
  return {
    id: check.id,
    title: scorecardCheckTitle(check, language),
    severity: check.severity || "recommended",
    status,
    node_ids: failingNodes,
    detail: detail || (status === "passed"
      ? (isZh ? "已找到可核验的 workflow 证据。" : "Workflow evidence is present.")
      : status === "pending"
        ? (isZh ? "当前还没有适用节点，后续节点完成后再评估。" : "No applicable nodes yet; evaluate after related nodes complete.")
        : (isZh ? "证据不足，需要补充结构化记录。" : "Evidence is insufficient; add structured records.")),
  };
}

function evaluateEvidenceCheck(check, projectedNodes, graph, project, language) {
  const evidence = check.evidence || {};
  const terminalNodes = projectedNodes.filter((node) => TERMINAL_STATUSES.has(node.status));
  const passedNodes = projectedNodes.filter((node) => node.status === "passed");
  const requiredNodes = projectedNodes.filter((node) => node.required);
  const isZh = language === "zh-CN";
  const failStatus = (check.severity || "recommended") === "required" ? "failed" : "warning";
  const pending = () => scorecardResult(check, "pending", language);
  const pass = () => scorecardResult(check, "passed", language);
  const fail = (nodes, detail) => scorecardResult(check, failStatus, language, nodes, detail);

  switch (evidence.type) {
    case "terminal_handoff_summary": {
      if (terminalNodes.length === 0) return pending();
      const failing = terminalNodes.filter((node) => !node.handoff_summary).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "终态节点缺少 handoff.summary。" : "Terminal nodes are missing handoff.summary.");
    }
    case "terminal_work_items": {
      if (terminalNodes.length === 0) return pending();
      const failing = terminalNodes.filter((node) => node.work_items.length === 0).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "终态节点没有记录 work_items。" : "Terminal nodes did not record work_items.");
    }
    case "changed_files_summary": {
      const files = project?.main_changes || [];
      const filesNeedingSummary = files.filter((item) => item.status !== "D");
      if (filesNeedingSummary.length === 0) return pending();
      const missing = filesNeedingSummary.filter((item) => !item.summary).map((item) => item.path);
      return missing.length === 0 ? pass() : fail([], isZh ? `缺少主要改动说明：${missing.join(", ")}` : `Missing change summaries: ${missing.join(", ")}`);
    }
    case "verification_recorded": {
      if (passedNodes.length === 0) return pending();
      const failing = passedNodes.filter((node) => node.required_checks.length === 0).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "通过节点没有记录 verification 检查。" : "Passed nodes did not record verification checks.");
    }
    case "verification_evidence_exists": {
      if (passedNodes.length === 0) return pending();
      const failing = passedNodes
        .filter((node) => node.required_checks.length > 0 && node.evidence_items.some((item) => !item.exists))
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "部分验证证据路径不存在。" : "Some verification evidence paths are missing.");
    }
    case "token_usage_source": {
      if (terminalNodes.length === 0) return pending();
      const failing = terminalNodes.filter((node) => !node.token_usage.recorded).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "终态节点缺少来源感知 token_usage。" : "Terminal nodes are missing source-aware token_usage.");
    }
    case "context_usage_source": {
      if (terminalNodes.length === 0) return pending();
      const failing = terminalNodes.filter((node) => !node.context_usage.recorded).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "终态节点缺少来源感知 context_usage。" : "Terminal nodes are missing source-aware context_usage.");
    }
    case "required_nodes_not_failed_or_blocked": {
      const failing = requiredNodes.filter((node) => ["failed", "blocked"].includes(node.status)).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "必需节点仍处于失败或阻塞状态。" : "Required nodes are failed or blocked.");
    }
    case "agent_activity_scoped": {
      const activities = projectedNodes.flatMap((node) => node.agent_activity.map((activity) => ({ node, activity })));
      if (activities.length === 0) return pending();
      const failing = activities
        .filter(({ activity }) => !activity.agent_id || !activity.role || !activity.scope || !activity.task || !activity.status)
        .map(({ node }) => node.id);
      return failing.length === 0 ? pass() : fail([...new Set(failing)], isZh ? "部分子智能体活动缺少 role/scope/task/status。" : "Some agent activities lack role/scope/task/status.");
    }
    case "model_tier_policy": {
      const failing = projectedNodes
        .filter((node) => node.task_complexity === "expert" && node.model_tier !== "frontier")
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "expert 复杂度节点必须使用 frontier 档位。" : "Expert-complexity nodes must use the frontier tier.");
    }
    case "board_language": {
      const expected = graph.metadata?.language || language;
      return expected === language ? pass() : fail([], isZh ? "看板语言与 workflow metadata 不一致。" : "Board language does not match workflow metadata.");
    }
    default:
      return scorecardResult(check, "warning", language, [], isZh ? `未知 evidence.type：${evidence.type}` : `Unknown evidence.type: ${evidence.type}`);
  }
}

function evaluateScorecards(graph, projectedNodes, project, language) {
  let definitions = [];
  try {
    definitions = loadScorecardsForGraph(graph);
  } catch (error) {
    return {
      definitions: [],
      checks: [{
        id: "scorecard-load-error",
        title: "Scorecard load error",
        severity: "required",
        status: "failed",
        node_ids: [],
        detail: error.message,
      }],
      counts: { passed: 0, failed: 1, warning: 0, pending: 0 },
      score_percent: 0,
    };
  }
  const checks = [];
  for (const definition of definitions) {
    for (const check of definition.checks || []) {
      const result = evaluateEvidenceCheck(check, projectedNodes, graph, project, language);
      checks.push({
        scorecard_id: definition.scorecard_id,
        scorecard_name: localizedValue(definition.name, language) || definition.scorecard_id,
        ...result,
      });
    }
  }
  const counts = { passed: 0, failed: 0, warning: 0, pending: 0 };
  for (const check of checks) {
    if (counts[check.status] === undefined) counts[check.status] = 0;
    counts[check.status] += 1;
  }
  const completed = counts.passed + counts.failed + counts.warning;
  const scorePercent = completed === 0 ? 0 : Math.round((counts.passed / completed) * 100);
  return {
    definitions: definitions.map((definition) => ({
      scorecard_id: definition.scorecard_id,
      name: localizedValue(definition.name, language) || definition.scorecard_id,
      description: localizedValue(definition.description, language) || null,
    })),
    checks,
    counts,
    score_percent: scorePercent,
  };
}

function buildBoardProjection(workflowDir, graph, state, language = "en") {
  const cards = loadNodeCards(workflowDir, graph);
  const handoffs = loadHandoffs(workflowDir);
  const allEvents = readLedgerEvents(workflowDir, 1000);
  const projectedNodes = graph.nodes.map((node) => projectNode(workflowDir, state, cards, handoffs, allEvents, node, language));
  const counts = statusCounts(projectedNodes);
  const columns = {};
  for (const status of COLUMN_STATUSES) {
    columns[status] = projectedNodes.filter((node) => node.status === status);
  }
  const recentEvents = allEvents.slice(-10);
  const critical = criticalPath(graph);
  const usage = buildUsage(projectedNodes);
  const context = buildContextUsage(projectedNodes);
  const timing = buildTiming(projectedNodes);
  const project = buildProjectSnapshot(workflowDir, graph);
  project.main_changes = buildProjectChanges(projectedNodes, project.git?.status || []);
  const risks = buildRisks(workflowDir, graph, state, projectedNodes, handoffs);
  const scorecard = evaluateScorecards(graph, projectedNodes, project, language);
  const recommendations = buildRecommendations(projectedNodes, usage, context, risks, project, language);
  for (const check of scorecard.checks.filter((item) => item.status === "failed")) {
    recommendations.push(recommendation(
      `scorecard-${check.id}`,
      "high",
      `${boardText(language).scorecard}: ${check.title}`,
      check.detail,
      language === "zh-CN" ? "补齐对应 handoff、证据或节点记录，然后重新生成看板。" : "Add the required handoff, evidence, or node record, then regenerate the board.",
      check.node_ids,
    ));
  }
  return {
    schema_version: SCHEMA_VERSION,
    workflow_id: graph.workflow_id,
    title: graph.title,
    mode: graph.mode,
    language,
    generated_at: now(),
    template: {
      template_id: graph.metadata?.template_id || null,
      template_version: graph.metadata?.template_version || null,
      name: graph.metadata?.template_name || null,
      description: graph.metadata?.template_description || null,
      layers: graph.metadata?.layers || {},
    },
    project,
    summary: {
      total: projectedNodes.length,
      completion_percent: completionPercent(counts, projectedNodes.length),
      pending: counts.pending || 0,
      ready: counts.ready || 0,
      running: counts.running || 0,
      blocked: counts.blocked || 0,
      failed: counts.failed || 0,
      passed: counts.passed || 0,
      skipped: counts.skipped || 0,
      work_items: projectedNodes.reduce((sum, node) => sum + node.work_items.length, 0),
      changed_files: projectedNodes.reduce((sum, node) => sum + node.changed_files.length, 0),
      verification_checks: projectedNodes.reduce((sum, node) => sum + node.required_checks.length, 0),
      agent_activities: projectedNodes.reduce((sum, node) => sum + node.agent_activity.length, 0),
      next_recommended_action: nextRecommendedAction(graph, state, language),
      critical_path: critical,
      latest_ledger_event: recentEvents[recentEvents.length - 1] || null,
    },
    columns,
    flow: {
      nodes: projectedNodes.map((node) => ({
        id: node.id,
        title: node.title,
        type: node.type,
        status: node.status,
        worker_profile: node.worker_profile,
        parallel_group: node.parallel_group,
      })),
      dependency_edges: dependencyEdges(graph),
      reject_edges: buildRejectEdges(handoffs, state),
      parallel_groups: buildParallelGroups(projectedNodes),
      critical_path: critical,
    },
    collaboration: buildCollaboration(projectedNodes),
    usage,
    context,
    timing,
    scorecard,
    risks,
    recommendations,
    improvement_plan: recommendations,
    recent_events: recentEvents,
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeInlineJson(value) {
  return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
}

function formatListValue(item) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return String(item ?? "");
  if (item.edge) {
    return `${item.edge}: ${item.count ?? 0}${item.retry_limit !== null && item.retry_limit !== undefined ? ` / ${item.retry_limit}` : ""}${item.exceeded ? " exceeded" : ""}`;
  }
  if (item.node_id) {
    return [item.node_id, item.reject_to ? `reject_to=${item.reject_to}` : null, item.reason, item.required_fix]
      .filter(Boolean)
      .join(" · ");
  }
  return Object.entries(item)
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(",") : value}`)
    .join(" · ");
}

function renderList(items, empty = "none") {
  if (!items || items.length === 0) return `<span class="muted">${escapeHtml(empty)}</span>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(formatListValue(item))}</li>`).join("")}</ul>`;
}

function renderObjectList(items, empty, renderItem) {
  if (!items || items.length === 0) return `<span class="muted">${escapeHtml(empty)}</span>`;
  return `<ul>${items.map((item) => `<li>${renderItem(item)}</li>`).join("")}</ul>`;
}

function renderMetric(label, value, options = null) {
  const body = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
  if (typeof options === "string") return `<a class="metric metric-link" href="${escapeHtml(options)}">${body}</a>`;
  if (options?.filterStatus) {
    return `<button type="button" class="metric metric-button" data-filter-status="${escapeHtml(options.filterStatus)}" aria-pressed="false">${body}</button>`;
  }
  if (options?.href) return `<a class="metric metric-link" href="${escapeHtml(options.href)}">${body}</a>`;
  return `<div class="metric">${body}</div>`;
}

function renderInlineItems(items, empty) {
  if (!items || items.length === 0) return `<span class="muted">${escapeHtml(empty)}</span>`;
  return items.map((item) => `<code>${escapeHtml(item)}</code>`).join(" ");
}

function renderStatusItems(items, empty) {
  if (!items || items.length === 0) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return `<div class="status-list">${items
    .map((item) => `<div><code>${escapeHtml(item.status)}</code> ${escapeHtml(item.path)}</div>`)
    .join("")}</div>`;
}

function truncateText(value, limit = 150) {
  const text = String(value || "");
  return text.length > limit ? `${text.slice(0, limit - 1)}...` : text;
}

function formatTokens(usage, text) {
  if (!usage?.recorded) return text.notRecorded;
  return `${usage.total_tokens} (${text.source}: ${usage.source})`;
}

function formatDuration(minutes, text) {
  if (!Number.isFinite(minutes)) return text.notRecorded;
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

function renderTokenUsage(usage, text) {
  if (!usage?.recorded) return `<span class="muted">${escapeHtml(text.notRecorded)}</span>`;
  const fields = [
    ["input", usage.input_tokens],
    ["output", usage.output_tokens],
    ["reasoning", usage.reasoning_tokens],
    ["cached", usage.cached_tokens],
    ["total", usage.total_tokens],
    [text.source, usage.source],
    ["provider", usage.provider],
    ["model", usage.model],
    ["recorded_at", usage.recorded_at],
  ].filter(([, value]) => value !== null && value !== undefined);
  return `<dl>${fields.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>${usage.notes ? `<p class="muted">${escapeHtml(usage.notes)}</p>` : ""}`;
}

function renderContextUsage(usage, text) {
  if (!usage?.recorded) return `<span class="muted">${escapeHtml(text.notRecorded)}</span>`;
  const fields = [
    ["level", usage.context_level],
    ["source_bytes", usage.source_bytes],
    ["estimated_tokens", usage.estimated_tokens],
    ["input_files", usage.input_files],
    [text.source, usage.source],
  ].filter(([, value]) => value !== null && value !== undefined);
  return `<dl>${fields.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>${usage.notes ? `<p class="muted">${escapeHtml(usage.notes)}</p>` : ""}`;
}

function renderTiming(timing, text) {
  const fields = [
    [text.startedAt, timing.started_at],
    [text.completedAt, timing.completed_at],
    [text.duration, formatDuration(timing.duration_minutes, text)],
    [text.eta, timing.estimated_completion_at],
    ["estimate", Number.isFinite(timing.estimated_minutes) ? `${timing.estimated_minutes}m` : null],
    [text.source, timing.source],
  ].filter(([, value]) => value !== null && value !== undefined);
  return `<dl>${fields.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>`;
}

function renderWorkItems(items, text) {
  return renderObjectList(items, text.noWorkItems, (item) => {
    const detail = item.detail ? `<p class="muted">${escapeHtml(item.detail)}</p>` : "";
    const files = item.files?.length ? `<p><strong>${escapeHtml(text.files)}:</strong> ${escapeHtml(item.files.join(", "))}</p>` : "";
    return `<strong>${escapeHtml(item.status)}</strong> ${escapeHtml(item.title)}${detail}${files}`;
  });
}

function renderChangedFiles(files, text) {
  return renderObjectList(files, text.noChangedFiles, (file) => {
    const summary = file.summary ? ` - ${escapeHtml(file.summary)}` : "";
    return `<code>${escapeHtml(file.path)}</code> <span class="muted">${escapeHtml(file.status)}</span>${summary}`;
  });
}

function renderEvidenceItems(items, text) {
  return renderObjectList(items, text.none, (item) => {
    const label = item.exists ? text.exists : text.missingPath;
    return `<code>${escapeHtml(item.path)}</code> <span class="muted">${escapeHtml(label)}</span>`;
  });
}

function renderAgentActivity(items, text) {
  return renderObjectList(items, text.noAgentActivity, (item) => {
    const tokens = formatTokens(item.token_usage, text);
    const evidence = item.evidence?.length ? `<p><strong>${escapeHtml(text.evidence)}:</strong> ${escapeHtml(item.evidence.join(", "))}</p>` : "";
    const model = item.model_tier || item.model ? `<p><strong>${escapeHtml(text.modelSelection)}:</strong> ${escapeHtml([item.model_tier, item.model].filter(Boolean).join(" / "))}</p>` : "";
    const scope = item.scope ? `<p><strong>${escapeHtml(text.scope)}:</strong> ${escapeHtml(item.scope)}</p>` : "";
    const context = item.context_usage?.recorded ? `<p>${escapeHtml(text.contextUsage)}: ${escapeHtml(item.context_usage.estimated_tokens || item.context_usage.source_bytes || text.notRecorded)} (${escapeHtml(item.context_usage.source)})</p>` : "";
    const timing = [item.started_at, item.completed_at].filter(Boolean).join(" -> ");
    return `<strong>${escapeHtml(item.agent_id)}</strong> ${escapeHtml(item.role)} · ${escapeHtml(item.status)}<p class="muted">${escapeHtml(item.task || "")}</p>${scope}${model}<p>${escapeHtml(text.tokenUsage)}: ${escapeHtml(tokens)}</p>${context}${timing ? `<p>${escapeHtml(text.timeUsage)}: ${escapeHtml(timing)}</p>` : ""}${evidence}`;
  });
}

function renderTimeline(items, text) {
  return renderObjectList(items, text.none, (item) => {
    const details = [item.handoff ? `handoff=${item.handoff}` : null, item.reject_to ? `reject_to=${item.reject_to}` : null, item.reason ? `reason=${item.reason}` : null]
      .filter(Boolean)
      .join(" · ");
    return `<code>${escapeHtml(item.at || "")}</code> ${escapeHtml(item.event)}${details ? ` <span class="muted">${escapeHtml(details)}</span>` : ""}`;
  });
}

function renderUsageGroups(groups, text) {
  return renderObjectList(groups, text.none, (group) => {
    return `<strong>${escapeHtml(group.parallel_group)}</strong><p>${escapeHtml(text.nodes)}: ${escapeHtml(group.nodes.join(", "))}</p><p>${escapeHtml(text.tokenTotal)}: ${escapeHtml(group.total_tokens || text.notRecorded)}</p><p>${escapeHtml(text.tokenMissing)}: ${escapeHtml(group.missing_nodes.join(", ") || text.none)}</p>`;
  });
}

function renderProjectChanges(changes, text) {
  return renderObjectList(changes, text.noMainChanges, (change) => {
    return `<code>${escapeHtml(change.path)}</code> <span class="muted">${escapeHtml(change.status || "")}</span>${change.summary ? `<p>${escapeHtml(change.summary)}</p>` : ""}`;
  });
}

function renderNodeLinks(nodeIds, text) {
  if (!nodeIds || nodeIds.length === 0) return `<span class="muted">${escapeHtml(text.none)}</span>`;
  return nodeIds.map((nodeId) => `<a href="#node-${escapeHtml(nodeId)}"><code>${escapeHtml(nodeId)}</code></a>`).join(" ");
}

function renderStatusCounts(counts, text) {
  const items = Object.entries(counts || {}).filter(([, value]) => value > 0);
  if (items.length === 0) return `<span class="muted">${escapeHtml(text.none)}</span>`;
  return items.map(([status, value]) => `${escapeHtml(statusTitle(status, text))}: ${escapeHtml(value)}`).join(" · ");
}

function renderClaimedItems(items, text) {
  return renderObjectList(items, text.noClaims, (item) => {
    return `<a href="#node-${escapeHtml(item.node_id)}"><code>${escapeHtml(item.node_id)}</code></a> ${escapeHtml(text.claimedBy)} ${escapeHtml(item.claimed_by)}`;
  });
}

function renderLeaseItems(items, text) {
  return renderObjectList(items, text.noLeases, (item) => {
    return `<a href="#node-${escapeHtml(item.node_id)}"><code>${escapeHtml(item.node_id)}</code></a> ${escapeHtml(item.lease_expires_at)}${item.claimed_by ? ` · ${escapeHtml(item.claimed_by)}` : ""}`;
  });
}

function renderRecommendations(items, text) {
  return renderObjectList(items, text.noRecommendations, (item) => {
    const nodes = item.node_ids?.length ? `<p><strong>${escapeHtml(text.nodes)}:</strong> ${item.node_ids.map((nodeId) => `<a href="#node-${escapeHtml(nodeId)}">${escapeHtml(nodeId)}</a>`).join(", ")}</p>` : "";
    return `<strong>${escapeHtml(item.severity.toUpperCase())}</strong> ${escapeHtml(item.title)}<p class="muted">${escapeHtml(item.detail)}</p><p><strong>${escapeHtml(text.actionHint)}:</strong> ${escapeHtml(item.action)}</p>${nodes}`;
  });
}

function renderScorecard(scorecard, text) {
  const checks = scorecard?.checks || [];
  const counts = scorecard?.counts || {};
  const definitions = scorecard?.definitions || [];
  const names = definitions.map((definition) => definition.name || definition.scorecard_id).join(", ") || text.none;
  const checksHtml = renderObjectList(checks, text.none, (check) => {
    const nodes = check.node_ids?.length ? `<p><strong>${escapeHtml(text.nodes)}:</strong> ${check.node_ids.map((nodeId) => `<a href="#node-${escapeHtml(nodeId)}">${escapeHtml(nodeId)}</a>`).join(", ")}</p>` : "";
    return `<strong>${escapeHtml(check.status.toUpperCase())}</strong> ${escapeHtml(check.title)}<p class="muted">${escapeHtml(check.scorecard_name || check.scorecard_id || "")} · ${escapeHtml(text.severity)}: ${escapeHtml(check.severity)}</p><p>${escapeHtml(check.detail || "")}</p>${nodes}`;
  });
  return `<div class="metrics">
      ${renderMetric(text.score, `${scorecard?.score_percent ?? 0}%`)}
      ${renderMetric(text.scorecardPassed, counts.passed || 0)}
      ${renderMetric(text.scorecardFailed, counts.failed || 0)}
      ${renderMetric(text.scorecardWarnings, counts.warning || 0)}
      ${renderMetric(text.scorecardPending, counts.pending || 0)}
    </div>
    <p><strong>${escapeHtml(text.scorecard)}:</strong> ${escapeHtml(names)}</p>
    ${checksHtml}`;
}

function renderRecentEvents(events, text) {
  return renderObjectList(events, text.none, (event) => {
    const nodeLink = event.node_id ? `<a href="#node-${escapeHtml(event.node_id)}">${escapeHtml(event.node_id)}</a>` : "";
    const detail = [event.handoff ? `handoff=${event.handoff}` : null, event.reject_to ? `reject_to=${event.reject_to}` : null, event.reason ? `reason=${event.reason}` : null]
      .filter(Boolean)
      .join(" · ");
    return `<code>${escapeHtml(event.at || "")}</code> ${escapeHtml(event.event || "event")} ${nodeLink}${detail ? `<p class="muted">${escapeHtml(detail)}</p>` : ""}`;
  });
}

function statusTitle(status, text) {
  return text[status] || status;
}

function renderNodeCard(node, text) {
  return `<article class="node-card ${escapeHtml(node.status)}" id="card-${escapeHtml(node.id)}" data-node-id="${escapeHtml(node.id)}" data-status="${escapeHtml(node.status)}">
    <div class="node-head">
      <a href="#node-${escapeHtml(node.id)}"><strong>${escapeHtml(node.id)}</strong></a>
      <span class="status ${escapeHtml(node.status)}">${escapeHtml(statusTitle(node.status, text))}</span>
    </div>
    <div class="node-title">${escapeHtml(node.display_title || node.title)}</div>
    ${node.handoff_summary ? `<p class="node-summary">${escapeHtml(truncateText(node.handoff_summary))}</p>` : ""}
    <p class="node-counts">
      <span>${escapeHtml(text.work)} ${escapeHtml(node.work_items.length)}</span>
      <span>${escapeHtml(text.files)} ${escapeHtml(node.changed_files.length)}</span>
      <span>${escapeHtml(text.checks)} ${escapeHtml(node.required_checks.length)}</span>
      <span>${escapeHtml(text.agents)} ${escapeHtml(node.agent_activity.length)}</span>
    </p>
    <dl>
      <dt>${escapeHtml(text.type)}</dt><dd>${escapeHtml(node.type)}</dd>
      <dt>${escapeHtml(text.worker)}</dt><dd>${escapeHtml(node.worker_profile)}</dd>
      <dt>${escapeHtml(text.agent)}</dt><dd>${escapeHtml(node.agent || text.none)}</dd>
      <dt>${escapeHtml(text.modelTier)}</dt><dd>${escapeHtml(node.model_tier)}</dd>
      <dt>${escapeHtml(text.claimed)}</dt><dd>${escapeHtml(node.claimed_by || text.unclaimed)}</dd>
      <dt>${escapeHtml(text.retry)}</dt><dd>${escapeHtml(node.retry_count)}</dd>
      <dt>${escapeHtml(text.tokens)}</dt><dd>${escapeHtml(formatTokens(node.token_usage, text))}</dd>
      <dt>${escapeHtml(text.handoff)}</dt><dd>${escapeHtml(node.last_handoff || text.missing)}</dd>
      <dt>${escapeHtml(text.evidence)}</dt><dd>${escapeHtml(node.evidence_status)}</dd>
    </dl>
  </article>`;
}

function renderEdgeList(edges, empty = "No edges") {
  if (!edges || edges.length === 0) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return `<div class="edge-list">${edges
    .map((edge) => `<div class="edge" data-from="${escapeHtml(edge.from)}" data-to="${escapeHtml(edge.to)}"><a href="#node-${escapeHtml(edge.from)}"><code>${escapeHtml(edge.from)}</code></a><span>-></span><a href="#node-${escapeHtml(edge.to)}"><code>${escapeHtml(edge.to)}</code></a>${edge.retry_count ? `<small>retry ${escapeHtml(edge.retry_count)}</small>` : ""}</div>`)
    .join("")}</div>`;
}

function renderTaskTracker(nodes, text) {
  return `<div class="task-table" role="table">
    <div class="task-row task-head" role="row">
      <span>${escapeHtml(text.nodes)}</span>
      <span>${escapeHtml(text.actualWork)}</span>
      <span>${escapeHtml(text.changedFiles)}</span>
      <span>${escapeHtml(text.verification)}</span>
      <span>${escapeHtml(text.tokenUsage)}</span>
      <span>${escapeHtml(text.openRisks)}</span>
    </div>
    ${nodes
      .map((node) => {
        const work = node.work_items.map((item) => item.title).join("; ") || text.noWorkItems;
        const files = node.changed_files.map((file) => file.path).join(", ") || text.noChangedFiles;
        const checks = node.required_checks.map((item) => `${item.command}: ${item.result}`).join("; ") || text.none;
        const risks = [...node.open_risks, ...node.non_blocking_notes].join("; ") || text.none;
        return `<div class="task-row" role="row" data-node-id="${escapeHtml(node.id)}" data-status="${escapeHtml(node.status)}">
          <span><a href="#node-${escapeHtml(node.id)}"><strong>${escapeHtml(node.id)}</strong></a><br><small>${escapeHtml(node.display_title || node.title)}</small><br><span class="status ${escapeHtml(node.status)}">${escapeHtml(statusTitle(node.status, text))}</span></span>
          <span>${escapeHtml(truncateText(work, 240))}</span>
          <span>${escapeHtml(truncateText(files, 180))}</span>
          <span>${escapeHtml(truncateText(checks, 220))}</span>
          <span>${escapeHtml(formatTokens(node.token_usage, text))}</span>
          <span>${escapeHtml(truncateText(risks, 180))}</span>
        </div>`;
      })
      .join("")}
  </div>`;
}

function renderBoardHtml(board) {
  const text = boardText(board.language);
  const columnsHtml = COLUMN_STATUSES.map(
    (status) => `<section class="column" id="status-${escapeHtml(status)}">
      <h3>${escapeHtml(statusTitle(status, text))} <span>${board.columns[status].length}</span></h3>
      ${board.columns[status].length > 0 ? board.columns[status].map((node) => renderNodeCard(node, text)).join("") : `<p class="muted">${escapeHtml(text.empty)}</p>`}
    </section>`,
  ).join("");

  const detailsHtml = Object.values(board.columns)
    .flat()
    .map((node) => `<details class="detail" id="node-${escapeHtml(node.id)}" data-node-id="${escapeHtml(node.id)}" data-status="${escapeHtml(node.status)}">
      <summary><strong>${escapeHtml(node.id)}</strong> ${escapeHtml(node.display_title || node.title)} · ${escapeHtml(statusTitle(node.status, text))}</summary>
      <div class="detail-grid">
        <section><h4>${escapeHtml(text.actualWork)}</h4>${renderWorkItems(node.work_items, text)}</section>
        <section><h4>${escapeHtml(text.changedFiles)}</h4>${renderChangedFiles(node.changed_files, text)}</section>
        <section><h4>${escapeHtml(text.verification)}</h4>${renderList(node.required_checks, text.none)}</section>
        <section><h4>${escapeHtml(text.evidencePaths)}</h4>${renderEvidenceItems(node.evidence_items, text)}</section>
        <section><h4>${escapeHtml(text.tokenUsage)}</h4>${renderTokenUsage(node.token_usage, text)}</section>
        <section><h4>${escapeHtml(text.contextUsage)}</h4>${renderContextUsage(node.context_usage, text)}</section>
        <section><h4>${escapeHtml(text.timeUsage)}</h4>${renderTiming(node.timing, text)}</section>
        <section><h4>${escapeHtml(text.agentPolicy)}</h4><dl><dt>${escapeHtml(text.complexity)}</dt><dd>${escapeHtml(node.task_complexity)}</dd><dt>${escapeHtml(text.agent)}</dt><dd>${escapeHtml(node.agent || text.none)}</dd><dt>${escapeHtml(text.modelTier)}</dt><dd>${escapeHtml(node.model_tier)}</dd><dt>${escapeHtml(text.modelProfile)}</dt><dd>${escapeHtml(node.model_profile || text.none)}</dd><dt>${escapeHtml(text.runtimeProfile)}</dt><dd>${escapeHtml(node.runtime_profile || text.none)}</dd><dt>${escapeHtml(text.safetyProfile)}</dt><dd>${escapeHtml(node.safety_profile || text.none)}</dd><dt>${escapeHtml(text.scorecard)}</dt><dd>${escapeHtml(node.scorecard || text.none)}</dd><dt>${escapeHtml(text.modelSelection)}</dt><dd>${escapeHtml(node.model_selection_reason)}</dd></dl></section>
        <section><h4>${escapeHtml(text.agentActivity)}</h4>${renderAgentActivity(node.agent_activity, text)}</section>
        <section><h4>${escapeHtml(text.openRisks)}</h4>${renderList([...node.open_risks, ...node.non_blocking_notes], text.none)}</section>
        <section><h4>${escapeHtml(text.timeline)}</h4>${renderTimeline(node.timeline, text)}</section>
        <section><h4>${escapeHtml(text.nodeContract)}</h4><p><strong>${escapeHtml(text.objective)}:</strong> ${escapeHtml(node.display_objective || node.objective)}</p></section>
        <section><h4>${escapeHtml(text.handoffSummary)}</h4><p>${escapeHtml(node.handoff_summary || text.none)}</p></section>
        <section><h4>${escapeHtml(text.dependsOn)}</h4>${renderList(node.depends_on, text.none)}</section>
        <section><h4>${escapeHtml(text.acceptance)}</h4>${renderList(node.display_acceptance || node.acceptance, text.none)}</section>
        <section><h4>${escapeHtml(text.outputs)}</h4>${renderList(node.handoff_outputs.length > 0 ? node.handoff_outputs : node.outputs, text.none)}</section>
      </div>
    </details>`)
    .join("");
  const allNodes = Object.values(board.columns).flat();
  const project = board.project || {};
  const git = project.git || {};
  const template = board.template || {};
  const layers = template.layers || {};
  const keyFileItems = (project.key_files || []).map((item) => item.path);
  const topLevelItems = (project.top_level || []).map((item) => `${item.type === "dir" ? "/" : ""}${item.name}`);

  return `<!doctype html>
<html lang="${escapeHtml(board.language === "zh-CN" ? "zh-CN" : "en")}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(text.pageTitle)} - ${escapeHtml(board.workflow_id)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8fa;
      --panel: #ffffff;
      --ink: #1f2933;
      --muted: #667085;
      --line: #d7dde5;
      --ready: #0f766e;
      --running: #2563eb;
      --blocked: #a16207;
      --failed: #b42318;
      --passed: #287d3c;
      --skipped: #667085;
      --pending: #475467;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 14px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header, main { max-width: 1440px; margin: 0 auto; padding: 24px; }
    header { padding-bottom: 12px; }
    h1, h2, h3, h4, p { margin-top: 0; }
    h1 { font-size: 30px; line-height: 1.15; margin-bottom: 6px; }
    h2 { font-size: 18px; margin-bottom: 12px; }
    h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 0; display: flex; justify-content: space-between; gap: 8px; }
    code { background: #eef2f6; border-radius: 4px; padding: 1px 5px; }
    .muted { color: var(--muted); }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .command { display: grid; grid-template-columns: 1.2fr 2fr; gap: 16px; align-items: stretch; }
    .progress { height: 10px; background: #e5e9ef; border-radius: 999px; overflow: hidden; margin: 10px 0 14px; }
    .progress span { display: block; height: 100%; background: #2563eb; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(90px, 1fr)); gap: 10px; }
    .metric { border: 1px solid var(--line); border-radius: 6px; padding: 10px; background: #fbfcfe; color: inherit; text-decoration: none; }
    .metric-button { width: 100%; font: inherit; text-align: left; cursor: pointer; }
    .metric-link { display: block; }
    .metric-button[aria-pressed="true"] { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.14); }
    .metric span { display: block; color: var(--muted); font-size: 12px; }
    .metric strong { display: block; font-size: 22px; line-height: 1.2; }
    .grid-2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
    .board { display: grid; grid-template-columns: repeat(7, minmax(170px, 1fr)); gap: 12px; overflow-x: auto; padding-bottom: 6px; }
    .column { min-width: 170px; background: #fdfefe; border: 1px solid var(--line); border-radius: 8px; padding: 10px; }
    .task-table { display: grid; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    .task-row { display: grid; grid-template-columns: minmax(120px, 0.8fr) minmax(220px, 1.5fr) minmax(160px, 1fr) minmax(200px, 1.3fr) minmax(110px, 0.8fr) minmax(140px, 1fr); gap: 0; border-top: 1px solid var(--line); background: #fff; }
    .task-row:first-child { border-top: 0; }
    .task-row > span { padding: 10px; border-left: 1px solid var(--line); min-width: 0; overflow-wrap: anywhere; }
    .task-row > span:first-child { border-left: 0; }
    .task-head { background: #eef2f6; color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0; font-weight: 700; }
    .task-row.is-hidden, .node-card.is-hidden, .detail.is-hidden { display: none; }
    .task-row.is-focused, .node-card.is-focused, .detail.is-focused { outline: 3px solid rgba(37, 99, 235, 0.25); outline-offset: 2px; }
    .node-counts { display: flex; flex-wrap: wrap; gap: 4px; margin: 0 0 8px; }
    .node-counts span { background: #eef2f6; border-radius: 999px; color: var(--muted); font-size: 11px; padding: 1px 6px; }
    .node-card { border: 1px solid var(--line); border-left: 4px solid var(--pending); border-radius: 6px; padding: 10px; background: #fff; margin-bottom: 8px; }
    .node-card.ready { border-left-color: var(--ready); }
    .node-card.running { border-left-color: var(--running); }
    .node-card.blocked { border-left-color: var(--blocked); }
    .node-card.failed { border-left-color: var(--failed); }
    .node-card.passed { border-left-color: var(--passed); }
    .node-card.skipped { border-left-color: var(--skipped); }
    .node-head { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
    .node-title { color: var(--muted); margin: 4px 0 8px; }
    .node-summary { margin: 0 0 8px; color: var(--ink); overflow-wrap: anywhere; }
    .status { border-radius: 999px; color: #fff; font-size: 11px; padding: 2px 7px; background: var(--pending); }
    .status.ready { background: var(--ready); }
    .status.running { background: var(--running); }
    .status.blocked { background: var(--blocked); }
    .status.failed { background: var(--failed); }
    .status.passed { background: var(--passed); }
    .status.skipped { background: var(--skipped); }
    dl { display: grid; grid-template-columns: 62px 1fr; gap: 3px 8px; margin: 0; }
    dt { color: var(--muted); }
    dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
    .edge-list { display: grid; gap: 6px; }
    .status-list { display: grid; gap: 5px; }
    .edge { display: flex; gap: 8px; align-items: center; border: 1px solid var(--line); border-radius: 6px; padding: 7px 9px; background: #fbfcfe; }
    .edge small { margin-left: auto; color: var(--muted); }
    .lanes { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
    .lane { border: 1px solid var(--line); border-radius: 6px; padding: 10px; background: #fbfcfe; }
    .detail { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    .detail summary { cursor: pointer; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
    ul { margin: 0; padding-left: 18px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #111827; color: #f9fafb; padding: 12px; border-radius: 6px; max-height: 360px; overflow: auto; }
    @media (max-width: 920px) {
      header, main { padding: 16px; }
      .command, .grid-2, .detail-grid { grid-template-columns: 1fr; }
      .metrics { grid-template-columns: repeat(2, minmax(90px, 1fr)); }
      .task-row { grid-template-columns: 1fr; }
      .task-row > span { border-left: 0; border-top: 1px solid var(--line); }
      .task-row > span:first-child { border-top: 0; }
      .board { grid-template-columns: 1fr; overflow-x: visible; }
      .column { min-width: 0; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(board.title)}</h1>
    <p class="muted"><code>${escapeHtml(board.workflow_id)}</code> &middot; ${escapeHtml(board.mode)} &middot; ${escapeHtml(text.generated)} ${escapeHtml(board.generated_at)}</p>
  </header>
  <main>
    <section class="panel command">
      <div>
        <h2>${escapeHtml(text.commandCenter)}</h2>
        <div class="progress" aria-label="Completion ${escapeHtml(board.summary.completion_percent)} percent"><span style="width:${escapeHtml(board.summary.completion_percent)}%"></span></div>
        <p><strong>${escapeHtml(board.summary.completion_percent)}%</strong> ${escapeHtml(text.complete)}</p>
        <p><strong>${escapeHtml(text.next)}:</strong> ${escapeHtml(board.summary.next_recommended_action)}</p>
        <p><strong>${escapeHtml(text.criticalPath)}:</strong> ${escapeHtml(board.summary.critical_path.join(" -> ") || text.none)}</p>
        <p class="muted">${escapeHtml(text.clickMetricHint)}</p>
      </div>
      <div class="metrics">
        ${renderMetric(text.total, board.summary.total, { filterStatus: "all" })}
        ${renderMetric(text.ready, board.summary.ready, { filterStatus: "ready" })}
        ${renderMetric(text.running, board.summary.running, { filterStatus: "running" })}
        ${renderMetric(text.blocked, board.summary.blocked, { filterStatus: "blocked" })}
        ${renderMetric(text.failed, board.summary.failed, { filterStatus: "failed" })}
        ${renderMetric(text.passed, board.summary.passed, { filterStatus: "passed" })}
        ${renderMetric(text.skipped, board.summary.skipped, { filterStatus: "skipped" })}
        ${renderMetric(text.pending, board.summary.pending, { filterStatus: "pending" })}
        ${renderMetric(text.workItems, board.summary.work_items, "#task-tracker")}
        ${renderMetric(text.changedFiles, board.summary.changed_files, "#main-changes")}
        ${renderMetric(text.checks, board.summary.verification_checks, "#task-tracker")}
        ${renderMetric(text.agents, board.summary.agent_activities, "#collaboration")}
      </div>
    </section>

    <section class="grid-2" id="template-scorecard">
      <div class="panel">
        <h2>${escapeHtml(text.workflowTemplate)}</h2>
        <dl>
          <dt>${escapeHtml(text.templateId)}</dt><dd>${escapeHtml(template.template_id || text.none)}</dd>
          <dt>${escapeHtml(text.templateVersion)}</dt><dd>${escapeHtml(template.template_version || text.none)}</dd>
          <dt>${escapeHtml(text.template)}</dt><dd>${escapeHtml(template.name || text.none)}</dd>
          <dt>${escapeHtml(text.agent)}</dt><dd>${escapeHtml(layers.agents || text.none)}</dd>
          <dt>${escapeHtml(text.modelProfile)}</dt><dd>${escapeHtml(layers.model_profile || text.none)}</dd>
          <dt>${escapeHtml(text.runtimeProfile)}</dt><dd>${escapeHtml(layers.runtime_profile || text.none)}</dd>
          <dt>${escapeHtml(text.safetyLimits)}</dt><dd>${escapeHtml(layers.safety_limits || text.none)}</dd>
        </dl>
        ${template.description ? `<p class="muted">${escapeHtml(template.description)}</p>` : ""}
      </div>
      <div class="panel">
        <h2>${escapeHtml(text.scorecard)}</h2>
        <p class="muted">${escapeHtml(text.scorecardHelp)}</p>
        ${renderScorecard(board.scorecard, text)}
      </div>
    </section>

    <section class="panel" id="recommendations">
      <h2>${escapeHtml(text.improvementPlan)}</h2>
      ${renderRecommendations(board.recommendations || board.improvement_plan, text)}
    </section>

    <section class="panel" id="task-tracker">
      <h2>${escapeHtml(text.taskTracker)}</h2>
      ${renderTaskTracker(allNodes, text)}
      <p id="filter-status" class="muted" aria-live="polite"></p>
    </section>

    <section class="panel">
      <h2>${escapeHtml(text.tokenUsage)}</h2>
      <div class="metrics">
        ${renderMetric(text.tokenTotal, board.usage.totals.total_tokens || text.notRecorded)}
        ${renderMetric(text.tokenRecorded, board.usage.recorded_nodes)}
        ${renderMetric(text.tokenMissing, board.usage.missing_nodes.length)}
        ${renderMetric(text.tokenCoverage, `${board.usage.coverage_percent}%`)}
      </div>
      <p><strong>${escapeHtml(text.tokenMissing)}:</strong> ${escapeHtml(board.usage.missing_nodes.join(", ") || text.none)}</p>
      <h3>${escapeHtml(text.parallelGroups)}</h3>
      ${renderUsageGroups(board.usage.by_parallel_group, text)}
    </section>

    <section class="panel">
      <h2>${escapeHtml(text.contextUsage)} / ${escapeHtml(text.timeUsage)}</h2>
      <div class="metrics">
        ${renderMetric(text.contextTotal, board.context.totals.estimated_tokens || text.notRecorded)}
        ${renderMetric(text.contextCoverage, `${board.context.coverage_percent}%`)}
        ${renderMetric(text.elapsed, formatDuration(board.timing.elapsed_minutes, text))}
        ${renderMetric(text.estimatedRemaining, formatDuration(board.timing.estimated_remaining_minutes, text))}
        ${renderMetric(text.averageNodeTime, formatDuration(board.timing.average_node_minutes, text))}
      </div>
      <p><strong>${escapeHtml(text.contextMissing)}:</strong> ${escapeHtml(board.context.missing_nodes.join(", ") || text.none)}</p>
    </section>

    <section class="panel">
      <h2>${escapeHtml(text.nodeDetails)}</h2>
      ${detailsHtml}
    </section>

    <section class="panel">
      <h2>${escapeHtml(text.projectSnapshot)}</h2>
      <div class="detail-grid">
        <section id="main-changes">
          <h4>${escapeHtml(text.mainChanges)}</h4>
          ${renderProjectChanges(project.main_changes, text)}
        </section>
        <section>
          <h4>${escapeHtml(project.name || text.projectSnapshot)}</h4>
          <p class="muted">${escapeHtml(project.description || project.workflow_title || "")}</p>
          <dl>
            <dt>${escapeHtml(text.projectPath)}</dt><dd>${escapeHtml(project.root || text.none)}</dd>
            <dt>${escapeHtml(text.workflowFiles)}</dt><dd>${escapeHtml(project.relative_workflow_dir || text.none)}</dd>
            <dt>${escapeHtml(text.gitBranch)}</dt><dd>${escapeHtml(git.branch || text.none)}</dd>
            <dt>${escapeHtml(text.gitCommit)}</dt><dd>${escapeHtml(git.commit || text.none)}</dd>
            <dt>${escapeHtml(text.gitDirty)}</dt><dd>${escapeHtml(git.dirty ? text.dirty : text.clean)}</dd>
          </dl>
        </section>
        <section>
          <h4>${escapeHtml(text.activeChanges)}</h4>
          ${renderStatusItems(git.status, text.noActiveChanges)}
        </section>
        <section>
          <h4>${escapeHtml(text.keyFiles)}</h4>
          <p>${renderInlineItems(keyFileItems, text.none)}</p>
        </section>
        <section>
          <h4>${escapeHtml(text.recentCommits)}</h4>
          ${renderList(git.recent_commits, text.none)}
        </section>
        <section>
          <h4>${escapeHtml(text.topLevel)}</h4>
          <p>${renderInlineItems(topLevelItems, text.none)}</p>
        </section>
      </div>
    </section>

    <section class="grid-2" id="flow-collaboration">
      <div class="panel">
        <h2>${escapeHtml(text.flowMap)}</h2>
        <p class="muted">${escapeHtml(text.flowHelp)}</p>
        <h3>${escapeHtml(text.dependencies)}</h3>
        ${renderEdgeList(board.flow.dependency_edges, text.noEdges)}
        <h3>${escapeHtml(text.rejectEdges)}</h3>
        ${renderEdgeList(board.flow.reject_edges, text.noRejectEdges)}
      </div>
      <div class="panel">
        <h2>${escapeHtml(text.collaborationLanes)}</h2>
        <p class="muted">${escapeHtml(text.collaborationHelp)}</p>
        <div class="lanes">
          ${board.collaboration.worker_profiles
            .map((lane) => `<div class="lane"><h3>${escapeHtml(lane.profile)} <span>${escapeHtml(lane.nodes.length)}</span></h3><p><strong>${escapeHtml(text.nodes)}:</strong> ${renderNodeLinks(lane.nodes, text)}</p><p><strong>${escapeHtml(text.statusBreakdown)}:</strong> ${renderStatusCounts(lane.counts, text)}</p></div>`)
            .join("")}
        </div>
        <p><strong>${escapeHtml(text.unclaimedReady)}:</strong> ${renderNodeLinks(board.collaboration.unclaimed_ready, text)}</p>
        <p><strong>${escapeHtml(text.claimedRunning)}:</strong></p>
        ${renderClaimedItems(board.collaboration.claimed_running, text)}
        <p><strong>${escapeHtml(text.leases)}:</strong></p>
        ${renderLeaseItems(board.collaboration.leases, text)}
      </div>
    </section>

    <section class="panel">
      <h2>${escapeHtml(text.workBoard)}</h2>
      <div class="board">${columnsHtml}</div>
    </section>

    <section class="grid-2">
      <div class="panel">
        <h2>${escapeHtml(text.riskPanel)}</h2>
        <h3>${escapeHtml(text.blockers)}</h3>${renderList(board.risks.blockers, text.none)}
        <h3>${escapeHtml(text.failedHandoffs)}</h3>${renderList(board.risks.failed_handoffs, text.none)}
        <h3>${escapeHtml(text.retryAlerts)}</h3>${renderList(board.risks.retry_alerts, text.none)}
        <h3>${escapeHtml(text.skippedRequired)}</h3>${renderList(board.risks.skipped_required, text.none)}
        <h3>${escapeHtml(text.decisions)}</h3>${renderList(board.risks.decisions, text.none)}
      </div>
      <div class="panel">
        <h2>${escapeHtml(text.recentEvents)}</h2>
        <p class="muted">${escapeHtml(text.timelineHelp)}</p>
        <div class="event-list">${renderRecentEvents(board.recent_events, text)}</div>
      </div>
    </section>

    <details class="panel technical-data">
      <summary>${escapeHtml(text.technicalData)}</summary>
      <h2>${escapeHtml(text.rawProjection)}</h2>
      <pre>${escapeHtml(JSON.stringify(board, null, 2))}</pre>
    </details>
  </main>
  <script>
    (() => {
      const labels = {
        all: ${JSON.stringify(text.total)},
        showing: ${JSON.stringify(text.showingStatus)},
        clear: ${JSON.stringify(text.clearFilter)},
        none: ${JSON.stringify(text.none)}
      };
      const filterStatus = document.getElementById("filter-status");
      const metricButtons = [...document.querySelectorAll("[data-filter-status]")];
      const statusLabels = new Map(${JSON.stringify(COLUMN_STATUSES.map((status) => [status, statusTitle(status, text)]))});

      function setFilter(status) {
        const active = status && status !== "all" ? status : null;
        metricButtons.forEach((button) => {
          button.setAttribute("aria-pressed", button.dataset.filterStatus === (active || "all") ? "true" : "false");
        });
        document.querySelectorAll("[data-status]").forEach((item) => {
          item.classList.toggle("is-hidden", Boolean(active) && item.dataset.status !== active);
        });
        if (filterStatus) {
          filterStatus.textContent = active ? labels.showing + ": " + (statusLabels.get(active) || active) + ". " + labels.clear : "";
          filterStatus.dataset.active = active || "";
        }
        const target = active ? document.getElementById("status-" + active) : document.getElementById("task-tracker");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      function focusNode(nodeId) {
        if (!nodeId) return;
        document.querySelectorAll(".is-focused").forEach((item) => item.classList.remove("is-focused"));
        const detail = document.getElementById("node-" + nodeId);
        if (detail) {
          detail.open = true;
          detail.classList.add("is-focused");
          detail.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        document.querySelector('[data-node-id="' + nodeId + '"].task-row')?.classList.add("is-focused");
        document.getElementById("card-" + nodeId)?.classList.add("is-focused");
      }

      metricButtons.forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filterStatus)));
      filterStatus?.addEventListener("click", () => setFilter("all"));
      document.addEventListener("click", (event) => {
        const anchor = event.target.closest('a[href^="#node-"]');
        if (!anchor) return;
        const nodeId = anchor.getAttribute("href").replace("#node-", "");
        window.setTimeout(() => focusNode(nodeId), 0);
      });
      if (window.location.hash.startsWith("#node-")) {
        focusNode(window.location.hash.replace("#node-", ""));
      }
    })();
  </script>
  <script type="application/json" id="board-data">${escapeInlineJson(board)}</script>
</body>
</html>
`;
}

function writeBoard(workflowDir, board) {
  const jsonPath = path.join(workflowDir, "board.json");
  const htmlPath = path.join(workflowDir, "board.html");
  writeJson(jsonPath, board);
  fs.writeFileSync(htmlPath, renderBoardHtml(board));
  return { jsonPath, htmlPath };
}

function openFile(file) {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", file] : [file];
  const result = spawnSync(command, args, { stdio: "ignore", detached: true });
  return !result.error && result.status === 0;
}

function resolveHandoffPath(workflowDir, handoffArg) {
  if (!handoffArg) throw new Error("--handoff is required");
  const absolute = path.isAbsolute(handoffArg) ? handoffArg : path.resolve(process.cwd(), handoffArg);
  if (fs.existsSync(absolute)) return absolute;
  const inWorkflow = path.join(workflowDir, handoffArg);
  if (fs.existsSync(inWorkflow)) return inWorkflow;
  throw new Error(`Cannot find handoff file: ${handoffArg}`);
}

function requireNode(graph, nodeId) {
  const node = nodeMap(graph).get(nodeId);
  if (!node) throw new Error(`Unknown node: ${nodeId}`);
  return node;
}

function resetDependents(graph, state, nodeId, excluded = new Set()) {
  for (const node of graph.nodes) {
    if (!node.depends_on.includes(nodeId) || excluded.has(node.id)) continue;
    const entry = state.nodes[node.id];
    if (["ready", "running", "passed", "skipped"].includes(entry.status)) {
      state.nodes[node.id] = stateEntry("pending", `Reset after rejection to ${nodeId}`, entry.last_handoff || null);
    }
    resetDependents(graph, state, node.id, excluded);
  }
}

function cmdInit(positional, options) {
  const title = positional.join(" ").trim();
  if (!title) throw new Error("init requires a workflow title");

  const templateId = options.template ? String(options.template) : DEFAULT_TEMPLATE_ID;
  const template = loadWorkflowTemplate(templateId);
  const mode = options.mode ? String(options.mode) : template.default_mode || DEFAULT_MODE;
  if (!MODES.has(mode)) throw new Error(`--mode must be one of ${[...MODES].join(", ")}`);
  const language = options.lang ? normalizeBoardLanguage(options.lang) : inferLanguageFromText(title);

  const workflowId = options.id ? slugify(options.id) : `${dateStamp()}-${slugify(title)}`;
  const workflowDir = path.join(workflowsRoot(), workflowId);
  if (fs.existsSync(workflowDir)) throw new Error(`Workflow already exists: ${workflowId}`);

  const templateErrors = validateWorkflowTemplate(template);
  if (templateErrors.length > 0) throw new Error(templateErrors.join("\n"));
  const graph = compileTemplateToGraph(template, {
    templateId,
    workflowId,
    title,
    mode,
    language,
  });
  const graphErrors = validateGraph(graph);
  if (graphErrors.length > 0) throw new Error(graphErrors.join("\n"));

  ensureDir(path.join(workflowDir, "nodes"));
  ensureDir(path.join(workflowDir, "handoffs"));
  ensureDir(path.join(workflowDir, "evidence", "screenshots"));
  writeJson(path.join(workflowDir, "graph.json"), graph);
  writeJson(path.join(workflowDir, "state.json"), initialState(graph));
  for (const node of graph.nodes) writeJson(path.join(workflowDir, "nodes", `${node.id}.json`), nodeCard(graph, node));
  fs.writeFileSync(path.join(workflowDir, "decisions.md"), `# Decisions\n\nWorkflow: ${workflowId}\n\n`);
  fs.writeFileSync(path.join(workflowDir, "blockers.md"), `# Blockers\n\nWorkflow: ${workflowId}\n\n`);
  appendLedger(workflowDir, { event: "workflow.init", workflow_id: workflowId, title, mode, template_id: templateId, language });

  const { graph: savedGraph, state } = loadWorkflow(workflowDir);
  console.log(`Workflow created: ${workflowId}`);
  console.log(`Path: ${path.relative(process.cwd(), workflowDir)}`);
  printStatus(savedGraph, state);
}

function cmdStatus(options) {
  const { graph, state } = loadWorkflow(resolveWorkflowDir(options));
  printStatus(graph, state);
}

function cmdNext(options) {
  const { graph, state } = loadWorkflow(resolveWorkflowDir(options));
  const ready = readyNodes(graph, state);
  if (ready.length === 0) {
    console.log("No ready nodes.");
    return;
  }
  for (const node of ready) console.log(formatNode(node));
}

function cmdValidate(options) {
  const workflowDir = resolveWorkflowDir(options);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const graph = readJson(path.join(workflowDir, "graph.json"));
  console.log(`Workflow valid: ${graph.workflow_id}`);
}

function cmdTemplates(positional, options) {
  const action = positional[0] || "list";
  const language = normalizeBoardLanguage(options.lang);
  if (action === "validate") {
    const templates = listWorkflowTemplates();
    const errors = templates.flatMap((template) => validateWorkflowTemplate(template));
    if (errors.length > 0) throw new Error(errors.join("\n"));
    console.log(`Workflow templates valid: ${templates.length}`);
    return;
  }
  if (action === "show") {
    const templateId = positional[1];
    if (!templateId) throw new Error("templates show requires a template id");
    const template = loadWorkflowTemplate(templateId);
    const errors = validateWorkflowTemplate(template);
    if (errors.length > 0) throw new Error(errors.join("\n"));
    const graph = compileTemplateToGraph(template, {
      templateId,
      workflowId: "preview",
      title: localizedValue(template.name, language) || templateId,
      mode: template.default_mode || DEFAULT_MODE,
      language,
    });
    console.log(JSON.stringify({
      template_id: template.template_id,
      template_version: template.template_version,
      name: localizedValue(template.name, language),
      description: localizedValue(template.description, language),
      layers: template.layers || {},
      nodes: graph.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        title: node.title,
        depends_on: node.depends_on,
        agent: node.agent || node.worker_profile || null,
        model_tier: node.model_tier || defaultNodePolicy(node).model_tier,
        task_complexity: node.task_complexity || defaultNodePolicy(node).task_complexity,
      })),
    }, null, 2));
    return;
  }
  if (action !== "list") throw new Error(`Unknown templates action: ${action}`);
  const templates = listWorkflowTemplates();
  for (const template of templates) {
    const name = localizedValue(template.name, language) || template.template_id;
    const description = localizedValue(template.description, language) || "";
    console.log(`${template.template_id} (${template.default_mode || DEFAULT_MODE}) - ${name}${description ? `: ${description}` : ""}`);
  }
}

function cmdScorecard(options) {
  const workflowDir = resolveWorkflowDir(options);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const { graph, state } = loadWorkflow(workflowDir);
  const language = resolveWorkflowLanguage(options, graph, loadHandoffs(workflowDir));
  const board = buildBoardProjection(workflowDir, graph, state, language);
  const text = boardText(language);
  console.log(`${text.scorecard}: ${board.workflow_id}`);
  console.log(`${text.score}: ${board.scorecard.score_percent}%`);
  console.log(`${text.scorecardPassed}: ${board.scorecard.counts.passed || 0}`);
  console.log(`${text.scorecardFailed}: ${board.scorecard.counts.failed || 0}`);
  console.log(`${text.scorecardWarnings}: ${board.scorecard.counts.warning || 0}`);
  console.log(`${text.scorecardPending}: ${board.scorecard.counts.pending || 0}`);
  for (const check of board.scorecard.checks) {
    const nodes = check.node_ids?.length ? ` [${check.node_ids.join(", ")}]` : "";
    console.log(`- ${check.status} ${check.severity} ${check.title}${nodes}: ${check.detail}`);
  }
}

function cmdResume(options) {
  const workflowDir = resolveWorkflowDir(options);
  const { graph, state } = loadWorkflow(workflowDir);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  console.log("Resume context:");
  printStatus(graph, state);
  const recent = readRecentLedger(workflowDir);
  console.log("Recent ledger events:");
  if (recent.length === 0) {
    console.log("none");
  } else {
    for (const line of recent) console.log(line);
  }
}

function cmdBoard(options) {
  const workflowDir = resolveWorkflowDir(options);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) {
    throw new Error(`${errors.join("\n")}\nRun validate and fix workflow artifacts before rendering the board.`);
  }
  const { graph, state } = loadWorkflow(workflowDir);
  const language = resolveWorkflowLanguage(options, graph, loadHandoffs(workflowDir));
  const board = buildBoardProjection(workflowDir, graph, state, language);
  const { jsonPath, htmlPath } = writeBoard(workflowDir, board);

  console.log(`Workflow board generated: ${graph.workflow_id}`);
  console.log(`JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`HTML: ${path.relative(process.cwd(), htmlPath)}`);
  console.log(`Next recommended action: ${board.summary.next_recommended_action}`);
  if (options.open) {
    if (openFile(htmlPath)) {
      console.log("Opened board in the default browser.");
    } else {
      console.log(`Could not open the browser automatically. Open: ${htmlPath}`);
    }
  }
}

function cmdStart(positional, options) {
  const nodeId = positional[0];
  if (!nodeId) throw new Error("start requires a node id");
  const workflowDir = resolveWorkflowDir(options);
  const { graph, state } = loadWorkflow(workflowDir);
  requireNode(graph, nodeId);
  const entry = state.nodes[nodeId];
  if (entry.status !== "ready") throw new Error(`Node ${nodeId} is ${entry.status}, not ready`);
  const startedAt = now();
  state.nodes[nodeId] = stateEntry("running", "Started", entry.last_handoff || null, {
    started_at: entry.started_at || startedAt,
    completed_at: null,
  });
  markActive(state, nodeId);
  saveState(workflowDir, state);
  appendLedger(workflowDir, { at: startedAt, event: "node.start", node_id: nodeId });
  printStatus(graph, state);
}

function cmdComplete(positional, options) {
  const nodeId = positional[0];
  if (!nodeId) throw new Error("complete requires a node id");
  const workflowDir = resolveWorkflowDir(options);
  const { graph, state } = loadWorkflow(workflowDir);
  requireNode(graph, nodeId);
  if (!["ready", "running"].includes(state.nodes[nodeId].status)) {
    throw new Error(`Node ${nodeId} is ${state.nodes[nodeId].status}, not ready or running`);
  }
  const handoffPath = resolveHandoffPath(workflowDir, options.handoff);
  const handoff = readJson(handoffPath);
  const errors = validateHandoff(graph, handoff);
  if (handoff.node_id !== nodeId) errors.push(`handoff.node_id must be ${nodeId}`);
  if (handoff.status !== "passed") errors.push("complete requires a passed handoff");
  if (errors.length > 0) throw new Error(errors.join("\n"));

  const completedAt = now();
  const previousEntry = state.nodes[nodeId];
  const relativeHandoff = relativeToWorkflow(workflowDir, handoffPath);
  state.nodes[nodeId] = stateEntry("passed", null, relativeHandoff, {
    started_at: previousEntry.started_at || handoff.timing?.started_at || completedAt,
    completed_at: handoff.timing?.completed_at || completedAt,
  });
  clearActive(state, nodeId);
  recalculateReady(graph, state);
  saveState(workflowDir, state);
  appendLedger(workflowDir, {
    at: completedAt,
    event: "node.complete",
    node_id: nodeId,
    handoff: relativeHandoff,
    token_usage: handoff.token_usage || null,
    context_usage: handoff.context_usage || null,
  });
  printStatus(graph, state);
}

function cmdReject(positional, options) {
  const nodeId = positional[0];
  const rejectTo = options.to;
  if (!nodeId) throw new Error("reject requires a node id");
  if (!rejectTo) throw new Error("reject requires --to <node-id>");
  const workflowDir = resolveWorkflowDir(options);
  const { graph, state } = loadWorkflow(workflowDir);
  requireNode(graph, nodeId);
  const target = requireNode(graph, rejectTo);
  const handoffPath = resolveHandoffPath(workflowDir, options.handoff);
  const handoff = readJson(handoffPath);
  const errors = validateHandoff(graph, handoff);
  if (handoff.node_id !== nodeId) errors.push(`handoff.node_id must be ${nodeId}`);
  if (handoff.status !== "failed") errors.push("reject requires a failed handoff");
  if (handoff.reject_to !== rejectTo) errors.push(`handoff.reject_to must be ${rejectTo}`);
  if (errors.length > 0) throw new Error(errors.join("\n"));

  const completedAt = now();
  const edge = `${nodeId}->${rejectTo}`;
  const retryCount = (state.retry_edges[edge] || 0) + 1;
  state.retry_edges[edge] = retryCount;
  const relativeHandoff = relativeToWorkflow(workflowDir, handoffPath);
  state.nodes[nodeId] = stateEntry("failed", handoff.reason, relativeHandoff, {
    started_at: state.nodes[nodeId].started_at || handoff.timing?.started_at || completedAt,
    completed_at: handoff.timing?.completed_at || completedAt,
  });
  state.nodes[rejectTo] = stateEntry("ready", `Rejected by ${nodeId}: ${handoff.required_fix}`, state.nodes[rejectTo].last_handoff || null);
  resetDependents(graph, state, rejectTo, new Set([nodeId]));
  if (retryCount > target.retry_limit) {
    state.nodes[rejectTo] = stateEntry(
      "blocked",
      `Retry limit exceeded for ${edge}; requires human decision or design review`,
      state.nodes[rejectTo].last_handoff || null,
    );
  }
  clearActive(state, nodeId, rejectTo);
  saveState(workflowDir, state);
  appendLedger(workflowDir, {
    at: completedAt,
    event: "node.reject",
    node_id: nodeId,
    reject_to: rejectTo,
    retry_count: retryCount,
    handoff: relativeHandoff,
    token_usage: handoff.token_usage || null,
    context_usage: handoff.context_usage || null,
  });
  printStatus(graph, state);
}

function cmdBlock(positional, options) {
  const nodeId = positional[0];
  const reason = options.reason;
  if (!nodeId) throw new Error("block requires a node id");
  if (!reason) throw new Error("block requires --reason <text>");
  const workflowDir = resolveWorkflowDir(options);
  const { graph, state } = loadWorkflow(workflowDir);
  requireNode(graph, nodeId);
  const entry = state.nodes[nodeId];
  const completedAt = now();
  state.nodes[nodeId] = stateEntry("blocked", String(reason), entry.last_handoff || null, {
    started_at: entry.started_at || completedAt,
    completed_at: completedAt,
  });
  clearActive(state, nodeId);
  saveState(workflowDir, state);
  appendLedger(workflowDir, { at: completedAt, event: "node.block", node_id: nodeId, reason: String(reason) });
  appendText(path.join(workflowDir, "blockers.md"), `- ${now()} ${nodeId}: ${reason}\n`);
  printStatus(graph, state);
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(commandHelp());
    return;
  }

  const { positional, options } = parseArgs(rest);
  switch (command) {
    case "init":
      cmdInit(positional, options);
      return;
    case "templates":
      cmdTemplates(positional, options);
      return;
    case "status":
      cmdStatus(options);
      return;
    case "next":
      cmdNext(options);
      return;
    case "validate":
      cmdValidate(options);
      return;
    case "scorecard":
      cmdScorecard(options);
      return;
    case "resume":
      cmdResume(options);
      return;
    case "board":
      cmdBoard(options);
      return;
    case "start":
      cmdStart(positional, options);
      return;
    case "complete":
      cmdComplete(positional, options);
      return;
    case "reject":
      cmdReject(positional, options);
      return;
    case "block":
      cmdBlock(positional, options);
      return;
    default:
      throw new Error(`Unknown command: ${command}\n${commandHelp()}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
