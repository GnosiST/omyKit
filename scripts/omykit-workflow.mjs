#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = "1";
const WORKFLOW_ARTIFACT_VERSION = "2026-06-24.intent-orchestration";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_TEMPLATE_ID = "change.standard";
const AUTO_TEMPLATE_ID = "auto";
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
const EVOLUTION_SCOPES = new Set(["generic_omykit", "project_local", "one_off", "volatile_ecosystem"]);
const EVOLUTION_PROMOTION_STATUSES = new Set(["candidate", "promoted", "not_promoted", "needs_review"]);
const CAPABILITY_GAP_INTEGRATION_PATHS = new Set(["local_only", "project_local", "omykit_candidate_branch", "main_after_review", "not_integrated"]);
const CAPABILITY_GAP_STATUSES = new Set(["observed", "trial_needed", "trialing", "resolved", "not_adopted"]);
const EXECUTION_SURFACES = new Set(["main-thread", "subagent", "background_thread", "thread_worktree"]);
const ASSIGNMENT_STATUSES = new Set(["planned", "running", "handoff_received", "passed", "failed", "blocked", "cancelled"]);
const KNOWLEDGE_SYNC_STATUSES = new Set(["completed", "not_needed", "deferred"]);
const SKILL_DECISION_OUTCOMES = new Set(["effective", "needs_revision", "switched", "not_evaluated"]);
const SKILL_FEEDBACK_STATUSES = new Set(["accepted", "needs_revision", "rejected", "not_reviewed"]);
const SKILL_ALTERNATIVE_DECISIONS = new Set(["backup", "rejected", "next_retry", "selected"]);
const INTAKE_CONFIRMATION_STATUSES = new Set(["pending", "confirmed", "auto_authorized", "changed", "rejected"]);
const USAGE_OBSERVATION_STATUSES = new Set(["recorded", "unavailable", "not_applicable", "not_recorded"]);
const AGENT_ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{1,80}$/;
const ESTIMATED_BYTES_PER_TOKEN = 4;
const LARGE_TASK_CONTRACT_ESTIMATED_TOKENS = 1500;
const LARGE_CONTEXT_PACK_ESTIMATED_TOKENS = 6000;
const OMYKIT_RUNTIME_DIR = ".omykit";
const OMYKIT_LOCAL_IGNORE_BLOCK = [
  "# omyKit local runtime state (do not commit)",
  `${OMYKIT_RUNTIME_DIR}/`,
  "",
].join("\n");
const ROOT_WORKFLOW_ARTIFACT_NAMES = [
  "active-workflow",
  "assignments.jsonl",
  "blockers.md",
  "board.html",
  "board.json",
  "commands",
  "context-packs",
  "decisions.md",
  "evidence",
  "graph.json",
  "handoffs",
  "ledger.jsonl",
  "nodes",
  "orchestration-plan.json",
  "state.json",
  "workflow-upgrade.json",
  "workflows",
];
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
  "recommended_model",
  "recommended_model_reason",
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
    orchestrationPlan: "Current Orchestration Plan",
    activePattern: "Active pattern",
    executionMode: "Execution mode",
    continue: "Continue",
    humanRequired: "Human intervention",
    triggerReasons: "Trigger reasons",
    actions: "Actions",
    fanOutGroups: "Fan-out groups",
    joinTargets: "Join targets",
    waitingOn: "Waiting on",
    dispatchBatch: "Dispatch batch",
    collaborationLanes: "Collaboration Lanes",
    agentRoster: "Agent Roster",
    assignments: "Assignments",
    executionSurface: "Execution surface",
    threadId: "Thread ID",
    worktreePath: "Worktree",
    writeScope: "Write scope",
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
    owner: "Owner",
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
    intakeDecision: "Intake Decision",
    goal: "Goal",
    route: "Route",
    workflowShape: "Workflow shape",
    controller: "Controller",
    controllerRole: "Controller role",
    enabled: "enabled",
    disabled: "disabled",
    assumptions: "Assumptions",
    questions: "Questions",
    answer: "Answer",
    customAnswersAllowed: "Custom answers allowed",
    executionOptions: "Execution Options",
    selectedOption: "Selected option",
    confirmation: "Confirmation",
    recommended: "recommended",
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
    skillsUsed: "Skills Used",
    skillUsage: "Skill Usage",
    skillCoverage: "Skill coverage",
    skillRecorded: "Recorded nodes",
    skillMissing: "Missing skill records",
    skillDecisions: "Skill Decisions",
    skillDecisionCoverage: "Skill decision coverage",
    skillDecisionRecorded: "Decision records",
    skillDecisionMissing: "Missing skill decisions",
    capability: "Capability",
    selectedSkill: "Selected skill",
    alternatives: "Alternatives",
    fallbackPolicy: "Fallback policy",
    userFeedback: "User feedback",
    outcome: "Outcome",
    selectionBasis: "Selection basis",
    noSkillDecisions: "No skill decisions recorded",
    tokenUsage: "Token Usage",
    tokenTotal: "Total tokens",
    tokenRecorded: "Recorded nodes",
    tokenMissing: "Missing token records",
    tokenUnavailable: "Unavailable token records",
    tokenCoverage: "Token coverage",
    tokenValueCoverage: "Exact token coverage",
    usageObservation: "Usage Observation",
    contextUsage: "Context Usage",
    contextCoverage: "Context coverage",
    contextTotal: "Approx context tokens",
    contextMissing: "Missing context records",
    contextRecorded: "Measured nodes",
    contextBytes: "Context bytes",
    contextInputFiles: "Input files",
    contextSources: "Context sources",
    taskSize: "Task Size",
    taskSizeTotal: "Approx task tokens",
    taskSizeBytes: "Task bytes",
    contextSourceBreakdown: "Context source breakdown",
    timeUsage: "Time",
    elapsed: "Elapsed",
    estimatedRemaining: "Estimated remaining",
    averageNodeTime: "Average node time",
    template: "Template",
    templateId: "Template id",
    templateVersion: "Template version",
    workflowTemplate: "Workflow Template",
    workflowEvolution: "Workflow Evolution",
    knowledgeSync: "Knowledge Sync",
    knowledgeSyncReviews: "Knowledge sync reviews",
    knowledgeSyncStatus: "Status",
    knowledgeSyncSkill: "Skill",
    knowledgeFilesReviewed: "Files reviewed",
    knowledgeFilesUpdated: "Files updated",
    knowledgeMemoryUpdated: "Memory updated",
    evolutionCandidates: "Evolution Candidates",
    capabilityGaps: "Capability Gaps",
    capabilityGapCandidates: "Gap candidates",
    noCapabilityGaps: "No capability gaps recorded",
    integrationPath: "Integration path",
    candidateTool: "Candidate tool",
    currentGap: "Current gap",
    trialPlan: "Trial plan",
    decisionReason: "Decision reason",
    genericCandidates: "Generic candidates",
    missingEvolutionReview: "Missing evolution review",
    noEvolutionCandidates: "No evolution candidates recorded",
    evolutionScope: "Scope",
    promotionStatus: "Promotion status",
    updateSurface: "Update surface",
    lesson: "Lesson",
    rationale: "Rationale",
    nextAction: "Next action",
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
    recommendedModel: "Recommended model",
    actualModel: "Actual model",
    modelUsage: "Model Usage",
    modelRecorded: "Recorded actual-model nodes",
    modelMissing: "Missing actual-model records",
    modelUnavailable: "Unavailable actual-model records",
    modelCoverage: "Actual-model coverage",
    modelValueCoverage: "Exact actual-model coverage",
    noModelsRecorded: "No model records",
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
    noSkillsUsed: "No skills recorded",
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
    handoffPackets: "Handoff Packets",
    contextPack: "Context pack",
    downstreamContext: "Downstream context",
    commandRuns: "Command Runs",
    activeCommandRuns: "Active command runs",
    resumableCommandRuns: "Resumable command runs",
    command: "Command",
    label: "Label",
    pid: "PID",
    log: "Log",
    resumeCommand: "Resume command",
    taskInbox: "Task Inbox",
    taskBrief: "Brief",
    taskDecision: "Decision",
    taskRelation: "Relation",
    taskWorkstream: "Workstream",
    taskConflictRisk: "Conflict risk",
    taskMergeGate: "Merge Gate",
    workstreams: "Workstreams",
    conflicts: "Conflicts",
    conflictArbiter: "Conflict Arbiter",
    tags: "Tags",
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
    orchestrationPlan: "当前编排计划",
    activePattern: "当前协作形态",
    executionMode: "执行模式",
    continue: "自动继续",
    humanRequired: "人工介入",
    triggerReasons: "触发原因",
    actions: "动作",
    fanOutGroups: "扇出组",
    joinTargets: "汇聚目标",
    waitingOn: "等待项",
    dispatchBatch: "派发批次",
    collaborationLanes: "协作泳道",
    agentRoster: "Agent 通讯录",
    assignments: "任务分配",
    executionSurface: "执行面",
    threadId: "Thread ID",
    worktreePath: "Worktree",
    writeScope: "写入范围",
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
    owner: "负责人",
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
    intakeDecision: "入口决策",
    goal: "目标",
    route: "路由",
    workflowShape: "执行形态",
    controller: "控制器",
    controllerRole: "控制器角色",
    enabled: "已启用",
    disabled: "未启用",
    assumptions: "关键假设",
    questions: "问题",
    answer: "答案",
    customAnswersAllowed: "允许自定义答案",
    executionOptions: "执行方案",
    selectedOption: "已选方案",
    confirmation: "确认状态",
    recommended: "推荐",
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
    skillsUsed: "使用的 Skills",
    skillUsage: "Skill 使用记录",
    skillCoverage: "Skill 覆盖率",
    skillRecorded: "已记录节点",
    skillMissing: "未记录 skill 的节点",
    skillDecisions: "Skill 选择决策",
    skillDecisionCoverage: "Skill 决策覆盖率",
    skillDecisionRecorded: "已记录决策",
    skillDecisionMissing: "缺少 skill 决策",
    capability: "能力线",
    selectedSkill: "选用 Skill",
    alternatives: "候选替代",
    fallbackPolicy: "替换策略",
    userFeedback: "用户反馈",
    outcome: "结果",
    selectionBasis: "选择依据",
    noSkillDecisions: "未记录 skill 选择决策",
    tokenUsage: "Token 消耗",
    tokenTotal: "总 token",
    tokenRecorded: "已记录节点",
    tokenMissing: "未记录 token 的节点",
    tokenUnavailable: "不可观测 token 的节点",
    tokenCoverage: "Token 覆盖率",
    tokenValueCoverage: "精确 token 覆盖率",
    usageObservation: "用量观测",
    contextUsage: "上下文用量",
    contextCoverage: "上下文覆盖率",
    contextTotal: "估算上下文 token",
    contextMissing: "未记录上下文的节点",
    contextRecorded: "已测量节点",
    contextBytes: "上下文字节",
    contextInputFiles: "输入文件",
    contextSources: "上下文来源",
    taskSize: "任务大小",
    taskSizeTotal: "估算任务 token",
    taskSizeBytes: "任务字节",
    contextSourceBreakdown: "上下文来源分布",
    timeUsage: "时间",
    elapsed: "已用时",
    estimatedRemaining: "预计剩余",
    averageNodeTime: "平均节点耗时",
    template: "模板",
    templateId: "模板 ID",
    templateVersion: "模板版本",
    workflowTemplate: "工作流模板",
    workflowEvolution: "Workflow 进化",
    knowledgeSync: "知识同步",
    knowledgeSyncReviews: "知识同步审查",
    knowledgeSyncStatus: "状态",
    knowledgeSyncSkill: "Skill",
    knowledgeFilesReviewed: "已审查文件",
    knowledgeFilesUpdated: "已更新文件",
    knowledgeMemoryUpdated: "已更新记忆",
    evolutionCandidates: "进化候选",
    capabilityGaps: "能力缺口",
    capabilityGapCandidates: "缺口候选",
    noCapabilityGaps: "未记录能力缺口",
    integrationPath: "接入路径",
    candidateTool: "候选工具",
    currentGap: "当前缺口",
    trialPlan: "试验计划",
    decisionReason: "决策原因",
    genericCandidates: "通用候选",
    missingEvolutionReview: "缺少进化复盘",
    noEvolutionCandidates: "未记录进化候选",
    evolutionScope: "适用范围",
    promotionStatus: "提升状态",
    updateSurface: "更新位置",
    lesson: "经验",
    rationale: "理由",
    nextAction: "下一步",
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
    recommendedModel: "推荐模型",
    actualModel: "实际模型",
    modelUsage: "模型使用记录",
    modelRecorded: "已记录实际模型节点",
    modelMissing: "未记录实际模型的节点",
    modelUnavailable: "不可观测实际模型的节点",
    modelCoverage: "实际模型覆盖率",
    modelValueCoverage: "精确实际模型覆盖率",
    noModelsRecorded: "未记录模型",
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
    noSkillsUsed: "未记录使用的 skills",
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
    handoffPackets: "交接包",
    contextPack: "上下文包",
    downstreamContext: "下游上下文",
    commandRuns: "后台命令",
    activeCommandRuns: "运行中命令",
    resumableCommandRuns: "可续接命令",
    command: "命令",
    label: "说明",
    pid: "PID",
    log: "日志",
    resumeCommand: "续接命令",
    taskInbox: "任务收件箱",
    taskBrief: "任务摘要",
    taskDecision: "决策",
    taskRelation: "关系",
    taskWorkstream: "工作流组",
    taskConflictRisk: "冲突风险",
    taskMergeGate: "合并门禁",
    workstreams: "工作流组",
    conflicts: "冲突",
    conflictArbiter: "冲突仲裁",
    tags: "标签",
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

function jsonBytes(value) {
  return Buffer.byteLength(JSON.stringify(value ?? null, null, 2), "utf8");
}

function estimateTokensFromBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  return Math.max(1, Math.ceil(bytes / ESTIMATED_BYTES_PER_TOKEN));
}

function fileSizeIfExists(file) {
  try {
    return fs.existsSync(file) ? fs.statSync(file).size : null;
  } catch {
    return null;
  }
}

function workflowsRoot(cwd = process.cwd()) {
  return path.join(cwd, OMYKIT_RUNTIME_DIR, "workflows");
}

function omykitRoot(cwd = process.cwd()) {
  return path.join(cwd, OMYKIT_RUNTIME_DIR);
}

function activeWorkflowFile(cwd = process.cwd()) {
  return path.join(omykitRoot(cwd), "active-workflow");
}

function readActiveWorkflowId(cwd = process.cwd()) {
  const file = activeWorkflowFile(cwd);
  if (!fs.existsSync(file)) return null;
  const id = fs.readFileSync(file, "utf8").trim();
  return id || null;
}

function writeActiveWorkflowId(workflowId, cwd = process.cwd()) {
  assertOmyKitNamespaceAvailable(cwd);
  ensureDir(omykitRoot(cwd));
  fs.writeFileSync(activeWorkflowFile(cwd), `${workflowId}\n`);
}

function tasksRoot(cwd = process.cwd()) {
  return path.join(omykitRoot(cwd), "tasks");
}

function tasksFile(cwd = process.cwd()) {
  return path.join(tasksRoot(cwd), "tasks.jsonl");
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

function inferWorkflowTemplateId(title) {
  const text = String(title || "").toLowerCase();
  if (/(ppt|pptx|powerpoint|presentation|slide deck|slides?|deck|keynote|pitch deck|proposal deck|演示文稿|幻灯片|路演|汇报|提案PPT|PPT提案|商业计划书PPT|融资PPT)/i.test(text)) {
    return "deck.proposal";
  }
  if (/(bug|fix|regression|error|exception|fail|failure|crash|修复|报错|故障|缺陷|失败|崩溃|回归)/i.test(text)) {
    return "bugfix.standard";
  }
  if (/(ui|ux|frontend|front-end|page|screen|layout|visual|design|figma|shadcn|tailwind|react component|界面|页面|前端|视觉|设计|组件|交互|样式)/i.test(text)) {
    return "frontend-ui.strict";
  }
  if (/(mission|orchestrat|workflow|multi-agent|parallel|fan[- ]?out|long task|complex|migration|roadmap|end[- ]?to[- ]?end|全流程|完整|复杂|长任务|工作流|多智能体|多 agent|多个|并行|扇出|汇聚|编排|协同|监听|拆解|自主推进|托管|漂移|进化|端到端|每个角色|全量验收)/i.test(text)) {
    return "mission.orchestration";
  }
  return DEFAULT_TEMPLATE_ID;
}

function inferDeckVariant(value) {
  const text = String(value || "");
  if (/(重制|重做|重建|重新设计|整体改版|整体升级|翻新|重构.*ppt|remake|rebuild|redesign|revamp|refresh|recreate)/i.test(text)) {
    return "remake";
  }
  if (/(修改|改一页|改几页|调整|新增.*页|增补.*页|补.*页|指定.*页|局部|沿用原模板|原模板风格|edit|modify|revise|update|add slide|specific slide|single slide|partial)/i.test(text)) {
    return "modify";
  }
  return "create";
}

function deckWorkstreamForVariant(variant) {
  if (variant === "remake") return "deck-remake";
  if (variant === "modify") return "deck-modify";
  return "deck-create";
}

function resolveInitTemplateId(title, requestedTemplate) {
  const requested = requestedTemplate ? String(requestedTemplate) : AUTO_TEMPLATE_ID;
  if (requested !== AUTO_TEMPLATE_ID) return requested;
  return inferWorkflowTemplateId(title);
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

function loadModelProfileDefinition(profileId) {
  if (!profileId) return null;
  const file = path.join(templatesRoot(), "common", "model-profiles.yaml");
  if (!fs.existsSync(file)) return null;
  const doc = readYaml(file);
  const profiles = Array.isArray(doc.model_profiles) ? doc.model_profiles : [];
  return profiles.find((profile) => profile.id === profileId) || null;
}

function loadSafetyLimitDefinition(limitId) {
  if (!limitId) return null;
  const file = path.join(templatesRoot(), "common", "safety-limits.yaml");
  if (!fs.existsSync(file)) return null;
  const doc = readYaml(file);
  const limits = Array.isArray(doc.safety_limits) ? doc.safety_limits : [];
  return limits.find((limit) => limit.id === limitId) || null;
}

function defaultRecommendedModel(tier, language = "en") {
  const byTier = {
    fast: {
      model: "GPT-5.4-Mini",
      reason: {
        en: "Low-cost model for simple bounded work.",
        "zh-CN": "用于简单有边界工作的低成本模型。",
      },
    },
    standard: {
      model: "GPT-5.4",
      reason: {
        en: "Stable general-purpose model for medium reasoning and ordinary delivery work.",
        "zh-CN": "适合中等推理和常规交付工作的稳定通用模型。",
      },
    },
    frontier: {
      model: "GPT-5.5",
      reason: {
        en: "Strongest general reasoning model for complex judgment, planning, and high-risk review.",
        "zh-CN": "用于复杂判断、规划和高风险评审的最强通用推理模型。",
      },
    },
  };
  const value = byTier[tier] || byTier.standard;
  return {
    model: value.model,
    reason: localizedValue(value.reason, language),
    source: "default-policy",
  };
}

function matchesModelOverride(override, nodeType, taskComplexity, modelTier) {
  if (override.node_type && override.node_type !== nodeType) return false;
  if (override.task_complexity && override.task_complexity !== taskComplexity) return false;
  if (override.tier && override.tier !== modelTier) return false;
  return true;
}

function recommendedModelForNode({ node, card, modelTier, taskComplexity, modelProfile, language }) {
  const cardRecommendationMatchesPolicy = (
    (!card.task_complexity || card.task_complexity === taskComplexity)
    && (!card.model_tier || card.model_tier === modelTier)
  );
  const explicitModel = node.recommended_model || (cardRecommendationMatchesPolicy ? card.recommended_model : null);
  const explicitReason = node.recommended_model_reason || (cardRecommendationMatchesPolicy ? card.recommended_model_reason : null);
  if (explicitModel) {
    return {
      model: explicitModel,
      reason: explicitReason || modelSelectionReason(taskComplexity, modelTier),
      source: "node",
    };
  }
  const profile = loadModelProfileDefinition(modelProfile);
  const override = (profile?.node_overrides || []).find((item) => matchesModelOverride(item, node.type, taskComplexity, modelTier));
  if (override?.model) {
    return {
      model: override.model,
      reason: localizedValue(override.reason, language) || localizedValue(override.purpose, language) || modelSelectionReason(taskComplexity, modelTier),
      source: `profile:${modelProfile}`,
    };
  }
  const profileModel = (profile?.model_map || []).find((item) => item.tier === modelTier);
  if (profileModel?.model) {
    return {
      model: profileModel.model,
      reason: localizedValue(profileModel.reason, language) || localizedValue(profileModel.purpose, language) || modelSelectionReason(taskComplexity, modelTier),
      source: `profile:${modelProfile}`,
    };
  }
  return defaultRecommendedModel(modelTier, language);
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
    "recommended_model",
    "recommended_model_reason",
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
      controller_role: "orchestrator-observer",
      language,
      template_id: template.template_id || input.templateId || DEFAULT_TEMPLATE_ID,
      template_version: template.template_version || null,
      template_name: localizedValue(template.name, language) || template.template_id || input.templateId || DEFAULT_TEMPLATE_ID,
      template_description: localizedValue(template.description, language) || null,
      template_file: template.__file || null,
      layers,
      scorecards: asStringArray(layers.scorecards),
      ...(input.metadata && typeof input.metadata === "object" ? input.metadata : {}),
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
  node scripts/omykit-workflow.mjs init "feature title" [--id workflow-id] [--mode Standard] [--template auto|change.standard|bugfix.standard|frontend-ui.strict|deck.proposal|mission.orchestration] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs tasks add "task brief" [--lang en|zh-CN] [--json]
  node scripts/omykit-workflow.mjs tasks list [--json]
  node scripts/omykit-workflow.mjs workflows [list|use <workflow-id>]
  node scripts/omykit-workflow.mjs templates [list|validate|show <template-id>] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs status [--workflow workflow-id]
  node scripts/omykit-workflow.mjs next [--workflow workflow-id]
  node scripts/omykit-workflow.mjs orchestrate [--workflow workflow-id] [--lang en|zh-CN] [--json]
  node scripts/omykit-workflow.mjs upgrade [--workflow workflow-id|--all] [--lang en|zh-CN] [--json]
  node scripts/omykit-workflow.mjs doctor [--workflow workflow-id|--all] [--fix] [--json] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs cleanup [--dry-run|--apply] [--git-removal-plan|--untrack-runtime|--reset-runtime|--uninstall-local] [--json] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs dispatch-plan [--workflow workflow-id] [--lang en|zh-CN] [--surface auto|subagent|thread|worktree|main] [--json]
  node scripts/omykit-workflow.mjs context-pack <node-id> [--workflow workflow-id] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs assign <node-id> --agent <agent-id> --surface subagent|thread|worktree|main --status planned|running|handoff_received|passed|failed|blocked|cancelled [--role <role>] [--thread <id>] [--worktree <path>] [--scope <glob,glob>] [--context-pack <path>] [--handoff <path>] [--workflow workflow-id]
  node scripts/omykit-workflow.mjs validate [--workflow workflow-id]
  node scripts/omykit-workflow.mjs scorecard [--workflow workflow-id] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs record-run <node-id> --id <run-id> --command <cmd> --status running|passed|failed|stopped [--log <path>] [--pid <pid>] [--resume <cmd>] [--workflow workflow-id]
  node scripts/omykit-workflow.mjs start <node-id> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs complete <node-id> --handoff <path> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs reject <node-id> --to <node-id> --handoff <path> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs block <node-id> --reason <text> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs unblock <node-id> [--reason <text>] [--workflow workflow-id]
  node scripts/omykit-workflow.mjs board [--workflow workflow-id] [--open] [--lang en|zh-CN]
  node scripts/omykit-workflow.mjs resume [--workflow workflow-id]

Codex chat intents:
  $omykit 开始执行：<任务>       create or resume a tracked workflow and keep advancing nodes
  $omykit 修 bug / 做需求：<任务> first record the request in the task inbox, then merge, follow up, or create a workflow as the controller decides
  $omykit 做/生成/重制/修改 PPT：<任务> auto-route to deck.proposal and classify deck_variant=create|remake|modify
  $omykit 创建工作流：<任务>     create a workflow, then continue unless you say "只创建"
  $omykit 只创建工作流：<任务>   create the workflow skeleton only
  $omykit 继续工作流             resume, auto-orchestrate, start ready work, and write handoffs as work completes
  $omykit 查看工作流列表         list workflows and switch the active workflow when needed
  $omykit 解除阻塞               unblock a blocked node after the blocker is resolved
  $omykit 下一步                 show the orchestration decision, not only a raw ready node
  $omykit 查看进度               show status, blockers, failed nodes, and the automatic next action
  $omykit 生成看板并打开         generate/open board.html
  $omykit 升级旧工作流           upgrade old workflow artifacts to the current controller surface
  $omykit 诊断工作流健康         inspect project workflow health, legacy artifacts, residual files, and next actions
  $omykit 清理旧工作流残留       dry-run safe cleanup candidates, archive them, or uninstall local workflow runtime when explicitly applied
  $omykit 撤回已提交的工作流运行态  plan or stage removal of tracked .omykit runtime without rewriting history
  $omykit 卸载本项目 omyKit 运行状态  move .omykit/ runtime state to a local non-project archive
  $omykit scorecard 验票         audit recorded workflow evidence
  $omykit 收尾 / 整理文档        review docs/AGENTS/memory sync and record delivery knowledge_sync
  $omykit 查看模板               list reusable workflow templates

Pre-execution gate:
  Before real execution, Codex should present 2-3 viable options, recommend one, explain tradeoffs, and wait for user confirmation or explicit auto-authorization. The controller records execution_options, selected_option, and confirmation in the intake handoff.

Long task loop:
  init/resume -> orchestrate -> start or dispatch ready work internally -> do real work -> write handoff JSON -> complete/reject/block/unblock -> repeat until delivery passes or a real blocker is recorded.

Internal commands:
  tasks, dispatch-plan, context-pack, assign, record-run, start, complete, reject, block, and unblock are controller primitives Codex should run as needed. Users normally ask for intent, not these primitives.`;
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

function listAllWorkflowDirs(root = workflowsRoot()) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .sort();
}

function healthRoot(cwd = process.cwd()) {
  return path.join(omykitRoot(cwd), "health");
}

function healthReportFile(cwd = process.cwd()) {
  return path.join(healthRoot(cwd), "health-report.json");
}

function archiveRoot(cwd = process.cwd()) {
  return path.join(omykitRoot(cwd), "archive");
}

function omyKitNamespaceStatus(cwd = process.cwd()) {
  const root = omykitRoot(cwd);
  const stat = safeStat(root);
  return {
    path: root,
    exists: Boolean(stat),
    is_directory: Boolean(stat?.isDirectory()),
    conflict: Boolean(stat && !stat.isDirectory()),
  };
}

function assertOmyKitNamespaceAvailable(cwd = process.cwd()) {
  const status = omyKitNamespaceStatus(cwd);
  if (status.conflict) {
    throw new Error(`omyKit namespace conflict: ${OMYKIT_RUNTIME_DIR} exists but is not a directory. Move or rename it before creating workflow state.`);
  }
}

function gitDir(cwd = process.cwd()) {
  const dotGit = path.join(cwd, ".git");
  const stat = safeStat(dotGit);
  if (!stat) return null;
  if (stat.isDirectory()) return dotGit;
  if (!stat.isFile()) return null;
  const content = fs.readFileSync(dotGit, "utf8").trim();
  const match = /^gitdir:\s*(.+)$/i.exec(content);
  if (!match) return null;
  return path.resolve(cwd, match[1]);
}

function gitInfoExcludeFile(cwd = process.cwd()) {
  const dir = gitDir(cwd);
  return dir ? path.join(dir, "info", "exclude") : null;
}

function inspectLocalGitIgnore(cwd = process.cwd()) {
  const file = gitInfoExcludeFile(cwd);
  if (!file) {
    return {
      git_repo: false,
      active: false,
      path: null,
      entry: `${OMYKIT_RUNTIME_DIR}/`,
    };
  }
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  return {
    git_repo: true,
    active: content.split(/\r?\n/).some((line) => line.trim() === `${OMYKIT_RUNTIME_DIR}/`),
    path: projectRelativePath(file, cwd),
    entry: `${OMYKIT_RUNTIME_DIR}/`,
  };
}

function ensureLocalGitIgnore(cwd = process.cwd()) {
  const file = gitInfoExcludeFile(cwd);
  if (!file) return { status: "not_git_repo", path: null };
  ensureDir(path.dirname(file));
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (content.split(/\r?\n/).some((line) => line.trim() === `${OMYKIT_RUNTIME_DIR}/`)) {
    return { status: "already_present", path: projectRelativePath(file, cwd) };
  }
  const separator = content.length === 0 || content.endsWith("\n") ? "" : "\n";
  fs.appendFileSync(file, `${separator}${OMYKIT_LOCAL_IGNORE_BLOCK}`);
  return { status: "added", path: projectRelativePath(file, cwd) };
}

function runGitText(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) return null;
  return result.stdout;
}

function gitTrackedPaths(cwd, pathspecs) {
  if (!gitDir(cwd)) return [];
  const output = runGitText(cwd, ["ls-files", "--", ...pathspecs]);
  if (!output) return [];
  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function trackedRuntimeFiles(cwd = process.cwd()) {
  return gitTrackedPaths(cwd, [OMYKIT_RUNTIME_DIR]);
}

function trackedRootWorkflowArtifactFiles(cwd = process.cwd()) {
  return gitTrackedPaths(cwd, ROOT_WORKFLOW_ARTIFACT_NAMES);
}

function gitHistoryCountForPaths(cwd, pathspecs) {
  if (!gitDir(cwd)) return 0;
  const output = runGitText(cwd, ["log", "--format=%H", "--", ...pathspecs]);
  if (!output) return 0;
  return output.split(/\r?\n/).filter(Boolean).length;
}

function buildGitRemovalPlan(cwd = process.cwd()) {
  const runtimeFiles = trackedRuntimeFiles(cwd);
  const legacyFiles = trackedRootWorkflowArtifactFiles(cwd);
  const runtimeHistoryCount = gitHistoryCountForPaths(cwd, [OMYKIT_RUNTIME_DIR]);
  const legacyHistoryCount = gitHistoryCountForPaths(cwd, ROOT_WORKFLOW_ARTIFACT_NAMES);
  const hasUpstream = Boolean(runGitText(cwd, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]));
  return {
    git_repo: Boolean(gitDir(cwd)),
    tracked_runtime_files: runtimeFiles,
    tracked_legacy_artifact_files: legacyFiles,
    history: {
      commits_touching_runtime: runtimeHistoryCount,
      commits_touching_legacy_artifacts: legacyHistoryCount,
      upstream_configured: hasUpstream,
      history_rewrite: "manual_only",
      sensitive_history_requires_manual_purge: runtimeHistoryCount > 0 || legacyHistoryCount > 0,
    },
    recommended_commands: {
      keep_local_runtime: "cleanup --untrack-runtime --apply",
      reset_local_runtime: "cleanup --reset-runtime --apply",
      uninstall_local_runtime: "cleanup --uninstall-local --apply",
      commit_latest_state: "git commit -m \"Stop tracking omyKit runtime state\"",
    },
  };
}

function untrackGitPaths(cwd, pathspecs) {
  const tracked = gitTrackedPaths(cwd, pathspecs);
  if (!gitDir(cwd)) {
    return {
      applied: false,
      status: "not_git_repo",
      paths: [],
      actions: [{ path: ".", status: "skipped", reason: "not a Git repository" }],
    };
  }
  if (tracked.length === 0) {
    return {
      applied: true,
      status: "nothing_tracked",
      paths: [],
      actions: [{ path: pathspecs.join(", "), status: "skipped", reason: "no tracked paths" }],
    };
  }
  const result = spawnSync("git", ["rm", "-r", "--cached", "--quiet", "--", ...pathspecs], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    return {
      applied: false,
      status: "git_rm_cached_failed",
      paths: tracked,
      error: (result.stderr || result.stdout || "").trim(),
      actions: tracked.map((item) => ({ path: item, status: "failed" })),
    };
  }
  return {
    applied: true,
    status: "untracked_from_index",
    paths: tracked,
    actions: tracked.map((item) => ({ path: item, status: "untracked_from_index" })),
  };
}

function rootWorkflowArtifactConflicts(cwd = process.cwd()) {
  return ROOT_WORKFLOW_ARTIFACT_NAMES
    .map((name) => path.join(cwd, name))
    .filter((file) => fs.existsSync(file))
    .map((file) => projectRelativePath(file, cwd));
}

function localRuntimeUninstallArchiveRoot(cwd = process.cwd()) {
  const dir = gitDir(cwd);
  if (dir) return path.join(dir, "omykit-uninstalled");
  return path.join(os.tmpdir(), "omykit-uninstalled", slugify(cwd));
}

function movePathPreserving(source, destination) {
  ensureDir(path.dirname(destination));
  try {
    fs.renameSync(source, destination);
  } catch (error) {
    if (error.code !== "EXDEV") throw error;
    fs.cpSync(source, destination, { recursive: true, force: false, errorOnExist: true });
    fs.rmSync(source, { recursive: true, force: true });
  }
}

function uninstallLocalRuntime(cwd = process.cwd()) {
  const source = omykitRoot(cwd);
  const stat = safeStat(source);
  if (!stat) {
    return {
      applied: true,
      mode: "uninstall-local",
      status: "skipped",
      reason: `${OMYKIT_RUNTIME_DIR} does not exist`,
      archive_dir: null,
      actions: [{ path: OMYKIT_RUNTIME_DIR, status: "skipped", reason: `${OMYKIT_RUNTIME_DIR} does not exist` }],
    };
  }
  if (!stat.isDirectory()) {
    return {
      applied: false,
      mode: "uninstall-local",
      status: "blocked_namespace_conflict",
      reason: `${OMYKIT_RUNTIME_DIR} exists but is not an omyKit runtime directory.`,
      archive_dir: null,
      actions: [{ path: OMYKIT_RUNTIME_DIR, status: "blocked", reason: `${OMYKIT_RUNTIME_DIR} exists but is not a directory` }],
    };
  }
  const destination = uniqueArchivePath(path.join(localRuntimeUninstallArchiveRoot(cwd), `${timestampForArchive()}-${OMYKIT_RUNTIME_DIR}`));
  movePathPreserving(source, destination);
  return {
    applied: true,
    mode: "uninstall-local",
    status: "archived",
    archive_dir: destination,
    actions: [{ path: OMYKIT_RUNTIME_DIR, status: "archived", archive_path: destination }],
  };
}

function projectRelativePath(file, cwd = process.cwd()) {
  const relative = path.relative(cwd, file);
  return relative.startsWith("..") ? file : relative || ".";
}

function safeStat(file) {
  try {
    return fs.statSync(file);
  } catch {
    return null;
  }
}

function safeReadJsonForDoctor(file) {
  try {
    return { ok: true, value: readJson(file) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function latestMtimeMs(paths) {
  let latest = 0;
  for (const file of paths) {
    const stat = safeStat(file);
    if (stat && stat.mtimeMs > latest) latest = stat.mtimeMs;
  }
  return latest;
}

function filesInDir(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function resolveWorkflowDir(options = {}) {
  const cwd = process.cwd();
  const root = workflowsRoot(cwd);
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
  const activeId = readActiveWorkflowId(cwd);
  if (activeId) {
    const activeDir = path.join(root, activeId);
    if (fs.existsSync(path.join(activeDir, "graph.json"))) return activeDir;
  }
  if (dirs.length > 1) {
    throw new Error(`Multiple omyKit workflows found and no active workflow is selected. Run "node scripts/omykit-workflow.mjs workflows" and then "node scripts/omykit-workflow.mjs workflows use <workflow-id>", or pass --workflow <workflow-id>.`);
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
  const modelProfile = node.model_profile || graph.metadata?.layers?.model_profile || null;
  const modelTier = node.model_tier || policy.model_tier;
  const taskComplexity = node.task_complexity || policy.task_complexity;
  const recommended = recommendedModelForNode({
    node,
    card: {},
    modelTier,
    taskComplexity,
    modelProfile,
    language: graph.metadata?.language || "en",
  });
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
    task_complexity: taskComplexity,
    model_tier: modelTier,
    model_selection_reason: node.model_selection_reason || policy.model_selection_reason,
    recommended_model: node.recommended_model || recommended.model,
    recommended_model_reason: node.recommended_model_reason || recommended.reason,
    estimated_minutes: Number.isFinite(node.estimated_minutes) ? node.estimated_minutes : policy.estimated_minutes,
  };
  for (const field of COLLABORATION_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(node, field)) card[field] = node[field];
  }
  return card;
}

function workflowMetadataFromGraph(graph) {
  return {
    workflow_id: graph.workflow_id,
    title: graph.title,
    mode: graph.mode,
    language: graph.language || null,
    template_id: graph.metadata?.template_id || null,
    template_version: graph.metadata?.template_version || null,
    template_name: graph.metadata?.template_name || null,
    deck_variant: graph.metadata?.deck_variant || null,
    workflow_artifact_version: graph.metadata?.workflow_artifact_version || WORKFLOW_ARTIFACT_VERSION,
  };
}

function initialState(graph) {
  const entries = {};
  for (const node of graph.nodes) {
    entries[node.id] = stateEntry(node.depends_on.length === 0 ? "ready" : "pending");
  }
  return {
    schema_version: SCHEMA_VERSION,
    workflow_id: graph.workflow_id,
    workflow_metadata: workflowMetadataFromGraph(graph),
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
    for (const field of ["recommended_model", "recommended_model_reason"]) {
      if (node[field] !== undefined && typeof node[field] !== "string") {
        errors.push(`node.${field} must be string for ${node.id}`);
      }
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
    for (const field of ["recommended_model", "recommended_model_reason"]) {
      if (card[field] !== undefined && typeof card[field] !== "string") {
        errors.push(`node card ${node.id} ${field} must be string`);
      }
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
  for (const field of ["provider", "model", "notes", "recorded_at"]) {
    if (value[field] !== undefined && (typeof value[field] !== "string" || !value[field])) {
      errors.push(`${label}.${field} must be a non-empty string`);
    }
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

function validateSkillsUsedShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!Array.isArray(value)) return [`${label} must be an array`];
  value.forEach((item, index) => {
    if (typeof item === "string") {
      if (!item) errors.push(`${label}[${index}] must be a non-empty string`);
      return;
    }
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${label}[${index}] must be a string or object`);
      return;
    }
    if (!item.name) errors.push(`${label}[${index}].name is required`);
    for (const field of ["name", "source", "path", "purpose", "triggered_by"]) {
      if (item[field] !== undefined && typeof item[field] !== "string") {
        errors.push(`${label}[${index}].${field} must be a string`);
      }
    }
    if (item.evidence !== undefined && (!Array.isArray(item.evidence) || item.evidence.some((entry) => typeof entry !== "string" || !entry))) {
      errors.push(`${label}[${index}].evidence must be an array of non-empty strings`);
    }
  });
  return errors;
}

function validateStringArrayShape(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry)) {
    return [`${label} must be an array of non-empty strings`];
  }
  return [];
}

function validateSkillDecisionsShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!Array.isArray(value)) return [`${label} must be an array`];
  value.forEach((item, index) => {
    const prefix = `${label}[${index}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    for (const field of ["capability", "selected", "rationale"]) {
      if (!item[field] || typeof item[field] !== "string") {
        errors.push(`${prefix}.${field} is required`);
      }
    }
    if (item.outcome !== undefined && !SKILL_DECISION_OUTCOMES.has(item.outcome)) {
      errors.push(`${prefix}.outcome must be one of ${[...SKILL_DECISION_OUTCOMES].join(", ")}`);
    }
    errors.push(...validateStringArrayShape(item.selection_basis, `${prefix}.selection_basis`));
    errors.push(...validateStringArrayShape(item.evidence, `${prefix}.evidence`));
    if (item.alternatives !== undefined) {
      if (!Array.isArray(item.alternatives)) {
        errors.push(`${prefix}.alternatives must be an array`);
      } else {
        item.alternatives.forEach((alternative, altIndex) => {
          const altPrefix = `${prefix}.alternatives[${altIndex}]`;
          if (!alternative || typeof alternative !== "object" || Array.isArray(alternative)) {
            errors.push(`${altPrefix} must be an object`);
            return;
          }
          if (!alternative.name || typeof alternative.name !== "string") errors.push(`${altPrefix}.name is required`);
          if (alternative.decision !== undefined && !SKILL_ALTERNATIVE_DECISIONS.has(alternative.decision)) {
            errors.push(`${altPrefix}.decision must be one of ${[...SKILL_ALTERNATIVE_DECISIONS].join(", ")}`);
          }
          for (const field of ["reason", "strength"]) {
            if (alternative[field] !== undefined && (typeof alternative[field] !== "string" || !alternative[field])) {
              errors.push(`${altPrefix}.${field} must be a non-empty string`);
            }
          }
        });
      }
    }
    if (item.fallback_policy !== undefined) {
      if (!item.fallback_policy || typeof item.fallback_policy !== "object" || Array.isArray(item.fallback_policy)) {
        errors.push(`${prefix}.fallback_policy must be an object`);
      } else {
        for (const field of ["when", "next_skill", "action"]) {
          if (item.fallback_policy[field] !== undefined && (typeof item.fallback_policy[field] !== "string" || !item.fallback_policy[field])) {
            errors.push(`${prefix}.fallback_policy.${field} must be a non-empty string`);
          }
        }
      }
    }
    if (item.user_feedback !== undefined) {
      if (!item.user_feedback || typeof item.user_feedback !== "object" || Array.isArray(item.user_feedback)) {
        errors.push(`${prefix}.user_feedback must be an object`);
      } else {
        if (!item.user_feedback.status || !SKILL_FEEDBACK_STATUSES.has(item.user_feedback.status)) {
          errors.push(`${prefix}.user_feedback.status must be one of ${[...SKILL_FEEDBACK_STATUSES].join(", ")}`);
        }
        if (item.user_feedback.summary !== undefined && (typeof item.user_feedback.summary !== "string" || !item.user_feedback.summary)) {
          errors.push(`${prefix}.user_feedback.summary must be a non-empty string`);
        }
        errors.push(...validateStringArrayShape(item.user_feedback.evidence, `${prefix}.user_feedback.evidence`));
      }
    }
    if (["needs_revision", "switched"].includes(item.outcome) && !item.fallback_policy?.next_skill) {
      errors.push(`${prefix}.fallback_policy.next_skill is required when outcome is ${item.outcome}`);
    }
  });
  return errors;
}

function validateIntakeDecisionShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${label} must be an object`];
  }
  if (!value.goal || typeof value.goal !== "string") errors.push(`${label}.goal is required`);
  const route = value.route;
  if (!route || typeof route !== "object" || Array.isArray(route)) {
    errors.push(`${label}.route is required`);
  } else {
    for (const field of ["entry", "project_type", "mode", "next_skill"]) {
      if (!route[field] || typeof route[field] !== "string") errors.push(`${label}.route.${field} is required`);
    }
  }
  const workflow = value.workflow;
  if (!workflow || typeof workflow !== "object" || Array.isArray(workflow)) {
    errors.push(`${label}.workflow is required`);
  } else if (!workflow.shape || typeof workflow.shape !== "string") {
    errors.push(`${label}.workflow.shape is required`);
  }
  if (!Array.isArray(value.assumptions)) {
    errors.push(`${label}.assumptions must be an array`);
  } else {
    value.assumptions.forEach((item, index) => {
      if (typeof item === "string") {
        if (!item) errors.push(`${label}.assumptions[${index}] must be a non-empty string`);
        return;
      }
      if (!item || typeof item !== "object" || Array.isArray(item) || !item.text) {
        errors.push(`${label}.assumptions[${index}].text is required`);
      }
    });
  }
  if (value.custom_answers_allowed !== true) {
    errors.push(`${label}.custom_answers_allowed must be true`);
  }
  if (value.questions !== undefined) {
    if (!Array.isArray(value.questions)) {
      errors.push(`${label}.questions must be an array`);
    } else {
      if (value.questions.length > 3) errors.push(`${label}.questions must contain at most 3 items`);
      value.questions.forEach((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          errors.push(`${label}.questions[${index}] must be an object`);
          return;
        }
        if (!item.question || typeof item.question !== "string") errors.push(`${label}.questions[${index}].question is required`);
        if (item.custom_answer_allowed !== true) errors.push(`${label}.questions[${index}].custom_answer_allowed must be true`);
        if (item.options !== undefined && (!Array.isArray(item.options) || item.options.some((option) => typeof option !== "string" || !option))) {
          errors.push(`${label}.questions[${index}].options must be an array of non-empty strings`);
        }
        if (!item.answer && item.resolved !== true) {
          errors.push(`${label}.questions[${index}] must record answer or resolved=true`);
        }
      });
    }
  }
  if (value.execution_options !== undefined) {
    if (!Array.isArray(value.execution_options)) {
      errors.push(`${label}.execution_options must be an array`);
    } else {
      value.execution_options.forEach((item, index) => {
        const prefix = `${label}.execution_options[${index}]`;
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          errors.push(`${prefix} must be an object`);
          return;
        }
        for (const field of ["id", "label", "summary"]) {
          if (!item[field] || typeof item[field] !== "string") errors.push(`${prefix}.${field} is required`);
        }
        if (item.recommended !== undefined && typeof item.recommended !== "boolean") {
          errors.push(`${prefix}.recommended must be boolean`);
        }
        for (const field of ["tradeoffs", "risks"]) {
          if (item[field] !== undefined && (!Array.isArray(item[field]) || item[field].some((entry) => typeof entry !== "string" || !entry))) {
            errors.push(`${prefix}.${field} must be an array of non-empty strings`);
          }
        }
      });
      if (value.execution_options.length > 0) {
        const ids = new Set(value.execution_options.map((item) => item?.id).filter(Boolean));
        if (ids.size !== value.execution_options.filter((item) => item?.id).length) {
          errors.push(`${label}.execution_options ids must be unique`);
        }
        if (value.selected_option && !ids.has(value.selected_option)) {
          errors.push(`${label}.selected_option must match an execution_options id`);
        }
      }
    }
  }
  if (value.selected_option !== undefined && (typeof value.selected_option !== "string" || !value.selected_option)) {
    errors.push(`${label}.selected_option must be a non-empty string`);
  }
  if (value.confirmation !== undefined) {
    if (!value.confirmation || typeof value.confirmation !== "object" || Array.isArray(value.confirmation)) {
      errors.push(`${label}.confirmation must be an object`);
    } else {
      if (!value.confirmation.status || !INTAKE_CONFIRMATION_STATUSES.has(value.confirmation.status)) {
        errors.push(`${label}.confirmation.status must be one of ${[...INTAKE_CONFIRMATION_STATUSES].join(", ")}`);
      }
      for (const field of ["by", "evidence", "notes"]) {
        if (value.confirmation[field] !== undefined && (typeof value.confirmation[field] !== "string" || !value.confirmation[field])) {
          errors.push(`${label}.confirmation.${field} must be a non-empty string`);
        }
      }
    }
  }
  return errors;
}

function validateEvolutionCandidatesShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!Array.isArray(value)) return [`${label} must be an array`];
  value.forEach((item, index) => {
    const prefix = `${label}[${index}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    if (!item.lesson || typeof item.lesson !== "string") errors.push(`${prefix}.lesson is required`);
    if (!item.scope || !EVOLUTION_SCOPES.has(item.scope)) {
      errors.push(`${prefix}.scope must be one of ${[...EVOLUTION_SCOPES].join(", ")}`);
    }
    if (!item.promotion_status || !EVOLUTION_PROMOTION_STATUSES.has(item.promotion_status)) {
      errors.push(`${prefix}.promotion_status must be one of ${[...EVOLUTION_PROMOTION_STATUSES].join(", ")}`);
    }
    if (!Array.isArray(item.evidence) || item.evidence.length === 0) {
      errors.push(`${prefix}.evidence must contain at least one evidence path`);
    } else if (item.evidence.some((entry) => typeof entry !== "string" || !entry)) {
      errors.push(`${prefix}.evidence must be an array of non-empty strings`);
    }
    for (const field of ["owner", "update_surface", "rationale", "next_action"]) {
      if (item[field] !== undefined && (typeof item[field] !== "string" || !item[field])) {
        errors.push(`${prefix}.${field} must be a non-empty string`);
      }
    }
  });
  return errors;
}

function validateCapabilityGapsShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!Array.isArray(value)) return [`${label} must be an array`];
  value.forEach((item, index) => {
    const prefix = `${label}[${index}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    for (const field of ["capability", "need", "current_gap"]) {
      if (!item[field] || typeof item[field] !== "string") errors.push(`${prefix}.${field} is required`);
    }
    if (!item.integration_path || !CAPABILITY_GAP_INTEGRATION_PATHS.has(item.integration_path)) {
      errors.push(`${prefix}.integration_path must be one of ${[...CAPABILITY_GAP_INTEGRATION_PATHS].join(", ")}`);
    }
    if (!item.status || !CAPABILITY_GAP_STATUSES.has(item.status)) {
      errors.push(`${prefix}.status must be one of ${[...CAPABILITY_GAP_STATUSES].join(", ")}`);
    }
    if (!Array.isArray(item.evidence) || item.evidence.length === 0) {
      errors.push(`${prefix}.evidence must contain at least one evidence path`);
    } else if (item.evidence.some((entry) => typeof entry !== "string" || !entry)) {
      errors.push(`${prefix}.evidence must be an array of non-empty strings`);
    }
    if (item.candidate_tool !== undefined) {
      if (!item.candidate_tool || typeof item.candidate_tool !== "object" || Array.isArray(item.candidate_tool)) {
        errors.push(`${prefix}.candidate_tool must be an object`);
      } else {
        for (const field of ["name", "repo", "url", "source_mark", "license"]) {
          if (item.candidate_tool[field] !== undefined && (typeof item.candidate_tool[field] !== "string" || !item.candidate_tool[field])) {
            errors.push(`${prefix}.candidate_tool.${field} must be a non-empty string`);
          }
        }
        if (item.candidate_tool.stars !== undefined && (!Number.isInteger(item.candidate_tool.stars) || item.candidate_tool.stars < 0)) {
          errors.push(`${prefix}.candidate_tool.stars must be a non-negative integer`);
        }
      }
    }
    for (const field of ["rationale", "trial_plan", "decision_reason", "owner", "next_action"]) {
      if (item[field] !== undefined && (typeof item[field] !== "string" || !item[field])) {
        errors.push(`${prefix}.${field} must be a non-empty string`);
      }
    }
  });
  return errors;
}

function validateKnowledgeSyncShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${label} must be an object`];
  }
  if (!value.status || !KNOWLEDGE_SYNC_STATUSES.has(value.status)) {
    errors.push(`${label}.status must be one of ${[...KNOWLEDGE_SYNC_STATUSES].join(", ")}`);
  }
  for (const field of ["reason", "skill", "performed_by"]) {
    if (value[field] !== undefined && (typeof value[field] !== "string" || !value[field])) {
      errors.push(`${label}.${field} must be a non-empty string`);
    }
  }
  for (const field of ["files_reviewed", "files_updated", "memory_updated", "evidence"]) {
    if (value[field] !== undefined && (!Array.isArray(value[field]) || value[field].some((item) => typeof item !== "string" || !item))) {
      errors.push(`${label}.${field} must be an array of non-empty strings`);
    }
  }
  if (value.status === "deferred" && !value.reason) {
    errors.push(`${label}.reason is required when status is deferred`);
  }
  return errors;
}

function validateDownstreamContextShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${label} must be an object`];
  }
  if (!value.summary || typeof value.summary !== "string") errors.push(`${label}.summary is required`);
  if (value.target_nodes !== undefined && (!Array.isArray(value.target_nodes) || value.target_nodes.some((item) => typeof item !== "string" || !item))) {
    errors.push(`${label}.target_nodes must be an array of non-empty strings`);
  }
  for (const field of ["target_nodes", "required_inputs", "evidence", "carry_forward_risks"]) {
    if (value[field] !== undefined && (!Array.isArray(value[field]) || value[field].some((item) => typeof item !== "string" || !item))) {
      errors.push(`${label}.${field} must be an array of non-empty strings`);
    }
  }
  if (value.context_budget !== undefined) {
    if (!value.context_budget || typeof value.context_budget !== "object" || Array.isArray(value.context_budget)) {
      errors.push(`${label}.context_budget must be an object`);
    } else {
      if (value.context_budget.level !== undefined && !CONTEXT_LEVELS.has(value.context_budget.level)) {
        errors.push(`${label}.context_budget.level must be one of ${[...CONTEXT_LEVELS].join(", ")}`);
      }
      if (value.context_budget.max_source_files !== undefined && (!Number.isInteger(value.context_budget.max_source_files) || value.context_budget.max_source_files < 0)) {
        errors.push(`${label}.context_budget.max_source_files must be a non-negative integer`);
      }
      if (value.context_budget.notes !== undefined && typeof value.context_budget.notes !== "string") {
        errors.push(`${label}.context_budget.notes must be a string`);
      }
    }
  }
  if (value.handoff_contract !== undefined && typeof value.handoff_contract !== "string") {
    errors.push(`${label}.handoff_contract must be a string`);
  }
  return errors;
}

function validateUsageObservationShape(value, label) {
  const errors = [];
  if (value === undefined) return errors;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${label} must be an object`];
  }
  for (const field of ["model_status", "token_status"]) {
    if (value[field] !== undefined && !USAGE_OBSERVATION_STATUSES.has(value[field])) {
      errors.push(`${label}.${field} must be one of ${[...USAGE_OBSERVATION_STATUSES].join(", ")}`);
    }
  }
  for (const field of ["source", "runtime_surface", "model_unavailable_reason", "token_unavailable_reason"]) {
    if (value[field] !== undefined && (typeof value[field] !== "string" || !value[field])) {
      errors.push(`${label}.${field} must be a non-empty string`);
    }
  }
  if (value.notes !== undefined && typeof value.notes !== "string") {
    errors.push(`${label}.notes must be a string`);
  }
  if (value.evidence !== undefined && (!Array.isArray(value.evidence) || value.evidence.some((item) => typeof item !== "string" || !item))) {
    errors.push(`${label}.evidence must be an array of non-empty strings`);
  }
  if (value.model_status === "unavailable" && !value.model_unavailable_reason) {
    errors.push(`${label}.model_unavailable_reason is required when model_status is unavailable`);
  }
  if (value.token_status === "unavailable" && !value.token_unavailable_reason) {
    errors.push(`${label}.token_unavailable_reason is required when token_status is unavailable`);
  }
  return errors;
}

function validateTaskTrackingFields(handoff) {
  const errors = [];
  if (handoff.language !== undefined && typeof handoff.language !== "string") {
    errors.push("handoff.language must be a string");
  }
  for (const field of ["model", "model_provider", "model_selection_reason"]) {
    if (handoff[field] !== undefined && typeof handoff[field] !== "string") {
      errors.push(`handoff.${field} must be a string`);
    }
  }
  if (handoff.model_tier !== undefined && !MODEL_TIERS.has(handoff.model_tier)) {
    errors.push(`handoff.model_tier must be one of ${[...MODEL_TIERS].join(", ")}`);
  }
  errors.push(...validateIntakeDecisionShape(handoff.intake_decision, "handoff.intake_decision"));
  errors.push(...validateContextUsageShape(handoff.context_usage, "handoff.context_usage"));
  errors.push(...validateTimingShape(handoff.timing, "handoff.timing"));
  errors.push(...validateSkillsUsedShape(handoff.skills_used, "handoff.skills_used"));
  errors.push(...validateSkillDecisionsShape(handoff.skill_decisions, "handoff.skill_decisions"));
  errors.push(...validateEvolutionCandidatesShape(handoff.evolution_candidates, "handoff.evolution_candidates"));
  errors.push(...validateCapabilityGapsShape(handoff.capability_gaps, "handoff.capability_gaps"));
  errors.push(...validateKnowledgeSyncShape(handoff.knowledge_sync, "handoff.knowledge_sync"));
  errors.push(...validateDownstreamContextShape(handoff.downstream_context, "handoff.downstream_context"));
  errors.push(...validateUsageObservationShape(handoff.usage_observation, "handoff.usage_observation"));
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
        for (const field of ["model", "model_provider", "model_selection_reason", "model_unavailable_reason"]) {
          if (item[field] !== undefined && typeof item[field] !== "string") {
            errors.push(`handoff.agent_activity[${index}].${field} must be a string`);
          }
        }
        errors.push(...validateSkillsUsedShape(item.skills_used, `handoff.agent_activity[${index}].skills_used`));
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
  const node = map.get(handoff.node_id);
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
    if (node?.type === "intake" && !handoff.intake_decision) {
      errors.push("passed intake handoff requires intake_decision");
    }
    if (node?.type === "delivery" && !Array.isArray(handoff.evolution_candidates)) {
      errors.push("passed delivery handoff requires evolution_candidates");
    }
    if (node?.type === "delivery" && !handoff.knowledge_sync) {
      errors.push("passed delivery handoff requires knowledge_sync");
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
    errors.push(...validateAssignments(workflowDir, graph));
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

function workflowCliLanguage(graph) {
  return normalizeBoardLanguage(graph.metadata?.language || graph.language || "en");
}

function statusAction(graph, state, language = "en") {
  const ready = readyNodes(graph, state);
  const running = nodesWithStatus(graph, state, "running");
  const blocked = nodesWithStatus(graph, state, "blocked");
  const failed = nodesWithStatus(graph, state, "failed");
  const isZh = language === "zh-CN";
  if (failed.length > 0) {
    return {
      summary: isZh ? `处理或打回 ${failed[0].id}` : `resolve or reject from ${failed[0].id}`,
      command: `node scripts/omykit-workflow.mjs orchestrate --workflow ${graph.workflow_id}`,
    };
  }
  if (blocked.length > 0 && ready.length === 0) {
    return {
      summary: isZh ? `解决 ${blocked[0].id} 的阻塞后解除阻塞` : `resolve blocker for ${blocked[0].id}, then unblock it`,
      command: `node scripts/omykit-workflow.mjs orchestrate --workflow ${graph.workflow_id}`,
    };
  }
  if (running.length > 0) {
    return {
      summary: isZh ? `为 ${running[0].id} 提交 handoff` : `complete ${running[0].id} with a handoff`,
      command: `node scripts/omykit-workflow.mjs orchestrate --workflow ${graph.workflow_id}`,
    };
  }
  if (ready.length > 0) {
    return {
      summary: isZh ? `启动 ${ready[0].id}` : `start ${ready[0].id}`,
      command: `node scripts/omykit-workflow.mjs orchestrate --workflow ${graph.workflow_id}`,
    };
  }
  return {
    summary: isZh ? "交付已完成，或没有就绪节点" : "delivery complete or no ready nodes",
    command: "node scripts/omykit-workflow.mjs board",
  };
}

function printStatus(graph, state) {
  const language = workflowCliLanguage(graph);
  const isZh = language === "zh-CN";
  const ready = readyNodes(graph, state);
  const running = nodesWithStatus(graph, state, "running");
  const blocked = nodesWithStatus(graph, state, "blocked");
  const failed = nodesWithStatus(graph, state, "failed");
  const passed = nodesWithStatus(graph, state, "passed");
  const skipped = nodesWithStatus(graph, state, "skipped");
  const action = statusAction(graph, state, language);

  if (isZh) {
    console.log(`工作流: ${graph.workflow_id} (${graph.mode})`);
    console.log(`就绪节点: ${formatNodeList(ready)}`);
    console.log(`进行中节点: ${formatNodeList(running)}`);
    console.log(`阻塞节点: ${formatNodeList(blocked)}`);
    console.log(`失败节点: ${formatNodeList(failed)}`);
    console.log(`通过节点: ${passed.length}`);
    console.log(`跳过节点: ${skipped.length}`);
    console.log(`建议下一步: ${action.summary}`);
    console.log(`继续执行: ${action.command}`);
    console.log("长任务循环: orchestrate -> 内部 start/dispatch/context-pack -> 执行真实工作 -> 写 handoff JSON -> complete/reject/block/unblock -> 重复。");
    console.log("用户只表达意图；派发、交接包、记录分工和节点推进由 Codex 主控按编排计划内部执行。");
    console.log("不要把创建工作流当成任务完成；持续推进到 delivery 通过、记录真实阻塞，或用户明确只要创建骨架。");
    return;
  }

  console.log(`Workflow: ${graph.workflow_id} (${graph.mode})`);
  console.log(`Ready nodes: ${formatNodeList(ready)}`);
  console.log(`Running nodes: ${formatNodeList(running)}`);
  console.log(`Blocked nodes: ${formatNodeList(blocked)}`);
  console.log(`Failed nodes: ${formatNodeList(failed)}`);
  console.log(`Passed nodes: ${passed.length}`);
  console.log(`Skipped nodes: ${skipped.length}`);
  console.log(`Next recommended action: ${action.summary}`);
  console.log(`Continue command: ${action.command}`);
  if (ready.length > 0) console.log(`Continue now: ${action.command}`);
  console.log("Long task loop: orchestrate -> internal start/dispatch/context-pack -> do the real work -> write handoff JSON -> complete/reject/block/unblock -> repeat.");
  console.log("Users state intent; Codex orchestration runs dispatch, context-pack, assignment, and node progression primitives internally.");
  console.log("Creating the workflow is not task completion; continue until delivery passes, a real blocker is recorded, or you intentionally stop.");
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

function readLedgerRecords(workflowDir, limit = 1000) {
  return readRecentLedger(workflowDir, limit).map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return { raw: line };
    }
  });
}

function commandRunsFile(workflowDir) {
  return path.join(workflowDir, "commands", "commands.jsonl");
}

function readCommandRuns(workflowDir) {
  const file = commandRunsFile(workflowDir);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { raw: line, status: "invalid" };
      }
    });
}

function latestCommandRuns(records) {
  const byId = new Map();
  for (const record of records) {
    const id = record.run_id || record.raw;
    if (!id) continue;
    byId.set(id, record);
  }
  return [...byId.values()];
}

function buildCommandRunProjection(records) {
  const latest = latestCommandRuns(records);
  return {
    records: latest,
    active: latest.filter((item) => ["running", "starting"].includes(item.status)),
    resumable: latest.filter((item) => item.resume_command || item.log_path || item.pid),
    by_node: Object.values(latest.reduce((acc, item) => {
      const nodeId = item.node_id || "unassigned";
      if (!acc[nodeId]) acc[nodeId] = { node_id: nodeId, records: [] };
      acc[nodeId].records.push(item);
      return acc;
    }, {})),
  };
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

function assignmentsFile(workflowDir) {
  return path.join(workflowDir, "assignments.jsonl");
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readTaskInbox(cwd = process.cwd()) {
  const file = tasksFile(cwd);
  const tasks = [];
  const invalid = [];
  if (!fs.existsSync(file)) return { file, tasks, invalid };
  fs.readFileSync(file, "utf8").split(/\r?\n/).filter((line) => line.trim()).forEach((line, index) => {
    try {
      tasks.push({ ...JSON.parse(line), line: index + 1 });
    } catch (error) {
      invalid.push({ line: index + 1, error: error.message });
    }
  });
  return { file, tasks, invalid };
}

function activeWorkflowSummaryForTask(cwd = process.cwd()) {
  const workflowId = readActiveWorkflowId(cwd);
  if (!workflowId) return null;
  const workflowDir = path.join(workflowsRoot(cwd), workflowId);
  if (!fs.existsSync(path.join(workflowDir, "graph.json")) || !fs.existsSync(path.join(workflowDir, "state.json"))) return null;
  const { graph, state } = loadWorkflow(workflowDir);
  return {
    workflow_id: graph.workflow_id || workflowId,
    workflow_dir: workflowDir,
    template_id: graph.metadata?.template_id || null,
    title: graph.title || workflowId,
    all_terminal: workflowAllNodesTerminal(graph, state),
  };
}

function taskTagsFromBrief(brief) {
  const text = String(brief || "");
  const tags = new Set();
  if (/(bug|fix|修 bug|修复|缺陷|问题|报错|失败|不对)/i.test(text)) tags.add("bug");
  if (/(ppt|pptx|powerpoint|presentation|slide deck|slides?|deck|keynote|pitch deck|proposal deck|演示文稿|幻灯片|路演|汇报|提案PPT|PPT提案|商业计划书PPT|融资PPT)/i.test(text)) tags.add("deck");
  if (/(ui|ux|界面|视觉|样式|布局|字体|字号|间距|卡片|图标|icon|tabbar|页面|截图|货不对版)/i.test(text)) tags.add("ui");
  if (/(小程序|mini[- ]?program|wechat|微信)/i.test(text)) tags.add("miniapp");
  if (/(二级|设置页|首页|服务页|页面|screen|page)/i.test(text)) tags.add("surface");
  if (/(同类|一样|上面|继续|也|补充|遗漏|没测到|覆盖)/i.test(text)) tags.add("follow_up");
  if (/(多个|并行|全量|所有|每个|批量|多页面|多端)/i.test(text)) tags.add("multi");
  return [...tags];
}

function suggestedTaskTemplate(tags, brief) {
  if (tags.includes("deck")) return "deck.proposal";
  if (tags.includes("multi")) return "mission.orchestration";
  if (tags.includes("ui")) return "frontend-ui.strict";
  if (tags.includes("bug")) return "bugfix.standard";
  return resolveInitTemplateId(brief, AUTO_TEMPLATE_ID);
}

function suggestedTaskWriteScope(tags, brief) {
  const text = String(brief || "");
  const scope = new Set();
  if (tags.includes("deck")) {
    scope.add("decks/**");
    scope.add("slides/**");
    scope.add("presentations/**");
    const variant = inferDeckVariant(brief);
    if (variant === "remake" || variant === "modify") scope.add("source-decks/**");
    scope.add("*.pptx");
    scope.add("*.key");
    scope.add("*.pdf");
    scope.add("*.html");
  }
  if (tags.includes("ui")) {
    scope.add("styles/tokens/**");
    scope.add("components/**");
  }
  if (/(tabbar|底部导航|导航|图标|icon)/i.test(text)) {
    scope.add("app.json");
    scope.add("assets/icons/**");
  }
  if (/(首页|home)/i.test(text)) scope.add("pages/home/**");
  if (/(服务页|service)/i.test(text)) scope.add("pages/service/**");
  if (/(设置页|setting|settings)/i.test(text)) scope.add("pages/settings/**");
  if (/(二级|页面|screen|page)/i.test(text)) scope.add("pages/**");
  if (scope.size === 0) scope.add("**/*");
  return [...scope];
}

function taskScopesOverlap(left = [], right = []) {
  const a = new Set(left);
  const b = new Set(right);
  for (const item of a) {
    if (b.has(item)) return true;
    if (item.endsWith("/**")) {
      const prefix = item.slice(0, -3);
      if ([...b].some((candidate) => candidate === prefix || candidate.startsWith(`${prefix}/`) || candidate.startsWith(prefix))) return true;
    }
  }
  for (const item of b) {
    if (item.endsWith("/**")) {
      const prefix = item.slice(0, -3);
      if ([...a].some((candidate) => candidate === prefix || candidate.startsWith(`${prefix}/`) || candidate.startsWith(prefix))) return true;
    }
  }
  return false;
}

function taskRelationForBrief(tags, activeWorkflow, requestedTemplateId) {
  if (tags.includes("follow_up")) return "same_problem_family";
  if (activeWorkflow && requestedTemplateId === activeWorkflow.template_id) return "same_workflow";
  return "new_request";
}

function taskConflictRisk(tasks, scope, relation) {
  if (relation === "same_problem_family" && tasks.some((task) => taskScopesOverlap(task.suggested_write_scope, scope))) return "medium";
  if (tasks.some((task) => task.status === "open" && taskScopesOverlap(task.suggested_write_scope, scope))) return "medium";
  return "low";
}

function taskDecisionFor(activeWorkflow, tags, requestedTemplateId, relation) {
  if (!activeWorkflow) return "new_workflow";
  const relatedToActive = relation === "same_problem_family" || requestedTemplateId === activeWorkflow.template_id;
  if (activeWorkflow.all_terminal) return relatedToActive ? "linked_follow_up" : "new_workflow";
  if (relatedToActive) return "merge_current";
  return "new_workflow";
}

function createTaskRecord(brief, options = {}, cwd = process.cwd()) {
  const language = options.lang ? normalizeBoardLanguage(options.lang) : inferLanguageFromText(brief);
  const existing = readTaskInbox(cwd).tasks;
  const activeWorkflow = activeWorkflowSummaryForTask(cwd);
  const tags = taskTagsFromBrief(brief);
  const deckVariant = tags.includes("deck") ? inferDeckVariant(brief) : null;
  const requestedTemplateId = suggestedTaskTemplate(tags, brief);
  const relation = taskRelationForBrief(tags, activeWorkflow, requestedTemplateId);
  const suggestedWriteScope = suggestedTaskWriteScope(tags, brief);
  const decision = taskDecisionFor(activeWorkflow, tags, requestedTemplateId, relation);
  const linkedWorkflowId = ["merge_current", "linked_follow_up"].includes(decision) ? activeWorkflow?.workflow_id || null : null;
  const templateId = linkedWorkflowId ? activeWorkflow?.template_id || requestedTemplateId : requestedTemplateId;
  const conflictRisk = taskConflictRisk(existing, suggestedWriteScope, relation);
  const record = {
    schema_version: SCHEMA_VERSION,
    task_id: `${dateStamp()}-${slugify(brief).slice(0, 48)}-${existing.length + 1}`,
    at: now(),
    brief,
    language,
    status: "open",
    decision,
    relation,
    linked_workflow_id: linkedWorkflowId,
    template_id: templateId,
    tags,
    ...(deckVariant ? { deck_variant: deckVariant } : {}),
    suggested_write_scope: suggestedWriteScope,
    conflict_risk: conflictRisk,
    workstream: tags.includes("deck") ? deckWorkstreamForVariant(deckVariant) : tags.includes("ui") ? "ui-quality" : tags.includes("bug") ? "bugfix" : "general",
    runtime_boundary: "controller_records_and_recommends; codex_runtime_dispatches_workers",
  };
  return record;
}

function appendTaskRecord(record, cwd = process.cwd()) {
  appendText(tasksFile(cwd), `${JSON.stringify(record)}\n`);
  return tasksFile(cwd);
}

function normalizeTaskBrief(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function taskMatchesWorkflow(task, graph) {
  if (!task || task.linked_workflow_id || task.status !== "open") return false;
  if (normalizeTaskBrief(task.brief) !== normalizeTaskBrief(graph.title)) return false;
  const templateId = graph.metadata?.template_id || null;
  if (templateId && task.template_id && task.template_id !== templateId) return false;
  const deckVariant = graph.metadata?.deck_variant || null;
  if (deckVariant && task.deck_variant && task.deck_variant !== deckVariant) return false;
  return true;
}

function linkPendingTaskToWorkflow(cwd, graph) {
  const file = tasksFile(cwd);
  if (!fs.existsSync(file)) return null;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const parsed = [];
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    try {
      parsed.push({ index, record: JSON.parse(line) });
    } catch {
      // Preserve invalid lines exactly; doctor reports them separately.
    }
  });
  const match = [...parsed].reverse().find(({ record }) => taskMatchesWorkflow(record, graph));
  if (!match) return null;
  const linked = {
    ...match.record,
    status: "linked",
    linked_workflow_id: graph.workflow_id,
    linked_at: now(),
    link_reason: "init_matched_pending_task",
  };
  lines[match.index] = JSON.stringify(linked);
  fs.writeFileSync(file, `${lines.join("\n").replace(/\n+$/g, "")}\n`);
  return linked;
}

function taskInboxSummary(tasks) {
  const byDecision = {};
  const byStatus = {};
  for (const task of tasks) {
    byDecision[task.decision || "unknown"] = (byDecision[task.decision || "unknown"] || 0) + 1;
    byStatus[task.status || "unknown"] = (byStatus[task.status || "unknown"] || 0) + 1;
  }
  return {
    total: tasks.length,
    open: tasks.filter((task) => task.status === "open").length,
    by_decision: byDecision,
    by_status: byStatus,
  };
}

function buildTaskWorkstreams(tasks) {
  const groups = new Map();
  for (const task of tasks) {
    const key = task.workstream || "general";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(task);
  }
  return [...groups.entries()].map(([id, items]) => ({
    id,
    kind: id === "ui-quality" ? "ui_surface" : id,
    tasks: items.map((task) => task.task_id),
    suggested_write_scope: [...new Set(items.flatMap((task) => task.suggested_write_scope || []))],
    decision: items.some((task) => task.decision === "linked_follow_up") ? "linked_follow_up" : items[0]?.decision || "unknown",
  }));
}

function buildTaskConflicts(tasks) {
  const conflicts = [];
  for (let i = 0; i < tasks.length; i += 1) {
    for (let j = i + 1; j < tasks.length; j += 1) {
      const left = tasks[i];
      const right = tasks[j];
      if (taskScopesOverlap(left.suggested_write_scope, right.suggested_write_scope)) {
        conflicts.push({
          kind: "scope_overlap",
          severity: left.conflict_risk === "high" || right.conflict_risk === "high" ? "high" : "medium",
          task_ids: [left.task_id, right.task_id],
          shared_scope: left.suggested_write_scope.filter((item) => right.suggested_write_scope.includes(item)),
          action: "route_through_conflict_arbiter_before_parallel_write",
        });
      }
    }
  }
  return conflicts;
}

function buildTaskInboxProjection(cwd = process.cwd(), workflowId = null) {
  const tasks = readTaskInbox(cwd).tasks
    .filter((task) => !workflowId || task.linked_workflow_id === workflowId)
    .sort((a, b) => String(a.at).localeCompare(String(b.at)));
  return {
    summary: taskInboxSummary(tasks),
    tasks,
    workstreams: buildTaskWorkstreams(tasks),
    conflicts: buildTaskConflicts(tasks),
  };
}

function normalizeExecutionSurface(value, fallback = "subagent") {
  const normalized = String(value || fallback).trim().toLowerCase().replace(/-/g, "_");
  if (["main", "main_thread", "mainthread", "orchestrator"].includes(normalized)) return "main-thread";
  if (["thread", "background", "background_thread"].includes(normalized)) return "background_thread";
  if (["worktree", "thread_worktree", "background_worktree"].includes(normalized)) return "thread_worktree";
  if (normalized === "subagent") return "subagent";
  return value || fallback;
}

function loadAssignments(workflowDir) {
  const file = assignmentsFile(workflowDir);
  const records = [];
  const invalid = [];
  if (!fs.existsSync(file)) return { file, records, invalid };
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter((line) => line.trim());
  lines.forEach((line, index) => {
    try {
      records.push({ ...JSON.parse(line), line: index + 1 });
    } catch (error) {
      invalid.push({ line: index + 1, error: error.message });
    }
  });
  return { file, records, invalid };
}

function latestAssignmentForNode(assignments, nodeId) {
  const records = assignments?.records || [];
  return [...records].reverse().find((record) => record.node_id === nodeId) || null;
}

function assignmentHandoffExists(workflowDir, assignment) {
  if (!assignment?.handoff_path) return false;
  const workflowPath = path.join(workflowDir, assignment.handoff_path);
  const projectPath = path.join(projectRootFromWorkflow(workflowDir), assignment.handoff_path);
  return fs.existsSync(workflowPath) || fs.existsSync(projectPath);
}

function validateAssignmentRecord(graph, record, index) {
  const label = `assignments.jsonl:${record.line || index + 1}`;
  const errors = [];
  const map = nodeMap(graph);
  if (record.schema_version !== SCHEMA_VERSION) errors.push(`${label}: schema_version must be 1`);
  if (record.workflow_id !== graph.workflow_id) errors.push(`${label}: workflow_id must match graph.workflow_id`);
  if (!record.node_id || !map.has(record.node_id)) errors.push(`${label}: node_id must reference an existing node`);
  if (!record.agent_id) errors.push(`${label}: agent_id is required`);
  if (record.agent_id && !AGENT_ID_PATTERN.test(record.agent_id)) {
    errors.push(`${label}: agent_id must use lowercase letters, digits, dot, colon, underscore, or hyphen`);
  }
  if (!record.role || typeof record.role !== "string") errors.push(`${label}: role is required`);
  if (!EXECUTION_SURFACES.has(record.execution_surface)) {
    errors.push(`${label}: execution_surface must be one of ${[...EXECUTION_SURFACES].join(", ")}`);
  }
  if (!ASSIGNMENT_STATUSES.has(record.status)) {
    errors.push(`${label}: status must be one of ${[...ASSIGNMENT_STATUSES].join(", ")}`);
  }
  if (record.model_tier !== undefined && record.model_tier !== null && !MODEL_TIERS.has(record.model_tier)) {
    errors.push(`${label}: model_tier must be one of ${[...MODEL_TIERS].join(", ")}`);
  }
  if (record.write_scope !== undefined && (!Array.isArray(record.write_scope) || record.write_scope.some((item) => typeof item !== "string" || !item))) {
    errors.push(`${label}: write_scope must be an array of non-empty strings`);
  }
  for (const field of ["thread_id", "worktree_path", "context_pack", "handoff_path", "model", "notes"]) {
    if (record[field] !== undefined && record[field] !== null && typeof record[field] !== "string") {
      errors.push(`${label}: ${field} must be a string or null`);
    }
  }
  return errors;
}

function validateAssignments(workflowDir, graph) {
  const assignments = loadAssignments(workflowDir);
  const errors = assignments.invalid.map((item) => `assignments.jsonl:${item.line}: invalid JSON: ${item.error}`);
  assignments.records.forEach((record, index) => {
    errors.push(...validateAssignmentRecord(graph, record, index));
  });
  return errors;
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

function evidencePathFromValue(value) {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && !Array.isArray(value) && typeof value.path === "string" && value.path) {
    return value.path;
  }
  return null;
}

function addEvidencePath(paths, value) {
  const itemPath = evidencePathFromValue(value);
  if (itemPath) paths.add(itemPath);
}

function evidenceValues(value) {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

function collectEvidencePaths(handoff) {
  if (!handoff || handoff.status === "missing" || handoff.status === "invalid") return [];
  const paths = new Set();
  for (const value of evidenceValues(handoff.outputs)) addEvidencePath(paths, value);
  for (const value of evidenceValues(handoff.evidence)) addEvidencePath(paths, value);
  for (const item of handoff.work_items || []) {
    for (const value of evidenceValues(item.evidence)) addEvidencePath(paths, value);
  }
  for (const item of handoff.verification || []) {
    if (item.evidence) addEvidencePath(paths, item.evidence);
  }
  for (const value of evidenceValues(handoff.downstream_context?.evidence)) addEvidencePath(paths, value);
  for (const item of handoff.capability_gaps || []) {
    for (const value of evidenceValues(item.evidence)) addEvidencePath(paths, value);
  }
  return [...paths];
}

function evidenceItems(workflowDir, handoff) {
  const root = projectRootFromWorkflow(workflowDir);
  return collectEvidencePaths(handoff).map((itemPath) => {
    const candidates = path.isAbsolute(itemPath)
      ? [itemPath]
      : [path.join(workflowDir, itemPath), path.join(root, itemPath)];
    const exists = candidates.some((candidate) => fs.existsSync(candidate));
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
    provider: typeof value.provider === "string" && value.provider ? value.provider : null,
    model: typeof value.model === "string" && value.model ? value.model : null,
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

function measuredContextUsage(source, fallbackLevel, bytes, inputFiles, notes) {
  return normalizeContextUsage({
    source,
    context_level: fallbackLevel || null,
    source_bytes: Number.isFinite(bytes) ? bytes : undefined,
    estimated_tokens: estimateTokensFromBytes(bytes),
    input_files: Number.isFinite(inputFiles) ? inputFiles : undefined,
    notes,
  }, fallbackLevel);
}

function mergeContextUsage(target, usage) {
  if (!usage?.recorded) return;
  if (Number.isFinite(usage.source_bytes)) target.source_bytes += usage.source_bytes;
  if (Number.isFinite(usage.estimated_tokens)) target.estimated_tokens += usage.estimated_tokens;
  if (Number.isFinite(usage.input_files)) target.input_files += usage.input_files;
}

function countContextSource(target, usage) {
  if (!usage?.recorded) return;
  const source = usage.source || "unknown";
  if (!target.has(source)) {
    target.set(source, {
      source,
      nodes: [],
      source_bytes: 0,
      estimated_tokens: 0,
      input_files: 0,
    });
  }
  const entry = target.get(source);
  if (usage.node_id) entry.nodes.push(usage.node_id);
  mergeContextUsage(entry, usage);
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

function normalizeAssumptions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { text: item, impact: null };
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      return {
        text: item.text || item.summary || null,
        impact: item.impact || null,
      };
    })
    .filter((item) => item?.text);
}

function normalizeIntakeQuestions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      return {
        question: item.question || null,
        answer: item.answer || null,
        options: Array.isArray(item.options) ? item.options : [],
        custom_answer_allowed: item.custom_answer_allowed === true,
        blocking: item.blocking === true,
        resolved: item.resolved === true || Boolean(item.answer),
        reason: item.reason || null,
        index,
      };
    })
    .filter((item) => item?.question);
}

function normalizeExecutionOptions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      return {
        id: item.id || null,
        label: item.label || null,
        summary: item.summary || null,
        tradeoffs: Array.isArray(item.tradeoffs) ? item.tradeoffs : [],
        risks: Array.isArray(item.risks) ? item.risks : [],
        recommended: item.recommended === true,
        index,
      };
    })
    .filter((item) => item?.id && item?.label);
}

function normalizeIntakeDecision(handoff) {
  const decision = handoff?.intake_decision;
  if (!decision || typeof decision !== "object" || Array.isArray(decision)) return null;
  const route = decision.route && typeof decision.route === "object" && !Array.isArray(decision.route) ? decision.route : {};
  const workflow = decision.workflow && typeof decision.workflow === "object" && !Array.isArray(decision.workflow) ? decision.workflow : {};
  return {
    goal: decision.goal || null,
    route: {
      entry: route.entry || null,
      project_type: route.project_type || null,
      mode: route.mode || null,
      next_skill: route.next_skill || null,
    },
    workflow: {
      shape: workflow.shape || null,
      controller_enabled: workflow.controller_enabled === true,
      template_id: workflow.template_id || null,
      reason: workflow.reason || null,
    },
    assumptions: normalizeAssumptions(decision.assumptions),
    questions: normalizeIntakeQuestions(decision.questions),
    execution_options: normalizeExecutionOptions(decision.execution_options),
    selected_option: decision.selected_option || null,
    confirmation: decision.confirmation && typeof decision.confirmation === "object" && !Array.isArray(decision.confirmation)
      ? {
        status: decision.confirmation.status || null,
        by: decision.confirmation.by || null,
        evidence: decision.confirmation.evidence || null,
        notes: decision.confirmation.notes || null,
      }
      : null,
    custom_answers_allowed: decision.custom_answers_allowed === true,
  };
}

function normalizeEvolutionCandidates(handoff) {
  const candidates = Array.isArray(handoff?.evolution_candidates) ? handoff.evolution_candidates : [];
  return candidates
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      return {
        lesson: item.lesson || null,
        scope: item.scope || null,
        promotion_status: item.promotion_status || null,
        owner: item.owner || null,
        update_surface: item.update_surface || null,
        rationale: item.rationale || null,
        next_action: item.next_action || null,
        evidence: Array.isArray(item.evidence) ? item.evidence : [],
        index,
      };
    })
    .filter((item) => item?.lesson);
}

function normalizeCapabilityGaps(handoff) {
  const gaps = Array.isArray(handoff?.capability_gaps) ? handoff.capability_gaps : [];
  return gaps
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      return {
        capability: item.capability || null,
        need: item.need || null,
        current_gap: item.current_gap || null,
        candidate_tool: item.candidate_tool && typeof item.candidate_tool === "object" && !Array.isArray(item.candidate_tool)
          ? {
            name: item.candidate_tool.name || null,
            repo: item.candidate_tool.repo || null,
            url: item.candidate_tool.url || null,
            source_mark: item.candidate_tool.source_mark || null,
            license: item.candidate_tool.license || null,
            stars: Number.isInteger(item.candidate_tool.stars) ? item.candidate_tool.stars : null,
          }
          : null,
        integration_path: item.integration_path || null,
        status: item.status || null,
        rationale: item.rationale || null,
        trial_plan: item.trial_plan || null,
        decision_reason: item.decision_reason || null,
        owner: item.owner || null,
        next_action: item.next_action || null,
        evidence: Array.isArray(item.evidence) ? item.evidence : [],
        index,
      };
    })
    .filter((item) => item?.capability);
}

function normalizeKnowledgeSync(handoff) {
  const value = handoff?.knowledge_sync;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return {
    status: value.status || null,
    reason: value.reason || null,
    skill: value.skill || null,
    performed_by: value.performed_by || null,
    files_reviewed: Array.isArray(value.files_reviewed) ? value.files_reviewed : [],
    files_updated: Array.isArray(value.files_updated) ? value.files_updated : [],
    memory_updated: Array.isArray(value.memory_updated) ? value.memory_updated : [],
    evidence: Array.isArray(value.evidence) ? value.evidence : [],
  };
}

function normalizeDownstreamContext(handoff) {
  const value = handoff?.downstream_context;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return {
    target_nodes: Array.isArray(value.target_nodes) ? value.target_nodes : [],
    summary: value.summary || null,
    required_inputs: Array.isArray(value.required_inputs) ? value.required_inputs : [],
    evidence: Array.isArray(value.evidence) ? value.evidence : [],
    carry_forward_risks: Array.isArray(value.carry_forward_risks) ? value.carry_forward_risks : [],
    context_budget: value.context_budget && typeof value.context_budget === "object" && !Array.isArray(value.context_budget)
      ? {
        level: value.context_budget.level || null,
        max_source_files: Number.isInteger(value.context_budget.max_source_files) ? value.context_budget.max_source_files : null,
        notes: value.context_budget.notes || null,
      }
      : null,
    handoff_contract: value.handoff_contract || null,
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

function normalizeSkillsUsed(value) {
  const skills = Array.isArray(value) ? value : [];
  return skills
    .map((item) => {
      if (typeof item === "string") {
        return {
          name: item,
          source: null,
          path: null,
          purpose: null,
          triggered_by: null,
          evidence: [],
        };
      }
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const name = item.name || item.skill || item.id;
      if (!name) return null;
      return {
        name,
        source: item.source || null,
        path: item.path || null,
        purpose: item.purpose || item.reason || null,
        triggered_by: item.triggered_by || null,
        evidence: Array.isArray(item.evidence) ? item.evidence : [],
      };
    })
    .filter(Boolean);
}

function mergeSkillRecords(...skillLists) {
  const map = new Map();
  for (const skill of skillLists.flat()) {
    if (!skill?.name) continue;
    const key = String(skill.name).toLowerCase();
    if (!map.has(key)) {
      map.set(key, { ...skill, evidence: [...(skill.evidence || [])] });
      continue;
    }
    const current = map.get(key);
    current.source ||= skill.source || null;
    current.path ||= skill.path || null;
    current.purpose ||= skill.purpose || null;
    current.triggered_by ||= skill.triggered_by || null;
    current.evidence = [...new Set([...(current.evidence || []), ...(skill.evidence || [])])];
  }
  return [...map.values()];
}

function normalizeSkillDecisions(value) {
  const decisions = Array.isArray(value) ? value : [];
  return decisions
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const selected = item.selected || item.skill || item.name;
      if (!item.capability || !selected) return null;
      return {
        capability: item.capability,
        selected,
        rationale: item.rationale || item.reason || null,
        selection_basis: Array.isArray(item.selection_basis) ? item.selection_basis : [],
        alternatives: Array.isArray(item.alternatives)
          ? item.alternatives
            .filter((alternative) => alternative?.name)
            .map((alternative) => ({
              name: alternative.name,
              decision: alternative.decision || null,
              reason: alternative.reason || null,
              strength: alternative.strength || null,
            }))
          : [],
        fallback_policy: item.fallback_policy && typeof item.fallback_policy === "object" && !Array.isArray(item.fallback_policy)
          ? {
            when: item.fallback_policy.when || null,
            next_skill: item.fallback_policy.next_skill || null,
            action: item.fallback_policy.action || null,
          }
          : null,
        user_feedback: item.user_feedback && typeof item.user_feedback === "object" && !Array.isArray(item.user_feedback)
          ? {
            status: item.user_feedback.status || null,
            summary: item.user_feedback.summary || null,
            evidence: Array.isArray(item.user_feedback.evidence) ? item.user_feedback.evidence : [],
          }
          : null,
        outcome: item.outcome || null,
        evidence: Array.isArray(item.evidence) ? item.evidence : [],
      };
    })
    .filter(Boolean);
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
    model_provider: item.model_provider || null,
    model_selection_reason: item.model_selection_reason || null,
    model_unavailable_reason: item.model_unavailable_reason || null,
    started_at: item.started_at || null,
    completed_at: item.completed_at || null,
    evidence: Array.isArray(item.evidence) ? item.evidence : [],
    skills_used: normalizeSkillsUsed(item.skills_used),
    token_usage: normalizeTokenUsage(item.token_usage),
    context_usage: normalizeContextUsage(item.context_usage, null),
  }));
}

function mergeModelRecords(records) {
  const map = new Map();
  for (const record of records) {
    if (!record?.model) continue;
    const key = [record.model, record.provider || ""].join("\u0000");
    if (!map.has(key)) {
      map.set(key, {
        model: record.model,
        provider: record.provider || null,
        model_tier: record.model_tier || null,
        source: record.source || "recorded",
        reason: record.reason || null,
        agent_id: record.agent_id || null,
        role: record.role || null,
      });
      continue;
    }
    const current = map.get(key);
    current.model_tier ||= record.model_tier || null;
    current.source = [...new Set([current.source, record.source].filter(Boolean))].join(", ");
    current.reason ||= record.reason || null;
    current.agent_id ||= record.agent_id || null;
    current.role ||= record.role || null;
  }
  return [...map.values()];
}

function actualModelRecords(handoff, tokenUsage, agentActivity) {
  const records = [];
  const fallbackProvider = handoff?.model_provider || tokenUsage?.provider || null;
  if (handoff?.model) {
    records.push({
      model: handoff.model,
      provider: fallbackProvider,
      model_tier: handoff.model_tier || null,
      source: "handoff",
      reason: handoff.model_selection_reason || null,
    });
  }
  if (tokenUsage?.model) {
    records.push({
      model: tokenUsage.model,
      provider: tokenUsage.provider || fallbackProvider,
      source: tokenUsage.source || "token_usage",
    });
  }
  for (const activity of agentActivity || []) {
    if (activity.model) {
      records.push({
        model: activity.model,
        provider: activity.model_provider || fallbackProvider,
        model_tier: activity.model_tier || null,
        source: "agent_activity",
        reason: activity.model_selection_reason || null,
        agent_id: activity.agent_id,
        role: activity.role,
      });
    }
    if (activity.token_usage?.model) {
      records.push({
        model: activity.token_usage.model,
        provider: activity.token_usage.provider || fallbackProvider,
        model_tier: activity.model_tier || null,
        source: activity.token_usage.source || "agent_token_usage",
        agent_id: activity.agent_id,
        role: activity.role,
      });
    }
  }
  return mergeModelRecords(records);
}

function firstNonEmpty(values) {
  return values.find((value) => typeof value === "string" && value.trim()) || null;
}

function normalizeUsageObservation(handoff, tokenUsage, actualModels, agentActivity) {
  const value = handoff?.usage_observation && typeof handoff.usage_observation === "object" && !Array.isArray(handoff.usage_observation)
    ? handoff.usage_observation
    : {};
  const agentModelUnavailable = firstNonEmpty((agentActivity || []).map((item) => item.model_unavailable_reason));
  const modelRecorded = actualModels.length > 0;
  const tokenRecorded = Boolean(tokenUsage?.recorded);
  const modelUnavailableReason = value.model_unavailable_reason || agentModelUnavailable;
  const tokenUnavailableReason = value.token_unavailable_reason || null;
  const modelStatus = modelRecorded
    ? "recorded"
    : value.model_status || (modelUnavailableReason ? "unavailable" : "not_recorded");
  const tokenStatus = tokenRecorded
    ? "recorded"
    : value.token_status || (tokenUnavailableReason ? "unavailable" : "not_recorded");
  return {
    model_status: modelStatus,
    token_status: tokenStatus,
    model_unavailable_reason: modelUnavailableReason,
    token_unavailable_reason: tokenUnavailableReason,
    source: value.source || (modelRecorded || tokenRecorded ? "recorded_usage" : "not_recorded"),
    runtime_surface: value.runtime_surface || null,
    evidence: Array.isArray(value.evidence) ? value.evidence : [],
    notes: value.notes || null,
  };
}

function tokenUsageAccounted(node) {
  return Boolean(node.token_usage?.recorded)
    || (node.usage_observation?.token_status === "unavailable" && Boolean(node.usage_observation.token_unavailable_reason))
    || node.usage_observation?.token_status === "not_applicable";
}

function modelUsageAccounted(node) {
  return node.actual_models.length > 0
    || (node.usage_observation?.model_status === "unavailable" && Boolean(node.usage_observation.model_unavailable_reason))
    || node.usage_observation?.model_status === "not_applicable";
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

function contextPackPath(workflowDir, nodeId) {
  return path.join(workflowDir, "context-packs", `${nodeId}.json`);
}

function readContextPackUsage(workflowDir, nodeId, fallbackLevel) {
  const file = contextPackPath(workflowDir, nodeId);
  const bytes = fileSizeIfExists(file);
  if (!Number.isFinite(bytes)) return normalizeContextUsage(null, fallbackLevel);
  try {
    const payload = readJson(file);
    const embedded = normalizeContextUsage(payload.context_usage, fallbackLevel);
    if (embedded.recorded) return embedded;
  } catch {
    // Fall through to file-size measurement; stale or malformed packs are still useful as size evidence.
  }
  return measuredContextUsage(
    "controller_context_pack_file",
    fallbackLevel,
    bytes,
    null,
    "Measured serialized context-pack file. Excludes exact source files the worker may load later.",
  );
}

function dependencyHandoffEstimate(handoffs, state, dependencyId) {
  const handoff = latestHandoffForNode(state.nodes?.[dependencyId] || {}, handoffs, dependencyId);
  return {
    node_id: dependencyId,
    status: state.nodes?.[dependencyId]?.status || handoff?.status || null,
    handoff: handoff?.path || null,
    summary: handoff?.summary || null,
    outputs: handoff?.outputs || [],
    downstream_context: handoff?.downstream_context
      ? {
        target_nodes: handoff.downstream_context.target_nodes || [],
        summary: handoff.downstream_context.summary || null,
        required_inputs: handoff.downstream_context.required_inputs || [],
        evidence: handoff.downstream_context.evidence || [],
        carry_forward_risks: handoff.downstream_context.carry_forward_risks || [],
      }
      : null,
  };
}

function downstreamContextEstimatesForNode(handoffs, nodeId) {
  return handoffs.records
    .filter((handoff) => handoff.downstream_context)
    .filter((handoff) => {
      const targets = handoff.downstream_context.target_nodes || [];
      return targets.length === 0 || targets.includes(nodeId);
    })
    .map((handoff) => ({
      source_node_id: handoff.node_id || null,
      source_handoff: handoff.path || null,
      target_nodes: handoff.downstream_context.target_nodes || [],
      summary: handoff.downstream_context.summary || null,
      required_inputs: handoff.downstream_context.required_inputs || [],
      evidence: handoff.downstream_context.evidence || [],
      carry_forward_risks: handoff.downstream_context.carry_forward_risks || [],
    }));
}

function buildNodeContextEstimatePayload(workflowDir, state, handoffs, allEvents, node, card, fallbackLevel) {
  return {
    node_contract: {
      node_id: node.id,
      title: card.title || node.title,
      type: node.type,
      status: state.nodes?.[node.id]?.status || "missing",
      objective: card.objective || node.objective || nodeObjective(node),
      acceptance: card.acceptance || node.acceptance || [],
      context_level: fallbackLevel,
      worker_profile: card.worker_profile || node.worker_profile || null,
      model_tier: card.model_tier || node.model_tier || null,
      allowed_outputs: card.allowed_outputs || node.allowed_outputs || [],
      allowed_scope: card.allowed_scope || [],
    },
    dependency_handoffs: (node.depends_on || []).map((dependency) => dependencyHandoffEstimate(handoffs, state, dependency)),
    downstream_contexts: downstreamContextEstimatesForNode(handoffs, node.id),
    recent_events: allEvents
      .filter((event) => !event.node_id || event.node_id === node.id || (node.depends_on || []).includes(event.node_id))
      .slice(-8)
      .map((event) => ({
        at: event.at || null,
        event: event.event || null,
        node_id: event.node_id || null,
        handoff: event.handoff || null,
        reason: event.reason || null,
      })),
    required_files: ["state.json", "graph.json", `nodes/${node.id}.json`],
    dependency_files: (node.depends_on || []).map((dependency) => `handoffs/${dependency}.json or latest handoff summary`),
    workflow_files_bytes: {
      node_card: fileSizeIfExists(path.join(workflowDir, "nodes", `${node.id}.json`)),
      state: fileSizeIfExists(path.join(workflowDir, "state.json")),
      graph: fileSizeIfExists(path.join(workflowDir, "graph.json")),
    },
    handoff_contract: {
      required: true,
      output_path: `handoffs/${node.id}.json`,
      record_downstream_context: true,
      record_context_usage: true,
    },
  };
}

function deriveContextUsageFromController(workflowDir, state, handoffs, allEvents, node, card, fallbackLevel) {
  const contextPackUsage = readContextPackUsage(workflowDir, node.id, fallbackLevel);
  if (contextPackUsage.recorded) return contextPackUsage;
  const payload = buildNodeContextEstimatePayload(workflowDir, state, handoffs, allEvents, node, card, fallbackLevel);
  const inputFiles = payload.required_files.length + payload.dependency_files.length;
  return measuredContextUsage(
    "controller_context_estimate",
    fallbackLevel,
    jsonBytes(payload),
    inputFiles,
    "Estimated from node contract, dependency handoff summaries, downstream context, recent events, and workflow file sizes. Excludes exact source files loaded during implementation.",
  );
}

function measureTaskSize(node, card, display) {
  const payload = {
    node_id: node.id,
    type: node.type,
    title: display.title || card.title || node.title,
    objective: display.objective || card.objective || node.objective || nodeObjective(node),
    acceptance: display.acceptance || card.acceptance || node.acceptance || [],
    depends_on: node.depends_on || [],
    allowed_outputs: card.allowed_outputs || node.allowed_outputs || [],
    allowed_scope: card.allowed_scope || [],
    context_level: node.context_level || card.context_level || "focus",
    worker_profile: card.worker_profile || node.worker_profile || null,
    model_tier: card.model_tier || node.model_tier || null,
  };
  const bytes = jsonBytes(payload);
  return {
    source: "controller_node_contract",
    source_bytes: bytes,
    estimated_tokens: estimateTokensFromBytes(bytes),
    fields: ["title", "objective", "acceptance", "depends_on", "allowed_outputs", "allowed_scope"],
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
  const intakeDecision = normalizeIntakeDecision(handoff);
  const evolutionCandidates = normalizeEvolutionCandidates(handoff);
  const capabilityGaps = normalizeCapabilityGaps(handoff);
  const knowledgeSync = normalizeKnowledgeSync(handoff);
  const downstreamContext = normalizeDownstreamContext(handoff);
  const workItems = normalizeWorkItems(handoff);
  const changedFiles = normalizeChangedFiles(handoff);
  const agentActivity = normalizeAgentActivity(handoff);
  const skillsUsed = mergeSkillRecords(
    normalizeSkillsUsed(handoff?.skills_used),
    agentActivity.flatMap((activity) => activity.skills_used || []),
  );
  const skillDecisions = normalizeSkillDecisions(handoff?.skill_decisions);
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
  const modelProfile = collaborationValue(node, card, "model_profile", null);
  const recommended = recommendedModelForNode({
    node,
    card,
    modelTier,
    taskComplexity,
    modelProfile,
    language,
  });
  const actualModels = actualModelRecords(handoff, tokenUsage, agentActivity);
  const usageObservation = normalizeUsageObservation(handoff, tokenUsage, actualModels, agentActivity);
  const estimatedMinutes = Number.isFinite(node.estimated_minutes)
    ? node.estimated_minutes
    : Number.isFinite(card.estimated_minutes)
      ? card.estimated_minutes
      : policy.estimated_minutes;
  const explicitContextUsage = normalizeContextUsage(handoff?.context_usage, node.context_level || card.context_level || "focus");
  const agentContextUsage = deriveContextUsageFromAgents(agentActivity, node.context_level || card.context_level || "focus");
  const contextUsage = explicitContextUsage.recorded
    ? explicitContextUsage
    : agentContextUsage.recorded
      ? agentContextUsage
      : deriveContextUsageFromController(workflowDir, state, handoffs, allEvents, node, card, node.context_level || card.context_level || "focus");
  const taskSize = measureTaskSize(node, card, display);
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
    recommended_model: recommended.model,
    recommended_model_reason: recommended.reason,
    recommended_model_source: recommended.source,
    actual_models: actualModels,
    usage_observation: usageObservation,
    estimated_minutes: estimatedMinutes,
    worker_profile: collaborationValue(node, card, "worker_profile", "unassigned"),
    agent: collaborationValue(node, card, "agent", null),
    model_profile: modelProfile,
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
    intake_decision: intakeDecision,
    downstream_context: downstreamContext,
    evolution_review_recorded: Array.isArray(handoff?.evolution_candidates),
    evolution_candidates: evolutionCandidates,
    capability_gaps: capabilityGaps,
    knowledge_sync_reviewed: Boolean(knowledgeSync),
    knowledge_sync: knowledgeSync,
    work_items: workItems,
    changed_files: changedFiles,
    skills_used: skillsUsed,
    skill_decisions: skillDecisions,
    skill_decision_reviewed: skillsUsed.length === 0 || skillDecisions.length > 0,
    agent_activity: agentActivity,
    token_usage: tokenUsage,
    context_usage: contextUsage,
    task_size: taskSize,
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
  if (running.length > 0) return `${text.completeHandoff} ${running[0].id} ${text.withHandoff}`;
  if (ready.length > 0) return `${text.start} ${ready[0].id}.`;
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

function activeAssignment(record) {
  return !["passed", "failed", "blocked", "cancelled"].includes(record.status);
}

function scopeOverlaps(left, right) {
  if (!left || !right) return false;
  if (left === right || left === "**" || right === "**") return true;
  const leftPrefix = left.endsWith("/**") ? left.slice(0, -3) : null;
  const rightPrefix = right.endsWith("/**") ? right.slice(0, -3) : null;
  if (leftPrefix && right.startsWith(leftPrefix)) return true;
  if (rightPrefix && left.startsWith(rightPrefix)) return true;
  return false;
}

function buildAssignmentProjection(workflowDir, assignmentData, projectedNodes) {
  const records = assignmentData.records.map((record) => ({
    assignment_id: record.assignment_id || `${record.node_id}:${record.agent_id}:${record.line || "record"}`,
    workflow_id: record.workflow_id,
    node_id: record.node_id,
    agent_id: record.agent_id,
    role: record.role,
    execution_surface: record.execution_surface,
    status: record.status,
    thread_id: record.thread_id || null,
    worktree_path: record.worktree_path || null,
    model_tier: record.model_tier || null,
    model: record.model || null,
    write_scope: Array.isArray(record.write_scope) ? record.write_scope : [],
    context_pack: record.context_pack || null,
    handoff_path: record.handoff_path || null,
    handoff_exists: assignmentHandoffExists(workflowDir, record),
    notes: record.notes || null,
    at: record.at || null,
    line: record.line || null,
  }));
  const nodes = new Set(projectedNodes.map((node) => node.id));
  const byNode = [...nodes].map((nodeId) => ({
    node_id: nodeId,
    assignments: records.filter((record) => record.node_id === nodeId),
  })).filter((item) => item.assignments.length > 0);
  const byAgentMap = new Map();
  const bySurfaceMap = new Map();
  for (const record of records) {
    if (!byAgentMap.has(record.agent_id)) {
      byAgentMap.set(record.agent_id, {
        agent_id: record.agent_id,
        role: record.role,
        execution_surface: record.execution_surface,
        nodes: [],
        statuses: {},
        thread_ids: new Set(),
        worktrees: new Set(),
      });
    }
    const agent = byAgentMap.get(record.agent_id);
    agent.nodes.push(record.node_id);
    agent.statuses[record.status] = (agent.statuses[record.status] || 0) + 1;
    if (record.thread_id) agent.thread_ids.add(record.thread_id);
    if (record.worktree_path) agent.worktrees.add(record.worktree_path);

    if (!bySurfaceMap.has(record.execution_surface)) {
      bySurfaceMap.set(record.execution_surface, { execution_surface: record.execution_surface, count: 0, nodes: [] });
    }
    const surface = bySurfaceMap.get(record.execution_surface);
    surface.count += 1;
    surface.nodes.push(record.node_id);
  }
  const activeRecords = records.filter(activeAssignment);
  const missingHandoffs = records
    .filter((record) => record.status !== "cancelled")
    .filter((record) => !record.handoff_exists)
    .map((record) => ({
      node_id: record.node_id,
      agent_id: record.agent_id,
      status: record.status,
      handoff_path: record.handoff_path || null,
    }));
  const conflicts = [];
  for (let i = 0; i < activeRecords.length; i += 1) {
    for (let j = i + 1; j < activeRecords.length; j += 1) {
      const left = activeRecords[i];
      const right = activeRecords[j];
      if (left.agent_id === right.agent_id) continue;
      for (const leftScope of left.write_scope) {
        for (const rightScope of right.write_scope) {
          if (scopeOverlaps(leftScope, rightScope)) {
            conflicts.push({
              left_agent_id: left.agent_id,
              left_node_id: left.node_id,
              right_agent_id: right.agent_id,
              right_node_id: right.node_id,
              scope: leftScope === rightScope ? leftScope : `${leftScope} <> ${rightScope}`,
            });
          }
        }
      }
    }
  }
  return {
    file: path.basename(assignmentData.file),
    records,
    active: activeRecords,
    by_node: byNode,
    by_agent: [...byAgentMap.values()].map((agent) => ({
      agent_id: agent.agent_id,
      role: agent.role,
      execution_surface: agent.execution_surface,
      nodes: [...new Set(agent.nodes)],
      statuses: agent.statuses,
      thread_ids: [...agent.thread_ids],
      worktrees: [...agent.worktrees],
    })),
    by_surface: [...bySurfaceMap.values()].map((surface) => ({
      execution_surface: surface.execution_surface,
      count: surface.count,
      nodes: [...new Set(surface.nodes)],
    })),
    missing_handoffs: missingHandoffs,
    write_scope_conflicts: conflicts,
  };
}

function buildCollaboration(projectedNodes, assignments = null) {
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
    agent_roster: assignments?.by_agent || [],
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
  const accountedNodes = [];
  const unavailableNodes = [];
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
      accountedNodes.push(node.id);
    } else if (tokenUsageAccounted(node)) {
      accountedNodes.push(node.id);
      if (node.usage_observation?.token_status === "unavailable") unavailableNodes.push(node.id);
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
    accounted_nodes: accountedNodes,
    unavailable_nodes: unavailableNodes,
    missing_nodes: missingNodes,
    coverage_percent: projectedNodes.length === 0 ? 100 : Math.round((accountedNodes.length / projectedNodes.length) * 100),
    recorded_value_coverage_percent: projectedNodes.length === 0 ? 100 : Math.round((byNode.length / projectedNodes.length) * 100),
    by_node: byNode,
    by_agent: [...byAgent.values()],
    by_parallel_group: [...byParallelGroup.values()],
  };
}

function buildContextUsage(projectedNodes) {
  const totals = { source_bytes: 0, estimated_tokens: 0, input_files: 0 };
  const byNode = [];
  const byAgent = new Map();
  const bySource = new Map();
  const missingNodes = [];
  for (const node of projectedNodes) {
    if (node.context_usage.recorded) {
      mergeContextUsage(totals, node.context_usage);
      byNode.push({ node_id: node.id, ...node.context_usage });
      countContextSource(bySource, { node_id: node.id, ...node.context_usage });
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
    by_source: [...bySource.values()],
  };
}

function buildTaskSize(projectedNodes) {
  const totals = { source_bytes: 0, estimated_tokens: 0 };
  const byNode = [];
  for (const node of projectedNodes) {
    if (!node.task_size) continue;
    if (Number.isFinite(node.task_size.source_bytes)) totals.source_bytes += node.task_size.source_bytes;
    if (Number.isFinite(node.task_size.estimated_tokens)) totals.estimated_tokens += node.task_size.estimated_tokens;
    byNode.push({ node_id: node.id, ...node.task_size });
  }
  return {
    totals,
    measured_nodes: byNode.length,
    by_node: byNode,
    largest_nodes: [...byNode]
      .sort((left, right) => (right.estimated_tokens || 0) - (left.estimated_tokens || 0))
      .slice(0, 5),
  };
}

function buildSkillUsage(projectedNodes) {
  const byNode = [];
  const bySkill = new Map();
  const decisionNodes = [];
  const decisionMissingNodes = [];
  const byCapability = new Map();
  const needsRevision = [];
  const byAgent = new Map();
  const missingNodes = [];
  for (const node of projectedNodes) {
    if (node.skills_used.length > 0) {
      byNode.push({ node_id: node.id, skills: node.skills_used });
      for (const skill of node.skills_used) {
        const key = skill.name;
        if (!bySkill.has(key)) {
          bySkill.set(key, { name: skill.name, nodes: [], sources: new Set(), paths: new Set(), purposes: new Set() });
        }
        const entry = bySkill.get(key);
        entry.nodes.push(node.id);
        if (skill.source) entry.sources.add(skill.source);
        if (skill.path) entry.paths.add(skill.path);
        if (skill.purpose) entry.purposes.add(skill.purpose);
      }
      if (node.skill_decisions.length > 0) {
        decisionNodes.push({ node_id: node.id, decisions: node.skill_decisions });
        for (const decision of node.skill_decisions) {
          const key = decision.capability;
          if (!byCapability.has(key)) {
            byCapability.set(key, { capability: key, nodes: [], selected: new Set(), outcomes: new Set(), next_retries: new Set() });
          }
          const entry = byCapability.get(key);
          entry.nodes.push(node.id);
          if (decision.selected) entry.selected.add(decision.selected);
          if (decision.outcome) entry.outcomes.add(decision.outcome);
          if (decision.fallback_policy?.next_skill) entry.next_retries.add(decision.fallback_policy.next_skill);
          if (["needs_revision", "rejected"].includes(decision.user_feedback?.status) || ["needs_revision", "switched"].includes(decision.outcome)) {
            needsRevision.push({
              node_id: node.id,
              capability: decision.capability,
              selected: decision.selected,
              feedback: decision.user_feedback?.summary || null,
              next_skill: decision.fallback_policy?.next_skill || null,
              action: decision.fallback_policy?.action || null,
            });
          }
        }
      } else {
        decisionMissingNodes.push(node.id);
      }
    } else {
      missingNodes.push(node.id);
    }
    for (const activity of node.agent_activity) {
      for (const skill of activity.skills_used || []) {
        const key = `${activity.agent_id}:${skill.name}`;
        if (!byAgent.has(key)) {
          byAgent.set(key, {
            agent_id: activity.agent_id,
            role: activity.role,
            skill: skill.name,
            nodes: [],
            purposes: new Set(),
          });
        }
        const entry = byAgent.get(key);
        entry.nodes.push(node.id);
        if (skill.purpose) entry.purposes.add(skill.purpose);
      }
    }
  }
  return {
    recorded_nodes: byNode.length,
    missing_nodes: missingNodes,
    coverage_percent: projectedNodes.length === 0 ? 100 : Math.round((byNode.length / projectedNodes.length) * 100),
    selection_recorded_nodes: decisionNodes.length,
    selection_missing_nodes: decisionMissingNodes,
    selection_coverage_percent: byNode.length === 0 ? 100 : Math.round((decisionNodes.length / byNode.length) * 100),
    by_node: byNode,
    by_skill: [...bySkill.values()].map((entry) => ({
      name: entry.name,
      nodes: [...new Set(entry.nodes)],
      sources: [...entry.sources],
      paths: [...entry.paths],
      purposes: [...entry.purposes],
    })),
    decisions_by_node: decisionNodes,
    by_capability: [...byCapability.values()].map((entry) => ({
      capability: entry.capability,
      nodes: [...new Set(entry.nodes)],
      selected: [...entry.selected],
      outcomes: [...entry.outcomes],
      next_retries: [...entry.next_retries],
    })),
    needs_revision: needsRevision,
    by_agent: [...byAgent.values()].map((entry) => ({
      agent_id: entry.agent_id,
      role: entry.role,
      skill: entry.skill,
      nodes: [...new Set(entry.nodes)],
      purposes: [...entry.purposes],
    })),
  };
}

function buildModelUsage(projectedNodes) {
  const byNode = [];
  const byRecommendedModel = new Map();
  const byActualModel = new Map();
  const missingActualNodes = [];
  const accountedNodes = [];
  const unavailableNodes = [];
  for (const node of projectedNodes) {
    const recommendedKey = node.recommended_model || "unassigned";
    if (!byRecommendedModel.has(recommendedKey)) {
      byRecommendedModel.set(recommendedKey, { model: recommendedKey, nodes: [], tiers: new Set(), sources: new Set(), reasons: new Set() });
    }
    const recommended = byRecommendedModel.get(recommendedKey);
    recommended.nodes.push(node.id);
    if (node.model_tier) recommended.tiers.add(node.model_tier);
    if (node.recommended_model_source) recommended.sources.add(node.recommended_model_source);
    if (node.recommended_model_reason) recommended.reasons.add(node.recommended_model_reason);

    if (node.actual_models.length === 0) {
      if (modelUsageAccounted(node)) {
        accountedNodes.push(node.id);
        if (node.usage_observation?.model_status === "unavailable") unavailableNodes.push(node.id);
      } else {
        missingActualNodes.push(node.id);
      }
    } else {
      accountedNodes.push(node.id);
      for (const record of node.actual_models) {
        const key = [record.model, record.provider || ""].join("\u0000");
        if (!byActualModel.has(key)) {
          byActualModel.set(key, { model: record.model, provider: record.provider || null, nodes: [], sources: new Set(), tiers: new Set(), agents: new Set() });
        }
        const actual = byActualModel.get(key);
        actual.nodes.push(node.id);
        if (record.source) actual.sources.add(record.source);
        if (record.model_tier) actual.tiers.add(record.model_tier);
        if (record.agent_id) actual.agents.add(record.agent_id);
      }
    }
    byNode.push({
      node_id: node.id,
      model_tier: node.model_tier,
      recommended_model: node.recommended_model,
      recommended_model_source: node.recommended_model_source,
      actual_models: node.actual_models,
      usage_observation: node.usage_observation,
    });
  }
  return {
    recommended_nodes: projectedNodes.filter((node) => node.recommended_model).length,
    actual_recorded_nodes: projectedNodes.filter((node) => node.actual_models.length > 0).length,
    accounted_nodes: accountedNodes,
    unavailable_nodes: unavailableNodes,
    missing_actual_nodes: missingActualNodes,
    actual_coverage_percent: projectedNodes.length === 0 ? 100 : Math.round((accountedNodes.length / projectedNodes.length) * 100),
    recorded_value_coverage_percent: projectedNodes.length === 0 ? 100 : Math.round((projectedNodes.filter((node) => node.actual_models.length > 0).length / projectedNodes.length) * 100),
    by_node: byNode,
    recommended_by_model: [...byRecommendedModel.values()].map((entry) => ({
      model: entry.model,
      nodes: [...new Set(entry.nodes)],
      tiers: [...entry.tiers],
      sources: [...entry.sources],
      reasons: [...entry.reasons],
    })),
    actual_by_model: [...byActualModel.values()].map((entry) => ({
      model: entry.model,
      provider: entry.provider,
      nodes: [...new Set(entry.nodes)],
      sources: [...entry.sources],
      tiers: [...entry.tiers],
      agents: [...entry.agents],
    })),
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

function countBy(items, field) {
  const counts = {};
  for (const item of items) {
    const key = item[field] || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function buildEvolution(projectedNodes) {
  const byNode = projectedNodes
    .filter((node) => node.evolution_review_recorded || node.evolution_candidates.length > 0)
    .map((node) => ({
      node_id: node.id,
      title: node.display_title || node.title,
      status: node.status,
      review_recorded: node.evolution_review_recorded,
      candidates: node.evolution_candidates,
    }));
  const candidates = projectedNodes.flatMap((node) => node.evolution_candidates.map((candidate) => ({
    node_id: node.id,
    title: node.display_title || node.title,
    status: node.status,
    ...candidate,
  })));
  return {
    recorded_nodes: byNode.filter((item) => item.review_recorded).length,
    missing_review_nodes: projectedNodes
      .filter((node) => node.type === "delivery" && TERMINAL_STATUSES.has(node.status) && !node.evolution_review_recorded)
      .map((node) => node.id),
    by_node: byNode,
    candidates,
    by_scope: countBy(candidates, "scope"),
    by_status: countBy(candidates, "promotion_status"),
    generic_candidates: candidates.filter((candidate) => (
      candidate.scope === "generic_omykit"
      && ["candidate", "needs_review"].includes(candidate.promotion_status)
    )),
  };
}

function buildCapabilityGaps(projectedNodes) {
  const byNode = projectedNodes
    .filter((node) => node.capability_gaps.length > 0)
    .map((node) => ({
      node_id: node.id,
      title: node.display_title || node.title,
      status: node.status,
      gaps: node.capability_gaps,
    }));
  const gaps = projectedNodes.flatMap((node) => node.capability_gaps.map((gap) => ({
    node_id: node.id,
    title: node.display_title || node.title,
    status: node.status,
    ...gap,
  })));
  return {
    recorded_nodes: byNode.length,
    gaps,
    by_node: byNode,
    by_status: countBy(gaps, "status"),
    by_integration_path: countBy(gaps, "integration_path"),
    generic_candidates: gaps.filter((gap) => ["omykit_candidate_branch", "main_after_review"].includes(gap.integration_path)),
    local_trials: gaps.filter((gap) => ["local_only", "project_local"].includes(gap.integration_path) && ["trial_needed", "trialing"].includes(gap.status)),
  };
}

function dependencyHandoffSummaries(node, projectedNodes) {
  const byId = new Map(projectedNodes.map((item) => [item.id, item]));
  return (node.depends_on || []).map((dependency) => {
    const source = byId.get(dependency);
    return {
      node_id: dependency,
      status: source?.status || null,
      handoff: source?.last_handoff || null,
      summary: source?.handoff_summary || null,
      work_items: (source?.work_items || []).map((item) => ({
        title: item.title,
        status: item.status,
        detail: item.detail || null,
      })),
      outputs: source?.handoff_outputs || [],
      evidence_paths: source?.evidence_paths || [],
      downstream_context: source?.downstream_context || null,
    };
  });
}

function downstreamContextsForNode(projectedNodes, nodeId) {
  return projectedNodes
    .filter((node) => node.downstream_context)
    .filter((node) => {
      const targets = node.downstream_context.target_nodes || [];
      return targets.length === 0 || targets.includes(nodeId);
    })
    .map((node) => ({
      source_node_id: node.id,
      source_handoff: node.last_handoff || null,
      ...node.downstream_context,
    }));
}

function contextPackComponents(payload) {
  return [
    ["node", payload.node],
    ["dependency_handoffs", payload.dependency_handoffs || []],
    ["downstream_contexts", payload.downstream_contexts || []],
    ["assignments", payload.assignments || []],
    ["handoff_contract", payload.handoff_contract || {}],
    ["context_policy", payload.context_policy || {}],
    ["active_commands", payload.active_commands || []],
    ["recent_events", payload.recent_events || []],
    ["resume_pointers", payload.resume_pointers || {}],
    ["context_loss_guard", payload.context_loss_guard || {}],
  ].map(([name, value]) => ({
    name,
    source_bytes: jsonBytes(value),
    estimated_tokens: estimateTokensFromBytes(jsonBytes(value)),
  }));
}

function attachContextPackMeasurement(payload) {
  const firstPassBytes = jsonBytes(payload);
  const withUsage = {
    ...payload,
    context_usage: {
      source: "controller_context_pack",
      context_level: payload.context_policy?.level || payload.node?.context_level || null,
      source_bytes: firstPassBytes,
      estimated_tokens: estimateTokensFromBytes(firstPassBytes),
      input_files: (payload.context_policy?.required_files?.length || 0) + (payload.context_policy?.dependency_files?.length || 0),
      notes: "Measured serialized context pack. Exact source files loaded later must be recorded separately by the worker when available.",
    },
    context_measurement: {
      source: "controller_context_pack",
      method: `serialized_json_bytes_div_${ESTIMATED_BYTES_PER_TOKEN}`,
      source_bytes: firstPassBytes,
      estimated_tokens: estimateTokensFromBytes(firstPassBytes),
      components: contextPackComponents(payload),
      excludes: [
        "Full conversation history",
        "Full project source files not explicitly loaded by the worker",
        "Provider-reported model token counters",
      ],
    },
  };
  const finalBytes = jsonBytes(withUsage);
  withUsage.context_usage.source_bytes = finalBytes;
  withUsage.context_usage.estimated_tokens = estimateTokensFromBytes(finalBytes);
  withUsage.context_measurement.source_bytes = finalBytes;
  withUsage.context_measurement.estimated_tokens = estimateTokensFromBytes(finalBytes);
  return withUsage;
}

function handoffContractForNode(node, board) {
  const passedFields = ["outputs", "verification"];
  if (node.type === "intake") passedFields.push("intake_decision");
  if (node.type === "delivery") passedFields.push("evolution_candidates", "knowledge_sync");
  return {
    required: true,
    output_path: `handoffs/${node.id}.json`,
    common_required_fields: ["workflow_id", "node_id", "status", "summary"],
    status_required_fields: {
      passed: passedFields,
      failed: ["reject_to", "reason", "evidence", "required_fix"],
      blocked: ["blocker_type", "blocked_scope"],
      skipped: ["reason"],
    },
    structured_field_requirements: {
      work_items: ["title", "status"],
      changed_files: ["path"],
      verification: ["command", "result"],
      skills_used: ["name", "purpose"],
      agent_activity: ["agent_id", "role", "scope", "task", "status"],
      intake_decision: [
        "goal",
        "route.entry",
        "route.project_type",
        "route.mode",
        "route.next_skill",
        "workflow.shape",
        "assumptions[]",
        "custom_answers_allowed",
        "execution_options[].id",
        "execution_options[].label",
        "execution_options[].summary",
        "selected_option",
        "confirmation.status",
      ],
      delivery: ["evolution_candidates[]", "knowledge_sync.status"],
    },
    record_work_items: true,
    record_verification: ["passed"].includes(node.status) || ["implement", "verify", "review", "delivery"].includes(node.type),
    record_skills_used_when_used: true,
    record_agent_activity_when_delegated: true,
    record_token_context_model_when_available: true,
    language: board.language,
  };
}

function buildContextPackPayload(board, nodeId) {
  const nodes = Object.values(board.columns).flat();
  const node = nodes.find((item) => item.id === nodeId);
  if (!node) throw new Error(`Unknown node: ${nodeId}`);
  const maxSourceFiles = Math.max(1, Math.min(8, node.context_level === "scan" ? 4 : 8));
  return attachContextPackMeasurement({
    schema_version: SCHEMA_VERSION,
    workflow_id: board.workflow_id,
    generated_at: now(),
    language: board.language,
    workflow_metadata: board.workflow_metadata || {
      workflow_id: board.workflow_id,
      title: board.title,
      mode: board.mode,
      template_id: board.template?.template_id || null,
      template_version: board.template?.template_version || null,
      template_name: board.template?.name || null,
      deck_variant: board.template?.deck_variant || null,
    },
    controller: board.controller,
    node: {
      node_id: node.id,
      title: node.display_title || node.title,
      type: node.type,
      status: node.status,
      objective: node.display_objective || node.objective,
      acceptance: node.display_acceptance || node.acceptance || [],
      context_level: node.context_level,
      worker_profile: node.worker_profile,
      agent: node.agent || null,
      model_tier: node.model_tier,
      recommended_model: node.recommended_model || null,
      recommended_model_reason: node.recommended_model_reason || node.model_selection_reason || null,
    },
    next_action: board.summary.next_recommended_action,
    dependency_handoffs: dependencyHandoffSummaries(node, nodes),
    downstream_contexts: downstreamContextsForNode(nodes, node.id),
    assignments: board.assignments?.by_node.find((item) => item.node_id === node.id)?.assignments || [],
    handoff_contract: handoffContractForNode(node, board),
    context_policy: {
      level: node.context_level,
      max_source_files: maxSourceFiles,
      required_files: ["state.json", "graph.json", `nodes/${node.id}.json`],
      dependency_files: (node.depends_on || []).map((dependency) => `handoffs/${dependency}.json or latest handoff summary`),
      avoid: [
        "Do not pass the whole conversation history to workers.",
        "Do not load full source files unless this node needs exact edits, quotes, or failure root cause.",
      ],
    },
    context_loss_guard: {
      principle: "Conversation compaction is lossy; treat this context pack plus source/evidence pointers as the recovery contract.",
      preserve: [
        "node objective and acceptance",
        "dependency handoff summaries",
        "downstream_context from upstream nodes",
        "active command recovery pointers",
        "exact evidence/source paths for later retrieval",
      ],
      worker_rule: "Do not rely on memory of earlier chat when the context pack or source file disagrees.",
      handoff_required_fields: ["summary", "work_items", "outputs", "verification", "downstream_context_when_feeding_later_nodes", "context_usage"],
    },
    active_commands: board.commands?.active || [],
    recent_events: (board.recent_events || []).filter((event) => !event.node_id || event.node_id === node.id || (node.depends_on || []).includes(event.node_id)).slice(-8),
    resume_pointers: {
      workflow_dir: board.project?.relative_workflow_dir || null,
      state: "state.json",
      graph: "graph.json",
      node_card: `nodes/${node.id}.json`,
      board: "board.json",
    },
  });
}

function buildHandoffPackets(projectedNodes) {
  return {
    by_node: projectedNodes.map((node) => ({
      node_id: node.id,
      status: node.status,
      handoff: node.last_handoff || null,
      handoff_target: node.handoff_target || null,
      depends_on: node.depends_on || [],
      dependency_handoffs: dependencyHandoffSummaries(node, projectedNodes),
      downstream_context: node.downstream_context || null,
      downstream_contexts_for_node: downstreamContextsForNode(projectedNodes, node.id),
    })),
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

function buildRecommendations(projectedNodes, usage, context, taskSize, skills, models, evolution, risks, project, commands = null, assignments = null, language = "en", capabilityGaps = null) {
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
      isZh ? "更多节点记录来源感知 token 或不可用原因后，看板才能分析真实消耗边界。" : "The board cannot show full token cost boundaries until more nodes record source-aware token usage or an unavailable reason.",
      isZh ? "工具暴露精确用量时记录 token_usage；拿不到时记录 usage_observation.token_status=unavailable 和原因，不要编造数值。" : "Record token_usage when exact usage is exposed; otherwise record usage_observation.token_status=unavailable with a reason, and do not invent values.",
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
  const largeContextNodes = (context.by_node || [])
    .filter((item) => (item.estimated_tokens || 0) >= LARGE_CONTEXT_PACK_ESTIMATED_TOKENS)
    .map((item) => item.node_id);
  if (largeContextNodes.length > 0) {
    items.push(recommendation(
      "large-context-pack",
      "medium",
      isZh ? "部分节点上下文包过大" : "Some node context packs are large",
      isZh
        ? `节点上下文估算达到 ${LARGE_CONTEXT_PACK_ESTIMATED_TOKENS} tokens 以上，compact 或 worker 交接时更容易丢失细节。`
        : `Estimated node context is at or above ${LARGE_CONTEXT_PACK_ESTIMATED_TOKENS} tokens, which increases loss risk during compaction or worker handoff.`,
      isZh
        ? "拆分节点、缩小依赖 handoff 摘要，或把大证据改为路径引用后重新生成 context-pack。"
        : "Split the node, shrink dependency handoff summaries, or replace large evidence bodies with retrievable path references, then regenerate the context pack.",
      largeContextNodes,
    ));
  }
  const largeTaskNodes = (taskSize?.by_node || [])
    .filter((item) => (item.estimated_tokens || 0) >= LARGE_TASK_CONTRACT_ESTIMATED_TOKENS)
    .map((item) => item.node_id);
  if (largeTaskNodes.length > 0) {
    items.push(recommendation(
      "large-task-contract",
      "medium",
      isZh ? "部分节点任务合同过大" : "Some node task contracts are large",
      isZh
        ? `节点目标、验收或范围本身过大，超过 ${LARGE_TASK_CONTRACT_ESTIMATED_TOKENS} tokens 时应优先拆成更小的可验收节点。`
        : `The node objective, acceptance, or scope is too large; above ${LARGE_TASK_CONTRACT_ESTIMATED_TOKENS} tokens, prefer splitting into smaller verifiable nodes.`,
      isZh
        ? "把大节点拆成单职责节点，并用 downstream_context 传递必要约束，而不是让一个 worker 背完整历史。"
        : "Split large nodes into single-responsibility nodes and pass required constraints through downstream_context instead of making one worker carry the full history.",
      largeTaskNodes,
    ));
  }
  if (skills.missing_nodes.length > 0) {
    items.push(recommendation(
      "missing-skill-usage",
      "low",
      isZh ? "Skill 使用记录不完整" : "Skill usage coverage is incomplete",
      isZh ? "缺少节点级 skill 记录时，很难复盘每个节点为什么调用某个 specialist skill。" : "Without node-level skill records, it is hard to audit why a specialist skill was used.",
      isZh ? "后续 handoff 记录 skills_used；如果没有使用 skill，保持缺失即可。" : "Record skills_used in future handoffs; leave it missing when no skill was used.",
      skills.missing_nodes,
    ));
  }
  if (skills.selection_missing_nodes?.length > 0) {
    items.push(recommendation(
      "missing-skill-decision",
      "low",
      isZh ? "同类 Skill 选择缺少决策记录" : "Skill selection decisions are missing",
      isZh ? "节点已经记录了 skills_used，但没有说明为什么选这个同类 skill、哪些候选没用、用户不满意时怎么换。" : "Nodes recorded skills_used but did not explain why the selected same-lane skill was chosen, which alternatives were skipped, or how to switch if the user is dissatisfied.",
      isZh ? "后续 handoff 记录 skill_decisions；没有同类竞争或不需要 specialist 时可不记录。" : "Record skill_decisions in future handoffs; leave it absent when there is no same-lane choice or specialist use.",
      skills.selection_missing_nodes,
    ));
  }
  if (skills.needs_revision?.length > 0) {
    const nodeIds = skills.needs_revision.map((item) => item.node_id);
    items.push(recommendation(
      "skill-rework-needed",
      "medium",
      isZh ? "有产物反馈要求换 Skill 修改" : "Output feedback requests skill-based rework",
      isZh ? "已有 skill_decisions 记录用户不满意、需要修改或已经切换，下一步应按 fallback_policy 重做或定向修改。" : "skill_decisions recorded dissatisfaction, revision need, or a switch; the next step should follow fallback_policy for rework.",
      isZh
        ? `优先处理：${skills.needs_revision.map((item) => `${item.node_id}:${item.next_skill || item.selected}`).join(", ")}。`
        : `Prioritize: ${skills.needs_revision.map((item) => `${item.node_id}:${item.next_skill || item.selected}`).join(", ")}.`,
      nodeIds,
    ));
  }
  if (models.missing_actual_nodes.length > 0) {
    items.push(recommendation(
      "missing-model-usage",
      "low",
      isZh ? "实际模型记录不完整" : "Actual model coverage is incomplete",
      isZh ? "看板已经能显示推荐模型，但缺少实际执行模型或不可用原因时，无法复盘成本和质量选择是否匹配。" : "The board can show recommended models, but actual model records or unavailable reasons are needed to audit cost and quality choices.",
      isZh ? "后续 handoff 或 agent_activity 记录 model；如果环境未暴露实际模型，记录 usage_observation.model_status=unavailable 和原因。" : "Record model in handoff or agent_activity when exposed; otherwise record usage_observation.model_status=unavailable with a reason.",
      models.missing_actual_nodes,
    ));
  }
  if (commands?.active?.length > 0) {
    items.push(recommendation(
      "running-command-log",
      "medium",
      isZh ? "存在运行中的后台命令" : "Background commands are running",
      isZh ? "运行中命令需要可找回的日志、PID 或续接命令，否则中断后难以判断状态。" : "Running commands need retrievable logs, PID, or resume commands so interruptions can be recovered.",
      isZh
        ? `查看日志或续接命令：${commands.active.map((item) => item.run_id).join(", ")}。`
        : `Inspect logs or resume commands for: ${commands.active.map((item) => item.run_id).join(", ")}.`,
      commands.active.map((item) => item.node_id),
    ));
  }
  if (assignments?.missing_handoffs?.length > 0) {
    items.push(recommendation(
      "assignment-missing-handoff",
      "medium",
      isZh ? "Agent 分配缺少可读取交接" : "Agent assignments are missing readable handoffs",
      isZh ? "有 assignment 已经记录到通讯录，但对应 handoff 文件尚不可读取，主控无法可靠汇聚结果。" : "Assignments are recorded, but their handoff files are not readable, so the orchestrator cannot reliably join results.",
      isZh ? "让对应 worker 写入 handoff，或把 assignment 标记为 blocked/cancelled 并记录原因。" : "Ask the worker to write the handoff, or mark the assignment blocked/cancelled with a reason.",
      assignments.missing_handoffs.map((item) => item.node_id),
    ));
  }
  if (assignments?.write_scope_conflicts?.length > 0) {
    items.push(recommendation(
      "assignment-write-scope-conflict",
      "high",
      isZh ? "Agent 写入范围重叠" : "Agent write scopes overlap",
      isZh ? "多个活跃 assignment 可能同时改同一范围，容易产生冲突或覆盖。" : "Multiple active assignments may edit the same scope, increasing conflict and overwrite risk.",
      isZh ? "缩小 write_scope、串行化相关节点，或改用隔离 worktree。" : "Narrow write_scope, serialize related nodes, or isolate work with worktrees.",
      assignments.write_scope_conflicts.flatMap((item) => [item.left_node_id, item.right_node_id]),
    ));
  }
  if (evolution.generic_candidates.length > 0) {
    const nodeIds = evolution.generic_candidates.map((candidate) => candidate.node_id);
    items.push(recommendation(
      "run-workflow-evolution",
      "medium",
      isZh ? "存在可审查的通用 workflow 进化候选" : "Generic workflow evolution candidates need review",
      isZh
        ? `已记录 ${evolution.generic_candidates.length} 条 generic_omykit 候选，需要按抽象测试判断是否提升到 omyKit。`
        : `${evolution.generic_candidates.length} generic_omykit candidate(s) are recorded and need the abstraction test before promotion.`,
      isZh
        ? "运行 codex-workflow-evolution，保留证据、分类结果、更新位置和验证记录；未通过的候选标记为 not_promoted。"
        : "Run codex-workflow-evolution, keep evidence, classification, update surface, and verification; mark candidates that fail as not_promoted.",
      nodeIds,
    ));
  }
  if (capabilityGaps?.local_trials?.length > 0) {
    const nodeIds = capabilityGaps.local_trials.map((gap) => gap.node_id);
    items.push(recommendation(
      "capability-gap-local-trial",
      "medium",
      isZh ? "存在需要本地试验的能力缺口" : "Capability gaps need local trials",
      isZh
        ? `已记录 ${capabilityGaps.local_trials.length} 个 local/project-local 能力缺口，应先在目标项目或用户本地验证，不直接进入 omyKit 主线。`
        : `${capabilityGaps.local_trials.length} local/project-local capability gap(s) are recorded; validate them locally or in the target project before changing omyKit mainline.`,
      isZh
        ? "记录安装方式、运行证据、license/source 结论和失败原因；有效后再作为 evolution_candidate 评估是否通用化。"
        : "Record install path, run evidence, license/source decision, and failure reasons; if effective, raise an evolution_candidate for generic review.",
      nodeIds,
    ));
  }
  if (capabilityGaps?.generic_candidates?.length > 0) {
    const nodeIds = capabilityGaps.generic_candidates.map((gap) => gap.node_id);
    items.push(recommendation(
      "capability-gap-generic-review",
      "medium",
      isZh ? "能力缺口候选需要主仓库评审" : "Capability gap candidates need mainline review",
      isZh
        ? `已记录 ${capabilityGaps.generic_candidates.length} 个可能进入 omyKit 的候选能力，不能直接推主线。`
        : `${capabilityGaps.generic_candidates.length} capability candidate(s) may affect omyKit and must not be pushed directly to mainline.`,
      isZh
        ? "先建候选分支或本地试验，运行 source/license/security/实战验证，再由 codex-workflow-evolution 决定是否提升。"
        : "Use a candidate branch or local trial first, run source/license/security/practical verification, then let codex-workflow-evolution decide promotion.",
      nodeIds,
    ));
  }
  const missingKnowledgeSync = projectedNodes.filter((node) => (
    node.type === "delivery"
    && TERMINAL_STATUSES.has(node.status)
    && !node.knowledge_sync_reviewed
  ));
  if (missingKnowledgeSync.length > 0) {
    items.push(recommendation(
      "run-knowledge-sync",
      "medium",
      isZh ? "交付缺少知识同步审查" : "Delivery is missing knowledge sync review",
      isZh
        ? "阶段收口前需要判断 README、docs、AGENTS 或 agent 记忆是否应更新；没有需要更新时也要记录 not_needed。"
        : "Before handoff, review whether README, docs, AGENTS, or agent memory need updates; record not_needed when no update is required.",
      isZh
        ? "按需使用 neat-freak 或等价知识同步检查，然后在 delivery handoff 写入 knowledge_sync。"
        : "Use neat-freak or an equivalent knowledge cleanup pass when needed, then record knowledge_sync in the delivery handoff.",
      missingKnowledgeSync.map((node) => node.id),
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

function evaluateEvidenceCheck(check, projectedNodes, graph, project, assignments, language) {
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
    case "intake_decision_recorded": {
      const intakeNodes = projectedNodes.filter((node) => node.type === "intake" && TERMINAL_STATUSES.has(node.status));
      if (intakeNodes.length === 0) return pending();
      const failing = intakeNodes
        .filter((node) => {
          const decision = node.intake_decision;
          if (!decision?.goal) return true;
          if (!decision.route?.entry || !decision.route?.project_type || !decision.route?.mode || !decision.route?.next_skill) return true;
          if (!decision.workflow?.shape) return true;
          if (decision.custom_answers_allowed !== true) return true;
          if (decision.questions.length > 3) return true;
          return decision.questions.some((question) => question.custom_answer_allowed !== true || (!question.answer && question.resolved !== true));
        })
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "入口节点缺少完整 intake_decision、路由、执行形态或自定义答案记录。" : "Intake nodes are missing complete intake_decision, route, execution shape, or custom-answer records.");
    }
    case "intake_execution_options_confirmed": {
      const intakeNodes = projectedNodes.filter((node) => node.type === "intake" && TERMINAL_STATUSES.has(node.status));
      if (intakeNodes.length === 0) return pending();
      const confirmedStatuses = new Set(["confirmed", "auto_authorized", "changed"]);
      const failing = intakeNodes
        .filter((node) => {
          const decision = node.intake_decision;
          if (!decision) return true;
          if (!Array.isArray(decision.execution_options) || decision.execution_options.length < 2) return true;
          if (!decision.execution_options.some((option) => option.recommended === true)) return true;
          if (!decision.selected_option) return true;
          if (!decision.execution_options.some((option) => option.id === decision.selected_option)) return true;
          if (!confirmedStatuses.has(decision.confirmation?.status)) return true;
          return false;
        })
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "入口节点必须记录多种执行方案、推荐方案、已选方案和确认状态。" : "Intake nodes must record multiple execution options, a recommendation, selected option, and confirmation status.");
    }
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
    case "downstream_context_recorded": {
      const handoffNodes = passedNodes.filter((node) => node.handoff_target);
      if (handoffNodes.length === 0) return pending();
      const failing = handoffNodes
        .filter((node) => {
          const context = node.downstream_context;
          if (!context?.summary) return true;
          if (!Array.isArray(context.target_nodes) || context.target_nodes.length === 0) return true;
          return !context.target_nodes.includes(node.handoff_target);
        })
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "有下游目标的通过节点缺少 downstream_context，或没有指向 handoff_target。" : "Passed nodes with downstream targets are missing downstream_context, or it does not include handoff_target.");
    }
    case "evolution_review_recorded": {
      const deliveryNodes = projectedNodes.filter((node) => node.type === "delivery" && TERMINAL_STATUSES.has(node.status));
      if (deliveryNodes.length === 0) return pending();
      const failing = deliveryNodes.filter((node) => !node.evolution_review_recorded).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "通过的交付节点没有记录 evolution_candidates；空数组表示已复盘但无可提升候选。" : "Passed delivery nodes did not record evolution_candidates; an empty array means reviewed with no promotable candidate.");
    }
    case "knowledge_sync_reviewed": {
      const deliveryNodes = projectedNodes.filter((node) => node.type === "delivery" && TERMINAL_STATUSES.has(node.status));
      if (deliveryNodes.length === 0) return pending();
      const failing = deliveryNodes
        .filter((node) => !node.knowledge_sync_reviewed || (node.knowledge_sync?.status === "deferred" && !node.knowledge_sync?.reason))
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "交付节点没有记录 knowledge_sync；使用 completed、not_needed 或带原因的 deferred。" : "Delivery nodes did not record knowledge_sync; use completed, not_needed, or deferred with a reason.");
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
      const failing = terminalNodes.filter((node) => !tokenUsageAccounted(node)).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "终态节点缺少来源感知 token_usage，或没有说明运行时不暴露 token。" : "Terminal nodes are missing source-aware token_usage, or did not explain that runtime token usage is unavailable.");
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
    case "subagent_model_recorded_or_explained": {
      const activities = projectedNodes.flatMap((node) => node.agent_activity.map((activity) => ({ node, activity })))
        .filter(({ activity }) => activity.mode === "subagent");
      if (activities.length === 0) return pending();
      const failing = activities
        .filter(({ activity }) => !activity.model && !activity.token_usage?.model && !activity.model_unavailable_reason)
        .map(({ node }) => node.id);
      return failing.length === 0 ? pass() : fail([...new Set(failing)], isZh ? "子智能体活动需要记录实际模型，或说明运行时没有暴露模型。" : "Subagent activity must record the actual model or explain why the runtime did not expose it.");
    }
    case "assignment_handoff_coverage": {
      if (!assignments || assignments.records.length === 0) return pending();
      const failing = assignments.missing_handoffs.map((item) => item.node_id);
      return failing.length === 0 ? pass() : fail([...new Set(failing)], isZh ? "部分 agent assignment 尚未产生可读取的 handoff。" : "Some agent assignments do not yet have readable handoffs.");
    }
    case "assignment_write_scope_conflicts": {
      if (!assignments || assignments.records.length === 0) return pending();
      const failing = assignments.write_scope_conflicts.flatMap((item) => [item.left_node_id, item.right_node_id]);
      return failing.length === 0 ? pass() : fail([...new Set(failing)], isZh ? "多个活跃 agent assignment 的写入范围重叠，需要收敛或隔离 worktree。" : "Multiple active agent assignments have overlapping write scopes; narrow scope or isolate worktrees.");
    }
    case "skills_used_recorded": {
      if (terminalNodes.length === 0) return pending();
      const failing = terminalNodes.filter((node) => node.skills_used.length === 0).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "终态节点没有记录使用过的 skills。" : "Terminal nodes did not record skills_used.");
    }
    case "skill_selection_decision_recorded": {
      const skillNodes = terminalNodes.filter((node) => node.skills_used.length > 0);
      if (skillNodes.length === 0) return pending();
      const failing = skillNodes
        .filter((node) => node.skill_decisions.length === 0 || node.skill_decisions.some((decision) => !decision.capability || !decision.selected || !decision.rationale))
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "使用 skill 的终态节点缺少 skill_decisions，无法复盘同类能力选择和 fallback。" : "Terminal nodes that used skills are missing skill_decisions, so same-lane selection and fallback cannot be audited.");
    }
    case "capability_gap_triaged": {
      const gapNodes = terminalNodes.filter((node) => node.capability_gaps.length > 0);
      if (gapNodes.length === 0) return pending();
      const failing = gapNodes
        .filter((node) => node.capability_gaps.some((gap) => (
          !gap.capability
          || !gap.need
          || !gap.current_gap
          || !gap.integration_path
          || !gap.status
          || gap.evidence.length === 0
        )))
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "能力缺口必须记录能力线、需求、当前缺口、接入路径、状态和证据。" : "Capability gaps must record capability, need, current gap, integration path, status, and evidence.");
    }
    case "deck_variant_recorded": {
      if (graph.metadata?.template_id !== "deck.proposal") return pending();
      return ["create", "remake", "modify"].includes(graph.metadata?.deck_variant)
        ? pass()
        : fail([], isZh ? "deck.proposal workflow 必须记录 deck_variant：create、remake 或 modify。" : "deck.proposal workflows must record deck_variant: create, remake, or modify.");
    }
    case "model_tier_policy": {
      const failing = projectedNodes
        .filter((node) => node.task_complexity === "expert" && node.model_tier !== "frontier")
        .map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "expert 复杂度节点必须使用 frontier 档位。" : "Expert-complexity nodes must use the frontier tier.");
    }
    case "model_usage_recorded": {
      if (terminalNodes.length === 0) return pending();
      const failing = terminalNodes.filter((node) => !modelUsageAccounted(node)).map((node) => node.id);
      return failing.length === 0 ? pass() : fail(failing, isZh ? "终态节点没有记录实际使用模型，或没有说明运行时不暴露模型。" : "Terminal nodes did not record actual model usage, or did not explain that runtime model data is unavailable.");
    }
    case "board_language": {
      const expected = graph.metadata?.language || language;
      return expected === language ? pass() : fail([], isZh ? "看板语言与 workflow metadata 不一致。" : "Board language does not match workflow metadata.");
    }
    default:
      return scorecardResult(check, "warning", language, [], isZh ? `未知 evidence.type：${evidence.type}` : `Unknown evidence.type: ${evidence.type}`);
  }
}

function evaluateScorecards(graph, projectedNodes, project, assignments, language) {
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
      const result = evaluateEvidenceCheck(check, projectedNodes, graph, project, assignments, language);
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
  const assignmentData = loadAssignments(workflowDir);
  const allEvents = readLedgerEvents(workflowDir, 1000);
  const projectedNodes = graph.nodes.map((node) => projectNode(workflowDir, state, cards, handoffs, allEvents, node, language));
  const assignments = buildAssignmentProjection(workflowDir, assignmentData, projectedNodes);
  const counts = statusCounts(projectedNodes);
  const columns = {};
  for (const status of COLUMN_STATUSES) {
    columns[status] = projectedNodes.filter((node) => node.status === status);
  }
  const recentEvents = allEvents.slice(-10);
  const critical = criticalPath(graph);
  const usage = buildUsage(projectedNodes);
  const context = buildContextUsage(projectedNodes);
  const taskSize = buildTaskSize(projectedNodes);
  const skills = buildSkillUsage(projectedNodes);
  const models = buildModelUsage(projectedNodes);
  const timing = buildTiming(projectedNodes);
  const evolution = buildEvolution(projectedNodes);
  const capabilityGaps = buildCapabilityGaps(projectedNodes);
  const commands = buildCommandRunProjection(readCommandRuns(workflowDir));
  const handoffPackets = buildHandoffPackets(projectedNodes);
  const project = buildProjectSnapshot(workflowDir, graph);
  const taskInbox = buildTaskInboxProjection(projectRootFromWorkflow(workflowDir), graph.workflow_id);
  const workflowMetadata = workflowMetadataFromGraph(graph);
  project.main_changes = buildProjectChanges(projectedNodes, project.git?.status || []);
  const risks = buildRisks(workflowDir, graph, state, projectedNodes, handoffs);
  const scorecard = evaluateScorecards(graph, projectedNodes, project, assignments, language);
  const recommendations = buildRecommendations(projectedNodes, usage, context, taskSize, skills, models, evolution, risks, project, commands, assignments, language, capabilityGaps);
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
  const board = {
    schema_version: SCHEMA_VERSION,
    workflow_id: graph.workflow_id,
    title: graph.title,
    mode: graph.mode,
    language,
    generated_at: now(),
    workflow_metadata: workflowMetadata,
    template: {
      template_id: workflowMetadata.template_id,
      template_version: workflowMetadata.template_version,
      name: workflowMetadata.template_name,
      description: graph.metadata?.template_description || null,
      deck_variant: workflowMetadata.deck_variant,
      layers: graph.metadata?.layers || {},
    },
    controller: {
      name: graph.metadata?.controller || "omykit-workflow",
      role: graph.metadata?.controller_role || "observer",
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
      intake_decisions: projectedNodes.filter((node) => node.intake_decision).length,
      changed_files: projectedNodes.reduce((sum, node) => sum + node.changed_files.length, 0),
      skills_used: projectedNodes.reduce((sum, node) => sum + node.skills_used.length, 0),
      skill_decisions: projectedNodes.reduce((sum, node) => sum + node.skill_decisions.length, 0),
      downstream_contexts: projectedNodes.filter((node) => node.downstream_context).length,
      evolution_candidates: projectedNodes.reduce((sum, node) => sum + node.evolution_candidates.length, 0),
      capability_gaps: projectedNodes.reduce((sum, node) => sum + node.capability_gaps.length, 0),
      knowledge_sync_reviews: projectedNodes.filter((node) => node.knowledge_sync_reviewed).length,
      actual_models: projectedNodes.reduce((sum, node) => sum + node.actual_models.length, 0),
      verification_checks: projectedNodes.reduce((sum, node) => sum + node.required_checks.length, 0),
      agent_activities: projectedNodes.reduce((sum, node) => sum + node.agent_activity.length, 0),
      assignments: assignments.records.length,
      next_recommended_action: nextRecommendedAction(graph, state, language),
      critical_path: critical,
      latest_ledger_event: recentEvents[recentEvents.length - 1] || null,
      task_inbox_items: taskInbox.summary.total,
      task_conflicts: taskInbox.conflicts.length,
      workstreams: taskInbox.workstreams.length,
    },
    task_inbox: {
      summary: taskInbox.summary,
      tasks: taskInbox.tasks,
    },
    workstreams: taskInbox.workstreams,
    conflicts: taskInbox.conflicts,
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
    collaboration: buildCollaboration(projectedNodes, assignments),
    assignments,
    usage,
    context,
    task_size: taskSize,
    skills,
    models,
    commands,
    handoff_packets: handoffPackets,
    evolution,
    capability_gaps: capabilityGaps,
    timing,
    scorecard,
    risks,
    recommendations,
    improvement_plan: recommendations,
    recent_events: recentEvents,
  };
  const dispatchPlan = buildDispatchPlan(board, { surface: "auto" });
  board.orchestration = buildOrchestrationPlan(board, dispatchPlan);
  return board;
}

const SUBAGENT_READY_NODE_TYPES = new Set(["research", "design", "plan", "implement", "verify", "review"]);

function codexModelOverrideName(model) {
  const normalized = String(model || "").trim().toLowerCase().replace(/\s+/g, "-");
  if (!normalized) return null;
  if (normalized.includes("5.5")) return "gpt-5.5";
  if (normalized.includes("5.4-mini")) return "gpt-5.4-mini";
  if (normalized.includes("5.4")) return "gpt-5.4";
  if (normalized.includes("5.3") || normalized.includes("codex-spark")) return "gpt-5.3-codex-spark";
  return null;
}

function dispatchAgentType(node) {
  return node.type === "research" ? "explorer" : "worker";
}

function normalizeDispatchSurfaceOption(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase().replace(/-/g, "_");
  if (normalized === "auto") return "auto";
  return normalizeExecutionSurface(normalized);
}

function preferredAutoSurface(node) {
  if (node.type === "implement") return "thread_worktree";
  if (["verify", "review"].includes(node.type) && ["complex", "expert"].includes(node.task_complexity)) return "background_thread";
  return "subagent";
}

function requestedExecutionSurface(node, requestedSurface, canStartNow, eligibility, assignment) {
  if (assignment?.execution_surface) return assignment.execution_surface;
  if (!eligibility.eligible) return "main-thread";
  if (!canStartNow) return "wait_for_parallel_slot";
  if (!requestedSurface) return "subagent";
  if (requestedSurface === "auto") return preferredAutoSurface(node);
  return requestedSurface;
}

function dispatchEligibility(node, language) {
  const isZh = language === "zh-CN";
  if (node.owner && node.owner !== "codex") {
    return {
      eligible: false,
      reason: isZh ? `owner=${node.owner}，不应由 Codex 子智能体接管。` : `owner=${node.owner}; do not delegate to a Codex subagent.`,
    };
  }
  if (!SUBAGENT_READY_NODE_TYPES.has(node.type)) {
    return {
      eligible: false,
      reason: isZh ? `${node.type} 节点适合主控收口或人工决策。` : `${node.type} nodes should stay with the main orchestrator or human decision path.`,
    };
  }
  if (node.claimed_by && !/^codex|main|orchestrator$/i.test(node.claimed_by)) {
    return {
      eligible: false,
      reason: isZh ? `已由 ${node.claimed_by} 认领；先确认是否接管。` : `Already claimed by ${node.claimed_by}; confirm takeover before dispatch.`,
    };
  }
  return {
    eligible: true,
    reason: isZh ? "节点范围独立，可交给子智能体执行，并由主控集成结果。" : "Independent node scope; safe to delegate and let the main orchestrator integrate the result.",
  };
}

function nodeContextPack(node) {
  const pack = [
    "state.json",
    "graph.json",
    `nodes/${node.id}.json`,
  ];
  for (const dependency of node.depends_on || []) pack.push(`handoffs/${dependency}.json or evidence summary`);
  return pack;
}

function buildDispatchPlan(board, options = {}) {
  const language = board.language || "en";
  const isZh = language === "zh-CN";
  const requestedSurface = normalizeDispatchSurfaceOption(options.surface);
  const safetyId = board.template?.layers?.safety_limits || null;
  const safety = loadSafetyLimitDefinition(safetyId);
  const maxParallel = Number.isFinite(safety?.max_parallel_running_nodes) ? safety.max_parallel_running_nodes : null;
  const runningCount = board.columns.running.length;
  let availableSlots = maxParallel === null ? board.columns.ready.length : Math.max(0, maxParallel - runningCount);
  const ready = board.columns.ready.map((node) => {
    const assignment = latestAssignmentForNode(board.assignments, node.id);
    const hasActiveAssignment = Boolean(assignment && activeAssignment(assignment));
    const eligibility = dispatchEligibility(node, language);
    const canStartNow = (eligibility.eligible || hasActiveAssignment) && availableSlots > 0;
    if (canStartNow) availableSlots -= 1;
    const modelOverride = codexModelOverrideName(node.recommended_model);
    const executionSurface = requestedExecutionSurface(node, requestedSurface, canStartNow, eligibility, assignment);
    const executor = requestedSurface ? executionSurface : canStartNow ? "subagent" : eligibility.eligible ? "wait_for_parallel_slot" : "main-thread";
    return {
      node_id: node.id,
      title: node.display_title || node.title,
      type: node.type,
      status: node.status,
      executor,
      execution_surface: executionSurface,
      dispatch_eligible: eligibility.eligible,
      agent_type: canStartNow ? dispatchAgentType(node) : null,
      worker_profile: node.worker_profile || null,
      agent: node.agent || null,
      claimed_by: node.claimed_by || null,
      parallel_group: node.parallel_group || null,
      depends_on: node.depends_on || [],
      join_policy: node.join_policy || null,
      handoff_target: node.handoff_target || null,
      assignment: assignment ? {
        agent_id: assignment.agent_id,
        role: assignment.role,
        status: assignment.status,
        execution_surface: assignment.execution_surface,
        thread_id: assignment.thread_id || null,
        worktree_path: assignment.worktree_path || null,
      } : null,
      model_tier: node.model_tier,
      recommended_model: node.recommended_model || null,
      model_override: modelOverride,
      model_override_policy: modelOverridePolicyText(isZh),
      dispatch_reason: canStartNow
        ? hasActiveAssignment
          ? (isZh ? "已有显式 assignment 记录，按通讯录执行面继续跟踪。" : "Explicit assignment exists; track by the recorded execution surface.")
          : eligibility.reason
        : eligibility.eligible
          ? (isZh ? "已达到并行上限，等待运行中节点交付或解除占用。" : "Parallel limit reached; wait for a running node to hand off or free a slot.")
          : eligibility.reason,
      context_pack: nodeContextPack(node),
      handoff_contract: {
        required: true,
        record_agent_activity: true,
        record_actual_model_when_available: true,
        record_token_and_context_when_available: true,
      },
    };
  });
  return {
    schema_version: SCHEMA_VERSION,
    workflow_id: board.workflow_id,
    language,
    generated_at: now(),
    orchestrator: {
      role: isZh
        ? "主对话只做编排、观察、集成、验票和人工阻塞升级，不为单个子任务切换主模型。"
        : "Main thread only orchestrates, observes, integrates, audits, and escalates human blockers; it does not switch the main model for individual subtasks.",
      context_policy: isZh
        ? "主控保留 workflow state、graph、ledger 和必要 handoff 摘要；子智能体只接收当前节点所需上下文包。"
        : "Main thread keeps workflow state, graph, ledger, and necessary handoff summaries; subagents receive only the context pack needed for the node.",
      model_policy: isZh
        ? "controller 推荐模型档位和具体模型；实际 spawn 时由 Codex 主控传入对应 model override，并保持主线程模型稳定。"
        : "Controller recommends model tier and concrete model; Codex orchestration passes the matching model override when spawning workers while keeping the main thread model stable.",
    },
    safety: {
      safety_limits: safetyId,
      max_parallel_running_nodes: maxParallel,
      running_nodes: runningCount,
      dispatchable_slots: maxParallel === null ? null : Math.max(0, maxParallel - runningCount),
      stop_conditions: safety?.stop_conditions || [],
    },
    runtime_capability: {
      controller_calls_models: false,
      controller_spawns_agents: false,
      supported_surfaces: [...EXECUTION_SURFACES],
      requested_surface: requestedSurface || "legacy-subagent",
      codex_subagent_model_override: "available_when_runtime_tool_supports_model_parameter",
      fallback: "inherit_parent_model_and_record_recommended_vs_actual_gap",
    },
    ready_dispatches: ready,
    running_nodes: board.columns.running.map((node) => ({ node_id: node.id, title: node.display_title || node.title, claimed_by: node.claimed_by || null })),
    failed_nodes: board.columns.failed.map((node) => ({ node_id: node.id, title: node.display_title || node.title, reason: node.reason || node.handoff_summary || null })),
    blocked_nodes: board.columns.blocked.map((node) => ({ node_id: node.id, title: node.display_title || node.title, reason: node.reason || node.handoff_summary || null })),
  };
}

function printDispatchPlan(plan) {
  const isZh = plan.language === "zh-CN";
  console.log(`${isZh ? "派发计划" : "Dispatch plan"}: ${plan.workflow_id}`);
  console.log(`${isZh ? "主控角色" : "Main thread"}: ${plan.orchestrator.role}`);
  console.log(`${isZh ? "上下文策略" : "Context policy"}: ${plan.orchestrator.context_policy}`);
  console.log(`${isZh ? "模型策略" : "Model policy"}: ${plan.orchestrator.model_policy}`);
  console.log(`${isZh ? "并行上限" : "Parallel limit"}: ${plan.safety.max_parallel_running_nodes ?? "unlimited"}; ${isZh ? "运行中" : "running"}: ${plan.safety.running_nodes}; ${isZh ? "可派发槽位" : "dispatchable slots"}: ${plan.safety.dispatchable_slots ?? "unlimited"}`);
  console.log(isZh ? "就绪派发:" : "Ready dispatches:");
  if (plan.ready_dispatches.length === 0) {
    console.log(isZh ? "无" : "none");
  } else {
    for (const item of plan.ready_dispatches) {
      console.log(`- ${item.node_id} ${item.title} | executor=${item.executor} | surface=${item.execution_surface || "none"} | agent_type=${item.agent_type || "none"} | worker=${item.worker_profile || "none"} | tier=${item.model_tier || "none"} | recommended=${item.recommended_model || "none"} | override=${item.model_override || "inherit"}`);
      console.log(`  ${isZh ? "原因" : "Reason"}: ${item.dispatch_reason}`);
      console.log(`  ${isZh ? "上下文包" : "Context pack"}: ${item.context_pack.join(", ")}`);
    }
  }
  if (plan.failed_nodes.length > 0) {
    console.log(`${isZh ? "失败节点" : "Failed nodes"}: ${plan.failed_nodes.map((node) => node.node_id).join(", ")}`);
  }
  if (plan.blocked_nodes.length > 0) {
    console.log(`${isZh ? "阻塞节点" : "Blocked nodes"}: ${plan.blocked_nodes.map((node) => node.node_id).join(", ")}`);
  }
}

function dispatchReadyNow(item) {
  return item.executor !== "wait_for_parallel_slot" && item.execution_surface !== "wait_for_parallel_slot";
}

function requiresDispatchReview(item) {
  if (item.claimed_by && !/^codex|main|orchestrator$/i.test(item.claimed_by)) return true;
  return item.dispatch_eligible === false && SUBAGENT_READY_NODE_TYPES.has(item.type);
}

function workerDispatch(item) {
  return dispatchReadyNow(item) && !requiresDispatchReview(item) && item.execution_surface !== "main-thread" && item.execution_surface !== "main";
}

function modelOverridePolicyText(isZh) {
  return isZh
    ? "推荐模型是 worker 创建参数，不是主对话切换指令；只有当前 Codex 运行时工具和策略允许，或用户明确授权具体模型时才传入 override。否则继承运行时默认模型，并在 handoff/assignment 记录推荐与实际模型缺口。"
    : "The recommended model is a worker-creation parameter, not a main-thread switch; pass the override only when the active Codex runtime tool and policy allow it, or when the user explicitly authorized the concrete model. Otherwise inherit the runtime default and record the recommended-vs-actual model gap in the handoff/assignment.";
}

function buildWorkerRuntimeContract(item, board, isZh) {
  const contextPackCommand = `node scripts/omykit-workflow.mjs context-pack ${item.node_id} --workflow ${board.workflow_id}`;
  const assignCommand = `node scripts/omykit-workflow.mjs assign ${item.node_id} --agent <agent-id> --surface ${item.execution_surface} --status running --context-pack context-packs/${item.node_id}.json --handoff handoffs/${item.node_id}.json`;
  return {
    runtime_dispatch_required: true,
    worker_creation_policy: {
      controller_role: isZh
        ? "controller 只给出计划、context pack、模型建议和审计字段。"
        : "The controller only emits the plan, context pack, model recommendation, and audit fields.",
      codex_runtime_role: isZh
        ? "Codex 主控在可用工具面上真实创建 worker；不能只展示计划。"
        : "The Codex orchestrator creates the real worker on an available runtime surface; it must not only display the plan.",
      required_surface: item.execution_surface,
      model_override_policy: modelOverridePolicyText(isZh),
      assignment_policy: isZh
        ? "真实 worker/thread/worktree 创建成功后才运行 assign，并记录 agent id、thread/worktree、模型可用性、写入范围、context pack 和 handoff 路径。"
        : "Run assign only after the real worker/thread/worktree exists, recording agent id, thread/worktree, model availability, write scope, context pack, and handoff path.",
      fallback_if_unavailable: isZh
        ? "如果当前 Codex 运行时没有匹配的线程/子智能体/worktree 工具，记录 unavailable 原因；能安全收敛时由主线程执行该节点，不能安全收敛时 block 节点并说明缺少的工具。"
        : "If the active Codex runtime lacks the matching thread/subagent/worktree tool, record the unavailable reason; execute the node in the main thread only when safe, otherwise block the node with the missing tool called out.",
    },
    worker_creation_steps: [
      contextPackCommand,
      isZh
        ? `用 ${item.execution_surface} 创建有边界的 worker，并只传 context-packs/${item.node_id}.json 和节点允许写入范围。`
        : `Create a bounded ${item.execution_surface} worker with only context-packs/${item.node_id}.json and the node's allowed write scope.`,
      item.model_override
        ? (isZh
          ? `运行时允许时传入模型 override ${item.model_override}；不允许时继承默认模型并记录原因。`
          : `Pass model override ${item.model_override} when the runtime allows it; otherwise inherit the default model and record why.`)
        : (isZh
          ? "没有具体模型 override 时继承 worker 默认模型，并在 handoff 记录实际模型或不可用原因。"
          : "When there is no concrete model override, inherit the worker default and record the actual model or unavailable reason in the handoff."),
      assignCommand,
      isZh
        ? `worker 完成后写入 handoffs/${item.node_id}.json，主控再 complete/reject/block。`
        : `Worker writes handoffs/${item.node_id}.json; the orchestrator then completes, rejects, or blocks the node.`,
    ],
  };
}

function allBoardNodes(board) {
  return Object.values(board.columns || {}).flat();
}

function normalizedParallelGroup(value) {
  if (!value || value === "none") return null;
  return String(value);
}

function fanOutGroupKey(item) {
  return normalizedParallelGroup(item.parallel_group) || (item.handoff_target ? `target:${item.handoff_target}` : "ready-workers");
}

function dispatchBatchId(item, workerReady) {
  if (workerReady.length <= 1) return null;
  return `fanout:${fanOutGroupKey(item)}`;
}

function collaborationPatternForItem(item, useWorker, workerReady) {
  if (!useWorker) return (item.depends_on || []).length > 1 ? "many_to_one" : "main_thread";
  if (workerReady.length > 1) return "one_to_many";
  if ((item.depends_on || []).length > 1) return "many_to_one";
  return "one_to_one";
}

function buildFanOutGroups(workerReady) {
  const groups = new Map();
  for (const item of workerReady) {
    const key = fanOutGroupKey(item);
    if (!groups.has(key)) {
      groups.set(key, {
        group_id: key,
        node_ids: [],
        node_types: new Set(),
        execution_surfaces: new Set(),
        worker_profiles: new Set(),
        model_tiers: new Set(),
        recommended_models: new Set(),
        join_policies: new Set(),
        handoff_targets: new Set(),
      });
    }
    const group = groups.get(key);
    group.node_ids.push(item.node_id);
    if (item.type) group.node_types.add(item.type);
    if (item.execution_surface) group.execution_surfaces.add(item.execution_surface);
    if (item.worker_profile) group.worker_profiles.add(item.worker_profile);
    if (item.model_tier) group.model_tiers.add(item.model_tier);
    if (item.recommended_model) group.recommended_models.add(item.recommended_model);
    if (item.join_policy) group.join_policies.add(item.join_policy);
    if (item.handoff_target) group.handoff_targets.add(item.handoff_target);
  }
  return [...groups.values()]
    .filter((group) => group.node_ids.length > 1)
    .map((group) => ({
      group_id: group.group_id,
      pattern: "one_to_many",
      node_ids: group.node_ids,
      node_types: [...group.node_types],
      execution_surfaces: [...group.execution_surfaces],
      worker_profiles: [...group.worker_profiles],
      model_tiers: [...group.model_tiers],
      recommended_models: [...group.recommended_models],
      join_policy: group.join_policies.size === 1 ? [...group.join_policies][0] : (group.join_policies.size > 1 ? "mixed" : null),
      handoff_target: group.handoff_targets.size === 1 ? [...group.handoff_targets][0] : (group.handoff_targets.size > 1 ? "mixed" : null),
    }));
}

function addJoinTarget(map, targetNodeId, upstreamNodeIds, source, joinPolicy = null) {
  if (!targetNodeId || upstreamNodeIds.length === 0) return;
  if (!map.has(targetNodeId)) {
    map.set(targetNodeId, {
      target_node_id: targetNodeId,
      upstream_node_ids: new Set(),
      sources: new Set(),
      join_policies: new Set(),
    });
  }
  const target = map.get(targetNodeId);
  for (const nodeId of upstreamNodeIds) target.upstream_node_ids.add(nodeId);
  target.sources.add(source);
  if (joinPolicy) target.join_policies.add(joinPolicy);
}

function buildJoinTargets(board) {
  const nodes = allBoardNodes(board);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const targets = new Map();
  for (const node of nodes) {
    const dependencies = Array.isArray(node.depends_on) ? node.depends_on : [];
    if (dependencies.length > 1) addJoinTarget(targets, node.id, dependencies, "depends_on", node.join_policy);
  }
  const byHandoffTarget = new Map();
  for (const node of nodes) {
    if (!node.handoff_target) continue;
    if (!byHandoffTarget.has(node.handoff_target)) byHandoffTarget.set(node.handoff_target, []);
    byHandoffTarget.get(node.handoff_target).push(node);
  }
  for (const [targetNodeId, upstreamNodes] of byHandoffTarget.entries()) {
    if (upstreamNodes.length < 2) continue;
    addJoinTarget(
      targets,
      targetNodeId,
      upstreamNodes.map((node) => node.id),
      "handoff_target",
      upstreamNodes[0]?.join_policy || null,
    );
  }
  return [...targets.values()].map((target) => {
    const upstreamNodeIds = [...target.upstream_node_ids];
    const targetNode = nodeById.get(target.target_node_id) || null;
    const waitingOn = upstreamNodeIds.filter((nodeId) => !TERMINAL_STATUSES.has(nodeById.get(nodeId)?.status));
    const policies = new Set(target.join_policies);
    if (targetNode?.join_policy) policies.add(targetNode.join_policy);
    return {
      target_node_id: target.target_node_id,
      pattern: "many_to_one",
      target_status: targetNode?.status || "missing",
      upstream_node_ids: upstreamNodeIds,
      upstream_statuses: upstreamNodeIds.map((nodeId) => ({
        node_id: nodeId,
        status: nodeById.get(nodeId)?.status || "missing",
        handoff: nodeById.get(nodeId)?.last_handoff || null,
      })),
      waiting_on: waitingOn,
      ready_to_join: waitingOn.length === 0 && Boolean(targetNode),
      join_policy: policies.size === 1 ? [...policies][0] : (policies.size > 1 ? "mixed" : null),
      sources: [...target.sources],
    };
  });
}

function buildCollaborationTopology(board, executionMode, workerReady, readyNow, reviewReady, language) {
  const isZh = language === "zh-CN";
  const fanOutGroups = buildFanOutGroups(workerReady);
  const joinTargets = buildJoinTargets(board);
  const activePattern = workerReady.length > 1
    ? "one_to_many"
    : workerReady.length === 1
      ? "one_to_one"
      : joinTargets.length > 0
        ? "many_to_one"
        : "main_thread_or_idle";
  const triggerReasons = [];
  if (workerReady.length === 1) {
    triggerReasons.push(isZh
      ? "1 个可派发 worker 节点就绪，主控创建单个有边界的 worker。"
      : "1 dispatchable worker node is ready; the orchestrator creates one bounded worker.");
  }
  if (workerReady.length > 1) {
    triggerReasons.push(isZh
      ? `${workerReady.length} 个可派发 worker 节点同时就绪，且未超过并行安全上限，触发一对多派发。`
      : `${workerReady.length} dispatchable worker nodes are ready within the parallel safety limit, triggering one-to-many dispatch.`);
  }
  if (joinTargets.length > 0) {
    triggerReasons.push(isZh
      ? `${joinTargets.length} 个下游节点需要汇聚多个上游 handoff，触发多对一交接跟踪。`
      : `${joinTargets.length} downstream node(s) converge multiple upstream handoffs, triggering many-to-one handoff tracking.`);
  }
  if (reviewReady.length > 0) {
    triggerReasons.push(isZh
      ? `${reviewReady.length} 个节点需要接管确认或等待外部 worker。`
      : `${reviewReady.length} node(s) need takeover confirmation or must wait for an external worker.`);
  }
  if (triggerReasons.length === 0) {
    triggerReasons.push(isZh
      ? "当前没有可自动派发的 worker；按主线程、运行中收敛、阻塞恢复或交付空闲路径处理。"
      : "No worker is automatically dispatchable right now; proceed by main-thread, convergence, blocker recovery, or idle delivery path.");
  }
  return {
    active_pattern: activePattern,
    execution_mode: executionMode,
    triggered_patterns: {
      one_to_one: workerReady.length === 1,
      one_to_many: workerReady.length > 1,
      many_to_one: joinTargets.length > 0,
    },
    trigger_reasons: triggerReasons,
    trigger_policy: {
      one_to_one: isZh
        ? "当且仅当 1 个独立、可派发、无需接管确认的 worker 节点就绪时触发。"
        : "Triggered only when exactly 1 independent, dispatchable worker node is ready without takeover review.",
      one_to_many: isZh
        ? "当 2 个或以上独立 worker 节点同时就绪，且并行槽位允许时触发；用户不手动选择并行 primitive。"
        : "Triggered when 2 or more independent worker nodes are ready and parallel slots allow it; the user does not manually pick the parallel primitive.",
      many_to_one: isZh
        ? "当下游节点声明多个 depends_on，或多个上游共享 handoff_target 时触发；下游等待 join_policy 所需 handoff。"
        : "Triggered when a downstream node declares multiple depends_on entries, or multiple upstream nodes share a handoff_target; downstream waits for the handoffs required by join_policy.",
    },
    worker_ready_count: workerReady.length,
    ready_now_count: readyNow.length,
    review_required_count: reviewReady.length,
    fan_out_groups: fanOutGroups,
    join_targets: joinTargets,
  };
}

function buildOrchestrationPlan(board, dispatchPlan = null) {
  const language = board.language || "en";
  const isZh = language === "zh-CN";
  const plan = dispatchPlan || buildDispatchPlan(board, { surface: "auto" });
  const failed = plan.failed_nodes || [];
  const blocked = plan.blocked_nodes || [];
  const running = plan.running_nodes || [];
  const ready = plan.ready_dispatches || [];
  const readyNow = ready.filter((item) => dispatchReadyNow(item) && !requiresDispatchReview(item));
  const workerReady = readyNow.filter(workerDispatch);
  const reviewReady = ready.filter((item) => dispatchReadyNow(item) && requiresDispatchReview(item));
  let executionMode = "delivery_or_idle";
  if (failed.length > 0) executionMode = "recover_or_reject";
  else if (running.length > 0) executionMode = "converge_running";
  else if (workerReady.length > 1) executionMode = "parallel_workers";
  else if (workerReady.length === 1) executionMode = "single_worker";
  else if (readyNow.length > 0) executionMode = "main_thread_node";
  else if (reviewReady.length > 0) executionMode = "confirm_takeover_or_external_assignment";
  else if (blocked.length > 0) executionMode = "blocked_requires_human_or_external_resolution";

  const actions = [];
  const collaborationTopology = buildCollaborationTopology(board, executionMode, workerReady, readyNow, reviewReady, language);
  for (const item of failed) {
    actions.push({
      action: "recover_or_reject",
      node_id: item.node_id,
      title: item.title,
      reason: item.reason || null,
      codex_behavior: isZh
        ? "读取失败 handoff 和证据，能修就打回上游或重试，无法安全判断时才询问用户。"
        : "Read the failed handoff and evidence, reject upstream or retry when safe, and ask the user only when the decision is unsafe.",
      internal_commands: [
        `node scripts/omykit-workflow.mjs context-pack ${item.node_id} --workflow ${board.workflow_id}`,
        `node scripts/omykit-workflow.mjs reject ${item.node_id} --to <node-id> --handoff <path>`,
      ],
    });
  }
  for (const item of running) {
    actions.push({
      action: "converge_running",
      node_id: item.node_id,
      title: item.title,
      claimed_by: item.claimed_by || null,
      codex_behavior: isZh
        ? "收敛进行中节点：检查真实工作、证据和 handoff；完成、打回或记录阻塞。"
        : "Converge the running node: inspect real work, evidence, and handoff; complete, reject, or block it.",
      internal_commands: [
        `node scripts/omykit-workflow.mjs context-pack ${item.node_id} --workflow ${board.workflow_id}`,
        `node scripts/omykit-workflow.mjs complete ${item.node_id} --handoff <path>`,
      ],
    });
  }
  for (const item of ready) {
    if (!dispatchReadyNow(item)) {
      actions.push({
        action: "wait_for_parallel_slot",
        node_id: item.node_id,
        title: item.title,
        reason: item.dispatch_reason,
      });
      continue;
    }
    if (requiresDispatchReview(item)) {
      actions.push({
        action: "confirm_takeover_or_wait",
        node_id: item.node_id,
        title: item.title,
        type: item.type,
        claimed_by: item.claimed_by || null,
        reason: item.dispatch_reason,
        codex_behavior: isZh
          ? "节点已有外部认领或不适合自动接管；若没有其他可自动推进节点，再询问用户是否接管、等待或切换 worker。"
          : "The node is externally claimed or not safe to take over automatically; ask whether to take over, wait, or switch worker only when no other automatic node can move.",
      });
      continue;
    }
    const useWorker = workerDispatch(item);
    const workerContract = useWorker ? buildWorkerRuntimeContract(item, board, isZh) : {
      runtime_dispatch_required: false,
      worker_creation_policy: null,
      worker_creation_steps: [],
    };
    const collaborationPattern = collaborationPatternForItem(item, useWorker, workerReady);
    actions.push({
      action: useWorker ? "dispatch_worker" : "start_in_main_thread",
      node_id: item.node_id,
      title: item.title,
      type: item.type,
      depends_on: item.depends_on || [],
      parallel_group: item.parallel_group || null,
      join_policy: item.join_policy || null,
      handoff_target: item.handoff_target || null,
      collaboration_pattern: collaborationPattern,
      dispatch_batch_id: useWorker ? dispatchBatchId(item, workerReady) : null,
      execution_surface: item.execution_surface,
      agent_type: item.agent_type,
      worker_profile: item.worker_profile,
      model_tier: item.model_tier,
      recommended_model: item.recommended_model,
      model_override: item.model_override,
      model_override_policy: item.model_override_policy,
      runtime_dispatch_required: workerContract.runtime_dispatch_required,
      worker_creation_policy: workerContract.worker_creation_policy,
      worker_creation_steps: workerContract.worker_creation_steps,
      reason: item.dispatch_reason,
      codex_behavior: useWorker
        ? (isZh ? "由 Codex 主控按 bounded context pack 真实创建 worker，并在 worker 存在后记录 assignment；不要让用户手动选择并行方式，也不要只展示计划。" : "Codex orchestrator creates a real worker with a bounded context pack and records the assignment after the worker exists; do not ask the user to choose the parallelism primitive, and do not only display the plan.")
        : (isZh ? "由主对话直接执行该节点，完成后写 handoff 并推进 workflow。" : "Main thread executes the node directly, writes a handoff, and advances the workflow."),
      internal_commands: useWorker
        ? [
          `node scripts/omykit-workflow.mjs context-pack ${item.node_id} --workflow ${board.workflow_id}`,
          `node scripts/omykit-workflow.mjs assign ${item.node_id} --agent <agent-id> --surface ${item.execution_surface} --status running --context-pack context-packs/${item.node_id}.json --handoff handoffs/${item.node_id}.json`,
        ]
        : [
          `node scripts/omykit-workflow.mjs start ${item.node_id} --workflow ${board.workflow_id}`,
        ],
    });
  }
  if (blocked.length > 0 && readyNow.length === 0 && failed.length === 0 && running.length === 0) {
    for (const item of blocked) {
      actions.push({
        action: "resolve_blocker",
        node_id: item.node_id,
        title: item.title,
        reason: item.reason || null,
        codex_behavior: isZh
          ? "只有当阻塞依赖用户、凭证、外部系统或不可安全假设的信息时，才暂停并询问用户。"
          : "Pause and ask the user only when the blocker depends on the user, credentials, external systems, or information that cannot be safely assumed.",
        internal_commands: [
          `node scripts/omykit-workflow.mjs unblock ${item.node_id} --workflow ${board.workflow_id} --reason <resolved reason>`,
        ],
      });
    }
  }

  const humanRequired = ["blocked_requires_human_or_external_resolution", "confirm_takeover_or_external_assignment"].includes(executionMode);
  return {
    schema_version: SCHEMA_VERSION,
    artifact_version: WORKFLOW_ARTIFACT_VERSION,
    workflow_id: board.workflow_id,
    language,
    generated_at: now(),
    execution_mode: executionMode,
    continue_automatically: !humanRequired && executionMode !== "delivery_or_idle",
    human_intervention_required: humanRequired,
    user_surface_policy: isZh
      ? "用户只表达意图；并行、子智能体、context pack、assignment 和节点推进由 Codex 主控按本计划内部执行。"
      : "The user states intent; Codex orchestration internally handles parallelism, subagents, context packs, assignments, and node progression from this plan.",
    manual_command_policy: {
      user_primary_intents: ["start_execute", "continue", "status", "board", "delivery", "upgrade"],
      internal_primitives: ["tasks", "dispatch-plan", "context-pack", "assign", "record-run", "start", "complete", "reject", "block", "unblock"],
      manual_dispatch_required: false,
    },
    task_intake: board.task_inbox || { summary: taskInboxSummary([]), tasks: [] },
    workstreams: board.workstreams || [],
    conflicts: board.conflicts || [],
    summary: {
      ready: board.summary.ready,
      running: board.summary.running,
      blocked: board.summary.blocked,
      failed: board.summary.failed,
      passed: board.summary.passed,
      next_recommended_action: board.summary.next_recommended_action,
    },
    safety: plan.safety,
    orchestrator: plan.orchestrator,
    runtime_capability: plan.runtime_capability,
    collaboration_topology: collaborationTopology,
    actions,
    ready_dispatches: plan.ready_dispatches,
    running_nodes: plan.running_nodes,
    failed_nodes: plan.failed_nodes,
    blocked_nodes: plan.blocked_nodes,
  };
}

function orchestrationPlanFile(workflowDir) {
  return path.join(workflowDir, "orchestration-plan.json");
}

function writeOrchestrationPlan(workflowDir, plan) {
  const file = orchestrationPlanFile(workflowDir);
  writeJson(file, plan);
  return file;
}

function printOrchestrationPlan(plan, file = null) {
  const isZh = plan.language === "zh-CN";
  console.log(`${isZh ? "自动编排计划" : "Orchestration plan"}: ${plan.workflow_id}`);
  console.log(`${isZh ? "执行模式" : "Execution mode"}: ${plan.execution_mode}`);
  console.log(`${isZh ? "自动继续" : "Continue automatically"}: ${plan.continue_automatically ? "yes" : "no"}`);
  console.log(`${isZh ? "需要人工介入" : "Human intervention required"}: ${plan.human_intervention_required ? "yes" : "no"}`);
  console.log(`${isZh ? "用户界面策略" : "User surface policy"}: ${plan.user_surface_policy}`);
  if (plan.collaboration_topology) {
    const topology = plan.collaboration_topology;
    console.log(`${isZh ? "协作拓扑" : "Collaboration topology"}: ${topology.active_pattern}`);
    for (const reason of topology.trigger_reasons || []) {
      console.log(`  ${isZh ? "触发原因" : "Trigger"}: ${reason}`);
    }
    for (const group of topology.fan_out_groups || []) {
      console.log(`  ${isZh ? "一对多" : "One-to-many"}: ${group.group_id} -> ${group.node_ids.join(", ")}${group.handoff_target ? ` -> ${group.handoff_target}` : ""}`);
    }
    for (const target of topology.join_targets || []) {
      console.log(`  ${isZh ? "多对一" : "Many-to-one"}: ${target.target_node_id} <- ${target.upstream_node_ids.join(", ")} | waiting=${target.waiting_on.join(", ") || "none"}`);
    }
  }
  if (file) console.log(`${isZh ? "计划文件" : "Plan file"}: ${path.relative(process.cwd(), file)}`);
  console.log(isZh ? "下一批动作:" : "Next actions:");
  if (plan.actions.length === 0) {
    console.log(isZh ? "- 无；交付可能已完成或没有就绪节点。" : "- none; delivery may be complete or no node is ready.");
    return;
  }
  for (const item of plan.actions) {
    console.log(`- ${item.action} ${item.node_id || "workflow"} ${item.title || ""}`.trim());
    if (item.execution_surface) {
      console.log(`  surface=${item.execution_surface} worker=${item.worker_profile || "none"} tier=${item.model_tier || "none"} recommended=${item.recommended_model || "none"} override=${item.model_override || "inherit"}`);
    }
    if (item.runtime_dispatch_required) {
      console.log(`  ${isZh ? "运行时派发" : "Runtime dispatch"}: ${isZh ? "必须真实创建 worker；不可只展示计划" : "required; create a real worker, not just a displayed plan"}`);
    }
    if (item.worker_creation_policy?.fallback_if_unavailable) {
      console.log(`  ${isZh ? "降级策略" : "Fallback"}: ${item.worker_creation_policy.fallback_if_unavailable}`);
    }
    if (item.reason) console.log(`  ${isZh ? "原因" : "Reason"}: ${item.reason}`);
    if (item.codex_behavior) console.log(`  ${isZh ? "Codex 行为" : "Codex behavior"}: ${item.codex_behavior}`);
  }
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

function renderOrchestration(plan, text) {
  if (!plan) return `<span class="muted">${escapeHtml(text.notRecorded)}</span>`;
  const topology = plan.collaboration_topology || {};
  const fanOut = renderObjectList(topology.fan_out_groups || [], text.none, (group) => {
    const target = group.handoff_target ? ` -> ${group.handoff_target}` : "";
    return `<strong>${escapeHtml(group.group_id)}</strong><p>${escapeHtml(text.nodes)}: ${renderInlineItems(group.node_ids || [], text.none)}${escapeHtml(target)}</p><p class="muted">${escapeHtml(text.dispatchBatch)}: fanout:${escapeHtml(group.group_id)}</p>`;
  });
  const joins = renderObjectList(topology.join_targets || [], text.none, (target) => {
    const waiting = target.waiting_on?.length ? target.waiting_on.join(", ") : text.none;
    return `<strong>${escapeHtml(target.target_node_id)}</strong><p>${escapeHtml(text.nodes)}: ${renderInlineItems(target.upstream_node_ids || [], text.none)}</p><p class="muted">${escapeHtml(text.waitingOn)}: ${escapeHtml(waiting)} · join_policy=${escapeHtml(target.join_policy || text.none)}</p>`;
  });
  const workerActions = (plan.actions || []).filter((action) => action.action === "dispatch_worker");
  const actions = renderObjectList(workerActions, text.none, (action) => {
    const parts = [
      action.collaboration_pattern,
      action.dispatch_batch_id,
      action.execution_surface,
      action.worker_profile,
      action.recommended_model,
      action.handoff_target ? `target=${action.handoff_target}` : null,
    ].filter(Boolean).join(" · ");
    return `<strong>${escapeHtml(action.node_id)}</strong><p>${escapeHtml(parts || text.none)}</p>`;
  });
  return `<dl>
      <dt>${escapeHtml(text.executionMode)}</dt><dd>${escapeHtml(plan.execution_mode || text.none)}</dd>
      <dt>${escapeHtml(text.activePattern)}</dt><dd>${escapeHtml(topology.active_pattern || text.none)}</dd>
      <dt>${escapeHtml(text.continue)}</dt><dd>${escapeHtml(String(plan.continue_automatically))}</dd>
      <dt>${escapeHtml(text.humanRequired)}</dt><dd>${escapeHtml(String(plan.human_intervention_required))}</dd>
    </dl>
    <h4>${escapeHtml(text.triggerReasons)}</h4>${renderList(topology.trigger_reasons || [], text.none)}
    <h4>${escapeHtml(text.fanOutGroups)}</h4>${fanOut}
    <h4>${escapeHtml(text.joinTargets)}</h4>${joins}
    <h4>${escapeHtml(text.actions)}</h4>${actions}`;
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

function renderUsageObservation(observation, text) {
  if (!observation) return `<span class="muted">${escapeHtml(text.notRecorded)}</span>`;
  const fields = [
    ["model_status", observation.model_status],
    ["model_unavailable_reason", observation.model_unavailable_reason],
    ["token_status", observation.token_status],
    ["token_unavailable_reason", observation.token_unavailable_reason],
    [text.source, observation.source],
    ["runtime_surface", observation.runtime_surface],
  ].filter(([, value]) => value !== null && value !== undefined);
  const evidence = observation.evidence?.length ? `<p><strong>${escapeHtml(text.evidence)}:</strong> ${observation.evidence.map((item) => `<code>${escapeHtml(item)}</code>`).join(" ")}</p>` : "";
  return `<dl>${fields.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>${observation.notes ? `<p class="muted">${escapeHtml(observation.notes)}</p>` : ""}${evidence}`;
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

function renderIntakeDecision(decision, text) {
  if (!decision) return `<span class="muted">${escapeHtml(text.notRecorded)}</span>`;
  const route = [
    decision.route?.entry ? `entry=${decision.route.entry}` : null,
    decision.route?.project_type ? `project_type=${decision.route.project_type}` : null,
    decision.route?.mode ? `mode=${decision.route.mode}` : null,
    decision.route?.next_skill ? `next_skill=${decision.route.next_skill}` : null,
  ].filter(Boolean).join(" · ");
  const workflow = [
    decision.workflow?.shape,
    decision.workflow?.template_id ? `template=${decision.workflow.template_id}` : null,
    `${text.controller}=${decision.workflow?.controller_enabled ? text.enabled : text.disabled}`,
  ].filter(Boolean).join(" · ");
  const assumptions = decision.assumptions?.length
    ? `<h5>${escapeHtml(text.assumptions)}</h5>${renderObjectList(decision.assumptions, text.none, (item) => {
      const impact = item.impact ? `<p class="muted">${escapeHtml(item.impact)}</p>` : "";
      return `${escapeHtml(item.text)}${impact}`;
    })}`
    : `<p><strong>${escapeHtml(text.assumptions)}:</strong> ${escapeHtml(text.none)}</p>`;
  const questions = decision.questions?.length
    ? `<h5>${escapeHtml(text.questions)}</h5>${renderObjectList(decision.questions, text.none, (item) => {
      const options = item.options?.length ? `<p class="muted">${escapeHtml(item.options.join(" / "))}</p>` : "";
      const answer = item.answer ? `<p><strong>${escapeHtml(text.answer)}:</strong> ${escapeHtml(item.answer)}</p>` : "";
      return `${escapeHtml(item.question)}${options}${answer}<p class="muted">${escapeHtml(text.customAnswersAllowed)}: ${escapeHtml(String(item.custom_answer_allowed))}</p>`;
    })}`
    : `<p><strong>${escapeHtml(text.questions)}:</strong> ${escapeHtml(text.none)}</p>`;
  const executionOptions = decision.execution_options?.length
    ? `<h5>${escapeHtml(text.executionOptions)}</h5>${renderObjectList(decision.execution_options, text.none, (item) => {
      const label = `${item.label}${item.recommended ? ` (${text.recommended})` : ""}`;
      const tradeoffs = item.tradeoffs?.length ? `<p class="muted">${escapeHtml(item.tradeoffs.join(" / "))}</p>` : "";
      const risks = item.risks?.length ? `<p class="muted">${escapeHtml(text.openRisks)}: ${escapeHtml(item.risks.join(" / "))}</p>` : "";
      return `<strong>${escapeHtml(label)}</strong><p>${escapeHtml(item.summary || "")}</p>${tradeoffs}${risks}`;
    })}`
    : `<p><strong>${escapeHtml(text.executionOptions)}:</strong> ${escapeHtml(text.none)}</p>`;
  const confirmation = decision.confirmation
    ? [
      decision.confirmation.status,
      decision.confirmation.by ? `by=${decision.confirmation.by}` : null,
      decision.confirmation.evidence ? `evidence=${decision.confirmation.evidence}` : null,
      decision.confirmation.notes,
    ].filter(Boolean).join(" · ")
    : text.notRecorded;
  return `<dl>
      <dt>${escapeHtml(text.goal)}</dt><dd>${escapeHtml(decision.goal || text.none)}</dd>
      <dt>${escapeHtml(text.route)}</dt><dd>${escapeHtml(route || text.none)}</dd>
      <dt>${escapeHtml(text.workflowShape)}</dt><dd>${escapeHtml(workflow || text.none)}</dd>
      <dt>${escapeHtml(text.selectedOption)}</dt><dd>${escapeHtml(decision.selected_option || text.none)}</dd>
      <dt>${escapeHtml(text.confirmation)}</dt><dd>${escapeHtml(confirmation)}</dd>
      <dt>${escapeHtml(text.customAnswersAllowed)}</dt><dd>${escapeHtml(String(decision.custom_answers_allowed))}</dd>
    </dl>
    ${decision.workflow?.reason ? `<p class="muted">${escapeHtml(decision.workflow.reason)}</p>` : ""}
    ${executionOptions}
    ${assumptions}
    ${questions}`;
}

function renderDownstreamContext(item, text) {
  if (!item) return `<span class="muted">${escapeHtml(text.notRecorded)}</span>`;
  const targets = item.target_nodes?.length ? item.target_nodes.join(", ") : text.none;
  const inputs = item.required_inputs?.length ? item.required_inputs.join(", ") : text.none;
  const evidence = item.evidence?.length ? item.evidence.join(", ") : text.none;
  const risks = item.carry_forward_risks?.length ? renderList(item.carry_forward_risks, text.none) : `<span class="muted">${escapeHtml(text.none)}</span>`;
  const budget = item.context_budget
    ? [item.context_budget.level, item.context_budget.max_source_files !== null && item.context_budget.max_source_files !== undefined ? `max_files=${item.context_budget.max_source_files}` : null, item.context_budget.notes].filter(Boolean).join(" · ")
    : text.notRecorded;
  return `<dl>
      <dt>${escapeHtml(text.nodes)}</dt><dd>${escapeHtml(targets)}</dd>
      <dt>${escapeHtml(text.handoffSummary)}</dt><dd>${escapeHtml(item.summary || text.none)}</dd>
      <dt>${escapeHtml(text.contextPack)}</dt><dd>${escapeHtml(inputs)}</dd>
      <dt>${escapeHtml(text.evidence)}</dt><dd>${escapeHtml(evidence)}</dd>
      <dt>${escapeHtml(text.contextUsage)}</dt><dd>${escapeHtml(budget)}</dd>
      <dt>${escapeHtml(text.handoff)}</dt><dd>${escapeHtml(item.handoff_contract || text.none)}</dd>
    </dl>
    <h5>${escapeHtml(text.openRisks)}</h5>${risks}`;
}

function renderEvolutionCandidates(items, text) {
  return renderObjectList(items, text.noEvolutionCandidates, (item) => {
    const node = item.node_id ? `<a href="#node-${escapeHtml(item.node_id)}"><code>${escapeHtml(item.node_id)}</code></a>` : "";
    const meta = [
      item.scope ? `${text.evolutionScope}: ${item.scope}` : null,
      item.promotion_status ? `${text.promotionStatus}: ${item.promotion_status}` : null,
      item.owner ? `${text.owner}: ${item.owner}` : null,
      item.update_surface ? `${text.updateSurface}: ${item.update_surface}` : null,
    ].filter(Boolean).join(" · ");
    const rationale = item.rationale ? `<p><strong>${escapeHtml(text.rationale)}:</strong> ${escapeHtml(item.rationale)}</p>` : "";
    const nextAction = item.next_action ? `<p><strong>${escapeHtml(text.nextAction)}:</strong> ${escapeHtml(item.next_action)}</p>` : "";
    const evidence = item.evidence?.length ? `<p><strong>${escapeHtml(text.evidence)}:</strong> ${escapeHtml(item.evidence.join(", "))}</p>` : "";
    return `${node} <strong>${escapeHtml(item.lesson)}</strong>${meta ? `<p class="muted">${escapeHtml(meta)}</p>` : ""}${rationale}${nextAction}${evidence}`;
  });
}

function renderCapabilityGaps(items, text) {
  return renderObjectList(items, text.noCapabilityGaps, (item) => {
    const node = item.node_id ? `<a href="#node-${escapeHtml(item.node_id)}"><code>${escapeHtml(item.node_id)}</code></a>` : "";
    const tool = item.candidate_tool
      ? [
        item.candidate_tool.name,
        item.candidate_tool.repo,
        Number.isInteger(item.candidate_tool.stars) ? `${item.candidate_tool.stars}★` : null,
        item.candidate_tool.license,
      ].filter(Boolean).join(" · ")
      : text.none;
    const meta = [
      item.integration_path ? `${text.integrationPath}: ${item.integration_path}` : null,
      item.status ? `${text.knowledgeSyncStatus}: ${item.status}` : null,
      item.owner ? `${text.owner}: ${item.owner}` : null,
    ].filter(Boolean).join(" · ");
    const rationale = item.rationale ? `<p><strong>${escapeHtml(text.rationale)}:</strong> ${escapeHtml(item.rationale)}</p>` : "";
    const trialPlan = item.trial_plan ? `<p><strong>${escapeHtml(text.trialPlan)}:</strong> ${escapeHtml(item.trial_plan)}</p>` : "";
    const decisionReason = item.decision_reason ? `<p><strong>${escapeHtml(text.decisionReason)}:</strong> ${escapeHtml(item.decision_reason)}</p>` : "";
    const nextAction = item.next_action ? `<p><strong>${escapeHtml(text.nextAction)}:</strong> ${escapeHtml(item.next_action)}</p>` : "";
    const evidence = item.evidence?.length ? `<p><strong>${escapeHtml(text.evidence)}:</strong> ${escapeHtml(item.evidence.join(", "))}</p>` : "";
    return `${node} <strong>${escapeHtml(item.capability || text.capability)}</strong>${meta ? `<p class="muted">${escapeHtml(meta)}</p>` : ""}
      <p><strong>${escapeHtml(text.currentGap)}:</strong> ${escapeHtml(item.current_gap || text.none)}</p>
      <p><strong>${escapeHtml(text.candidateTool)}:</strong> ${escapeHtml(tool)}</p>
      <p><strong>${escapeHtml(text.goal)}:</strong> ${escapeHtml(item.need || text.none)}</p>${rationale}${trialPlan}${decisionReason}${nextAction}${evidence}`;
  });
}

function renderKnowledgeSync(item, text) {
  if (!item) return `<span class="muted">${escapeHtml(text.notRecorded)}</span>`;
  return `<dl>
      <dt>${escapeHtml(text.knowledgeSyncStatus)}</dt><dd>${escapeHtml(item.status || text.notRecorded)}</dd>
      <dt>${escapeHtml(text.knowledgeSyncSkill)}</dt><dd>${escapeHtml(item.skill || text.none)}</dd>
      <dt>${escapeHtml(text.owner)}</dt><dd>${escapeHtml(item.performed_by || text.none)}</dd>
      <dt>${escapeHtml(text.knowledgeFilesReviewed)}</dt><dd>${escapeHtml(item.files_reviewed.join(", ") || text.none)}</dd>
      <dt>${escapeHtml(text.knowledgeFilesUpdated)}</dt><dd>${escapeHtml(item.files_updated.join(", ") || text.none)}</dd>
      <dt>${escapeHtml(text.knowledgeMemoryUpdated)}</dt><dd>${escapeHtml(item.memory_updated.join(", ") || text.none)}</dd>
      <dt>${escapeHtml(text.evidence)}</dt><dd>${escapeHtml(item.evidence.join(", ") || text.none)}</dd>
    </dl>${item.reason ? `<p class="muted">${escapeHtml(item.reason)}</p>` : ""}`;
}

function renderCommandRuns(items, text) {
  return renderObjectList(items, text.none, (item) => {
    const meta = [
      item.node_id ? `node=${item.node_id}` : null,
      item.status ? `status=${item.status}` : null,
      item.pid ? `${text.pid}=${item.pid}` : null,
      item.log_path ? `${text.log}=${item.log_path}` : null,
    ].filter(Boolean).join(" · ");
    const command = item.command ? `<p><strong>${escapeHtml(text.command)}:</strong> <code>${escapeHtml(item.command)}</code></p>` : "";
    const resume = item.resume_command ? `<p><strong>${escapeHtml(text.resumeCommand)}:</strong> <code>${escapeHtml(item.resume_command)}</code></p>` : "";
    return `<strong>${escapeHtml(item.run_id || item.raw || "run")}</strong>${item.label ? ` ${escapeHtml(item.label)}` : ""}${meta ? `<p class="muted">${escapeHtml(meta)}</p>` : ""}${command}${resume}`;
  });
}

function renderHandoffPackets(items, text) {
  return renderObjectList(items, text.none, (item) => {
    const dependencies = item.dependency_handoffs?.map((handoff) => `${handoff.node_id}:${handoff.status || "unknown"}`).join(", ") || text.none;
    const downstream = item.downstream_context?.summary || text.notRecorded;
    return `<a href="#node-${escapeHtml(item.node_id)}"><code>${escapeHtml(item.node_id)}</code></a> <span class="muted">${escapeHtml(item.status)}</span>
      <p><strong>${escapeHtml(text.dependsOn)}:</strong> ${escapeHtml(dependencies)}</p>
      <p><strong>${escapeHtml(text.downstreamContext)}:</strong> ${escapeHtml(downstream)}</p>`;
  });
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

function renderSkillsUsed(items, text) {
  return renderObjectList(items, text.noSkillsUsed, (item) => {
    const meta = [item.source, item.path, item.triggered_by].filter(Boolean).join(" · ");
    const purpose = item.purpose ? `<p class="muted">${escapeHtml(item.purpose)}</p>` : "";
    const evidence = item.evidence?.length ? `<p><strong>${escapeHtml(text.evidence)}:</strong> ${escapeHtml(item.evidence.join(", "))}</p>` : "";
    return `<strong>${escapeHtml(item.name)}</strong>${meta ? ` <span class="muted">${escapeHtml(meta)}</span>` : ""}${purpose}${evidence}`;
  });
}

function renderSkillDecisions(items, text) {
  return renderObjectList(items, text.noSkillDecisions, (item) => {
    const basis = item.selection_basis?.length ? `<p><strong>${escapeHtml(text.selectionBasis)}:</strong> ${escapeHtml(item.selection_basis.join("; "))}</p>` : "";
    const alternatives = item.alternatives?.length
      ? `<p><strong>${escapeHtml(text.alternatives)}:</strong> ${escapeHtml(item.alternatives.map((alternative) => {
        const parts = [alternative.name, alternative.decision, alternative.reason].filter(Boolean);
        return parts.join(" - ");
      }).join("; "))}</p>`
      : "";
    const fallback = item.fallback_policy
      ? `<p><strong>${escapeHtml(text.fallbackPolicy)}:</strong> ${escapeHtml([item.fallback_policy.when, item.fallback_policy.next_skill, item.fallback_policy.action].filter(Boolean).join(" -> ") || text.none)}</p>`
      : "";
    const feedback = item.user_feedback
      ? `<p><strong>${escapeHtml(text.userFeedback)}:</strong> ${escapeHtml([item.user_feedback.status, item.user_feedback.summary].filter(Boolean).join(" - ") || text.notRecorded)}</p>`
      : "";
    const evidence = item.evidence?.length ? `<p><strong>${escapeHtml(text.evidence)}:</strong> ${escapeHtml(item.evidence.join(", "))}</p>` : "";
    return `<strong>${escapeHtml(item.capability)}</strong><dl><dt>${escapeHtml(text.selectedSkill)}</dt><dd>${escapeHtml(item.selected || text.none)}</dd><dt>${escapeHtml(text.outcome)}</dt><dd>${escapeHtml(item.outcome || text.notRecorded)}</dd></dl><p class="muted">${escapeHtml(item.rationale || "")}</p>${basis}${alternatives}${fallback}${feedback}${evidence}`;
  });
}

function renderModelRecords(items, text) {
  return renderObjectList(items, text.noModelsRecorded, (item) => {
    const meta = [item.provider, item.model_tier, item.source, item.agent_id].filter(Boolean).join(" · ");
    const reason = item.reason ? `<p class="muted">${escapeHtml(item.reason)}</p>` : "";
    return `<strong>${escapeHtml(item.model)}</strong>${meta ? ` <span class="muted">${escapeHtml(meta)}</span>` : ""}${reason}`;
  });
}

function renderModelGroups(groups, text) {
  return renderObjectList(groups, text.noModelsRecorded, (group) => {
    const meta = [
      group.provider ? `${text.source}: ${group.provider}` : null,
      group.tiers?.length ? `${text.modelTier}: ${group.tiers.join(", ")}` : null,
      group.sources?.length ? `${text.source}: ${group.sources.join(", ")}` : null,
      group.agents?.length ? `${text.agents}: ${group.agents.join(", ")}` : null,
    ].filter(Boolean).join(" · ");
    return `<strong>${escapeHtml(group.model)}</strong><p>${escapeHtml(text.nodes)}: ${renderNodeLinks(group.nodes, text)}</p>${meta ? `<p class="muted">${escapeHtml(meta)}</p>` : ""}`;
  });
}

function renderAgentActivity(items, text) {
  return renderObjectList(items, text.noAgentActivity, (item) => {
    const tokens = formatTokens(item.token_usage, text);
    const evidence = item.evidence?.length ? `<p><strong>${escapeHtml(text.evidence)}:</strong> ${escapeHtml(item.evidence.join(", "))}</p>` : "";
    const modelParts = [item.model_tier, item.model, item.model_provider].filter(Boolean);
    const modelUnavailable = item.model_unavailable_reason ? ` (${item.model_unavailable_reason})` : "";
    const model = modelParts.length || modelUnavailable ? `<p><strong>${escapeHtml(text.modelSelection)}:</strong> ${escapeHtml(modelParts.join(" / ") || text.notRecorded)}${escapeHtml(modelUnavailable)}</p>` : "";
    const scope = item.scope ? `<p><strong>${escapeHtml(text.scope)}:</strong> ${escapeHtml(item.scope)}</p>` : "";
    const skills = item.skills_used?.length ? `<p><strong>${escapeHtml(text.skillsUsed)}:</strong> ${escapeHtml(item.skills_used.map((skill) => skill.name).join(", "))}</p>` : "";
    const context = item.context_usage?.recorded ? `<p>${escapeHtml(text.contextUsage)}: ${escapeHtml(item.context_usage.estimated_tokens || item.context_usage.source_bytes || text.notRecorded)} (${escapeHtml(item.context_usage.source)})</p>` : "";
    const timing = [item.started_at, item.completed_at].filter(Boolean).join(" -> ");
    return `<strong>${escapeHtml(item.agent_id)}</strong> ${escapeHtml(item.role)} · ${escapeHtml(item.status)} · ${escapeHtml(item.mode || "subagent")}<p class="muted">${escapeHtml(item.task || "")}</p>${scope}${skills}${model}<p>${escapeHtml(text.tokenUsage)}: ${escapeHtml(tokens)}</p>${context}${timing ? `<p>${escapeHtml(text.timeUsage)}: ${escapeHtml(timing)}</p>` : ""}${evidence}`;
  });
}

function renderAgentRoster(items, text) {
  return renderObjectList(items, text.none, (item) => {
    const nodes = item.nodes?.length ? renderNodeLinks(item.nodes, text) : `<span class="muted">${escapeHtml(text.none)}</span>`;
    const threads = item.thread_ids?.length ? item.thread_ids.join(", ") : text.none;
    const worktrees = item.worktrees?.length ? item.worktrees.join(", ") : text.none;
    return `<strong>${escapeHtml(item.agent_id)}</strong> ${escapeHtml(item.role || "")}<dl><dt>${escapeHtml(text.executionSurface)}</dt><dd>${escapeHtml(item.execution_surface || text.none)}</dd><dt>${escapeHtml(text.nodes)}</dt><dd>${nodes}</dd><dt>${escapeHtml(text.counts)}</dt><dd>${escapeHtml(Object.entries(item.statuses || {}).map(([status, count]) => `${status}:${count}`).join(", ") || text.none)}</dd><dt>${escapeHtml(text.threadId)}</dt><dd>${escapeHtml(threads)}</dd><dt>${escapeHtml(text.worktreePath)}</dt><dd>${escapeHtml(worktrees)}</dd></dl>`;
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

function renderContextUsageGroups(groups, text) {
  return renderObjectList(groups, text.none, (group) => {
    return `<strong>${escapeHtml(group.source)}</strong><p>${escapeHtml(text.nodes)}: ${renderNodeLinks(group.nodes || [], text)}</p><p>${escapeHtml(text.contextTotal)}: ${escapeHtml(group.estimated_tokens || text.notRecorded)}</p><p>${escapeHtml(text.contextBytes)}: ${escapeHtml(group.source_bytes || text.notRecorded)}</p><p>${escapeHtml(text.contextInputFiles)}: ${escapeHtml(group.input_files || text.notRecorded)}</p>`;
  });
}

function renderTaskSizeRows(items, text) {
  return renderObjectList(items, text.none, (item) => {
    return `<a href="#node-${escapeHtml(item.node_id)}"><code>${escapeHtml(item.node_id)}</code></a><p>${escapeHtml(text.taskSizeTotal)}: ${escapeHtml(item.estimated_tokens || text.notRecorded)} · ${escapeHtml(text.taskSizeBytes)}: ${escapeHtml(item.source_bytes || text.notRecorded)}</p><p class="muted">${escapeHtml(text.source)}: ${escapeHtml(item.source || text.notRecorded)}</p>`;
  });
}

function renderSkillGroups(groups, text) {
  return renderObjectList(groups, text.noSkillsUsed, (group) => {
    const meta = [
      group.sources?.length ? `${text.source}: ${group.sources.join(", ")}` : null,
      group.paths?.length ? `${text.files}: ${group.paths.join(", ")}` : null,
    ].filter(Boolean).join(" · ");
    return `<strong>${escapeHtml(group.name)}</strong><p>${escapeHtml(text.nodes)}: ${renderNodeLinks(group.nodes, text)}</p>${meta ? `<p class="muted">${escapeHtml(meta)}</p>` : ""}`;
  });
}

function renderSkillDecisionGroups(groups, text) {
  return renderObjectList(groups, text.noSkillDecisions, (group) => {
    const meta = [
      group.selected?.length ? `${text.selectedSkill}: ${group.selected.join(", ")}` : null,
      group.outcomes?.length ? `${text.outcome}: ${group.outcomes.join(", ")}` : null,
      group.next_retries?.length ? `${text.fallbackPolicy}: ${group.next_retries.join(", ")}` : null,
    ].filter(Boolean).join(" · ");
    return `<strong>${escapeHtml(group.capability)}</strong><p>${escapeHtml(text.nodes)}: ${renderNodeLinks(group.nodes, text)}</p>${meta ? `<p class="muted">${escapeHtml(meta)}</p>` : ""}`;
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
      <span>${escapeHtml(text.skillsUsed)} ${escapeHtml(node.skills_used.length)}</span>
      <span>${escapeHtml(text.skillDecisions)} ${escapeHtml(node.skill_decisions.length)}</span>
      <span>${escapeHtml(text.agents)} ${escapeHtml(node.agent_activity.length)}</span>
      <span>${escapeHtml(text.evolutionCandidates)} ${escapeHtml(node.evolution_candidates.length)}</span>
      <span>${escapeHtml(text.capabilityGaps)} ${escapeHtml(node.capability_gaps.length)}</span>
      <span>${escapeHtml(text.knowledgeSync)} ${escapeHtml(node.knowledge_sync?.status || text.notRecorded)}</span>
    </p>
    <dl>
      <dt>${escapeHtml(text.type)}</dt><dd>${escapeHtml(node.type)}</dd>
      <dt>${escapeHtml(text.worker)}</dt><dd>${escapeHtml(node.worker_profile)}</dd>
      <dt>${escapeHtml(text.agent)}</dt><dd>${escapeHtml(node.agent || text.none)}</dd>
      <dt>${escapeHtml(text.modelTier)}</dt><dd>${escapeHtml(node.model_tier)}</dd>
      <dt>${escapeHtml(text.recommendedModel)}</dt><dd>${escapeHtml(node.recommended_model || text.none)}</dd>
      <dt>${escapeHtml(text.actualModel)}</dt><dd>${escapeHtml(node.actual_models.map((item) => item.model).join(", ") || text.notRecorded)}</dd>
      <dt>${escapeHtml(text.contextUsage)}</dt><dd>${escapeHtml(node.context_usage?.recorded ? `${node.context_usage.estimated_tokens || text.notRecorded} ${text.tokens} · ${node.context_usage.source}` : text.notRecorded)}</dd>
      <dt>${escapeHtml(text.taskSize)}</dt><dd>${escapeHtml(node.task_size?.estimated_tokens || text.notRecorded)} ${escapeHtml(text.tokens)}</dd>
      <dt>${escapeHtml(text.claimed)}</dt><dd>${escapeHtml(node.claimed_by || text.unclaimed)}</dd>
      <dt>${escapeHtml(text.retry)}</dt><dd>${escapeHtml(node.retry_count)}</dd>
      <dt>${escapeHtml(text.tokens)}</dt><dd>${escapeHtml(formatTokens(node.token_usage, text))}</dd>
      <dt>${escapeHtml(text.skillsUsed)}</dt><dd>${escapeHtml(node.skills_used.map((skill) => skill.name).join(", ") || text.none)}</dd>
      <dt>${escapeHtml(text.skillDecisions)}</dt><dd>${escapeHtml(node.skill_decisions.map((decision) => `${decision.capability}:${decision.selected}`).join(", ") || text.none)}</dd>
      <dt>${escapeHtml(text.knowledgeSync)}</dt><dd>${escapeHtml(node.knowledge_sync?.status || text.notRecorded)}</dd>
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
  return `<div class="task-table task-tracker-table" role="table">
    <div class="task-row task-head" role="row">
      <span>${escapeHtml(text.nodes)}</span>
      <span>${escapeHtml(text.actualWork)}</span>
      <span>${escapeHtml(text.skillsUsed)}</span>
      <span>${escapeHtml(text.modelSelection)}</span>
      <span>${escapeHtml(text.changedFiles)}</span>
      <span>${escapeHtml(text.verification)}</span>
      <span>${escapeHtml(text.tokenUsage)}</span>
      <span>${escapeHtml(text.contextUsage)}</span>
      <span>${escapeHtml(text.openRisks)}</span>
    </div>
    ${nodes
      .map((node) => {
        const work = node.work_items.map((item) => item.title).join("; ") || text.noWorkItems;
        const skills = node.skills_used.map((skill) => skill.name).join(", ") || text.noSkillsUsed;
        const actualModels = node.actual_models.map((item) => item.model).join(", ") || text.notRecorded;
        const model = `${node.recommended_model || text.none} -> ${actualModels}`;
        const files = node.changed_files.map((file) => file.path).join(", ") || text.noChangedFiles;
        const checks = node.required_checks.map((item) => `${item.command}: ${item.result}`).join("; ") || text.none;
        const risks = [...node.open_risks, ...node.non_blocking_notes].join("; ") || text.none;
        const context = node.context_usage?.recorded
          ? `${node.context_usage.estimated_tokens || text.notRecorded} ${text.tokens} · ${node.context_usage.source}`
          : text.notRecorded;
        return `<div class="task-row" role="row" data-node-id="${escapeHtml(node.id)}" data-status="${escapeHtml(node.status)}">
          <span><a href="#node-${escapeHtml(node.id)}"><strong>${escapeHtml(node.id)}</strong></a><br><small>${escapeHtml(node.display_title || node.title)}</small><br><span class="status ${escapeHtml(node.status)}">${escapeHtml(statusTitle(node.status, text))}</span></span>
          <span>${escapeHtml(truncateText(work, 240))}</span>
          <span>${escapeHtml(truncateText(skills, 160))}</span>
          <span>${escapeHtml(truncateText(model, 180))}</span>
          <span>${escapeHtml(truncateText(files, 180))}</span>
          <span>${escapeHtml(truncateText(checks, 220))}</span>
          <span>${escapeHtml(formatTokens(node.token_usage, text))}</span>
          <span>${escapeHtml(context)}</span>
          <span>${escapeHtml(truncateText(risks, 180))}</span>
        </div>`;
      })
      .join("")}
  </div>`;
}

function renderTaskInbox(taskInbox, workstreams, conflicts, text) {
  const tasks = taskInbox?.tasks || [];
  const summary = taskInbox?.summary || taskInboxSummary([]);
  const taskRows = tasks.length > 0
    ? tasks.map((task) => `<div class="task-row" role="row">
        <span><strong>${escapeHtml(task.task_id || text.none)}</strong><br><small>${escapeHtml(task.at || "")}</small></span>
        <span>${escapeHtml(task.brief || text.none)}</span>
        <span>${escapeHtml(task.decision || text.notRecorded)}<br><small>${escapeHtml(task.relation || text.none)}</small></span>
        <span>${escapeHtml(task.template_id || text.none)}<br><small>${escapeHtml(task.linked_workflow_id || text.none)}</small></span>
        <span>${renderInlineItems(task.suggested_write_scope || [], text.none)}</span>
        <span>${escapeHtml(task.tags?.join(", ") || text.none)}</span>
        <span>${escapeHtml(task.conflict_risk || text.none)}</span>
        <span>${escapeHtml(task.workstream || text.none)}</span>
      </div>`).join("")
    : `<p class="muted">${escapeHtml(text.none)}</p>`;
  const streamHtml = renderObjectList(workstreams || [], text.none, (stream) => {
    return `<strong>${escapeHtml(stream.id)}</strong> <span class="muted">${escapeHtml(stream.kind || "")}</span>
      <p><strong>${escapeHtml(text.taskDecision)}:</strong> ${escapeHtml(stream.decision || text.none)}</p>
      <p><strong>${escapeHtml(text.nodes)}:</strong> ${escapeHtml((stream.tasks || []).join(", ") || text.none)}</p>
      <p><strong>${escapeHtml(text.writeScope)}:</strong> ${renderInlineItems(stream.suggested_write_scope || [], text.none)}</p>`;
  });
  const conflictHtml = renderObjectList(conflicts || [], text.none, (conflict) => {
    return `<strong>${escapeHtml(conflict.kind || text.conflictArbiter)}</strong> <span class="muted">${escapeHtml(conflict.severity || "")}</span>
      <p><strong>${escapeHtml(text.nodes)}:</strong> ${escapeHtml((conflict.task_ids || []).join(", ") || text.none)}</p>
      <p><strong>${escapeHtml(text.writeScope)}:</strong> ${renderInlineItems(conflict.shared_scope || [], text.none)}</p>
      <p><strong>${escapeHtml(text.actionHint)}:</strong> ${escapeHtml(conflict.action || text.none)}</p>`;
  });
  return `<div class="metrics">
      ${renderMetric(text.total, summary.total || 0)}
      ${renderMetric(text.ready, summary.open || 0)}
      ${renderMetric(text.workstreams, (workstreams || []).length)}
      ${renderMetric(text.conflicts, (conflicts || []).length)}
    </div>
    <h3>${escapeHtml(text.taskMergeGate)}</h3>
    <div class="task-table task-inbox-table" role="table">
      <div class="task-row task-head" role="row">
        <span>${escapeHtml(text.taskInbox)}</span>
        <span>${escapeHtml(text.taskBrief)}</span>
        <span>${escapeHtml(text.taskDecision)}</span>
        <span>${escapeHtml(text.template)}</span>
        <span>${escapeHtml(text.writeScope)}</span>
        <span>${escapeHtml(text.tags || "Tags")}</span>
        <span>${escapeHtml(text.taskConflictRisk)}</span>
        <span>${escapeHtml(text.taskWorkstream)}</span>
      </div>
      ${taskRows}
    </div>
    <div class="grid-2" style="margin-top:12px">
      <section><h3>${escapeHtml(text.workstreams)}</h3>${streamHtml}</section>
      <section><h3>${escapeHtml(text.conflictArbiter)}</h3>${conflictHtml}</section>
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
        <section><h4>${escapeHtml(text.intakeDecision)}</h4>${renderIntakeDecision(node.intake_decision, text)}</section>
        <section><h4>${escapeHtml(text.downstreamContext)}</h4>${renderDownstreamContext(node.downstream_context, text)}</section>
        <section><h4>${escapeHtml(text.workflowEvolution)}</h4>${renderEvolutionCandidates(node.evolution_candidates, text)}</section>
        <section><h4>${escapeHtml(text.capabilityGaps)}</h4>${renderCapabilityGaps(node.capability_gaps, text)}</section>
        <section><h4>${escapeHtml(text.knowledgeSync)}</h4>${renderKnowledgeSync(node.knowledge_sync, text)}</section>
        <section><h4>${escapeHtml(text.actualWork)}</h4>${renderWorkItems(node.work_items, text)}</section>
        <section><h4>${escapeHtml(text.skillsUsed)}</h4>${renderSkillsUsed(node.skills_used, text)}</section>
        <section><h4>${escapeHtml(text.skillDecisions)}</h4>${renderSkillDecisions(node.skill_decisions, text)}</section>
        <section><h4>${escapeHtml(text.changedFiles)}</h4>${renderChangedFiles(node.changed_files, text)}</section>
        <section><h4>${escapeHtml(text.verification)}</h4>${renderList(node.required_checks, text.none)}</section>
        <section><h4>${escapeHtml(text.evidencePaths)}</h4>${renderEvidenceItems(node.evidence_items, text)}</section>
        <section><h4>${escapeHtml(text.tokenUsage)}</h4>${renderTokenUsage(node.token_usage, text)}</section>
        <section><h4>${escapeHtml(text.actualModel)}</h4>${renderModelRecords(node.actual_models, text)}</section>
        <section><h4>${escapeHtml(text.usageObservation)}</h4>${renderUsageObservation(node.usage_observation, text)}</section>
        <section><h4>${escapeHtml(text.contextUsage)}</h4>${renderContextUsage(node.context_usage, text)}</section>
        <section><h4>${escapeHtml(text.timeUsage)}</h4>${renderTiming(node.timing, text)}</section>
        <section><h4>${escapeHtml(text.agentPolicy)}</h4><dl><dt>${escapeHtml(text.complexity)}</dt><dd>${escapeHtml(node.task_complexity)}</dd><dt>${escapeHtml(text.agent)}</dt><dd>${escapeHtml(node.agent || text.none)}</dd><dt>${escapeHtml(text.modelTier)}</dt><dd>${escapeHtml(node.model_tier)}</dd><dt>${escapeHtml(text.recommendedModel)}</dt><dd>${escapeHtml(node.recommended_model || text.none)}</dd><dt>${escapeHtml(text.modelProfile)}</dt><dd>${escapeHtml(node.model_profile || text.none)}</dd><dt>${escapeHtml(text.runtimeProfile)}</dt><dd>${escapeHtml(node.runtime_profile || text.none)}</dd><dt>${escapeHtml(text.safetyProfile)}</dt><dd>${escapeHtml(node.safety_profile || text.none)}</dd><dt>${escapeHtml(text.scorecard)}</dt><dd>${escapeHtml(node.scorecard || text.none)}</dd><dt>${escapeHtml(text.modelSelection)}</dt><dd>${escapeHtml(node.recommended_model_reason || node.model_selection_reason)}</dd></dl></section>
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
    .task-row { display: grid; grid-template-columns: minmax(120px, 0.8fr) minmax(220px, 1.4fr) minmax(140px, 0.9fr) minmax(160px, 1fr) minmax(160px, 1fr) minmax(200px, 1.2fr) minmax(110px, 0.8fr) minmax(140px, 1fr); gap: 0; border-top: 1px solid var(--line); background: #fff; }
    .task-tracker-table .task-row { grid-template-columns: minmax(120px, 0.8fr) minmax(220px, 1.4fr) minmax(140px, 0.9fr) minmax(160px, 1fr) minmax(160px, 1fr) minmax(200px, 1.2fr) minmax(110px, 0.8fr) minmax(150px, 0.9fr) minmax(140px, 1fr); }
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
        ${renderMetric(text.intakeDecision, board.summary.intake_decisions, "#node-details")}
        ${renderMetric(text.skillsUsed, board.summary.skills_used, "#skill-usage")}
        ${renderMetric(text.skillDecisions, board.summary.skill_decisions, "#skill-usage")}
        ${renderMetric(text.actualModel, board.summary.actual_models, "#model-usage")}
        ${renderMetric(text.assignments, board.summary.assignments, "#agent-roster")}
        ${renderMetric(text.evolutionCandidates, board.summary.evolution_candidates, "#workflow-evolution")}
        ${renderMetric(text.capabilityGaps, board.summary.capability_gaps, "#workflow-evolution")}
        ${renderMetric(text.knowledgeSyncReviews, board.summary.knowledge_sync_reviews, "#node-details")}
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
          <dt>${escapeHtml(text.controller)}</dt><dd>${escapeHtml(board.controller?.name || text.none)}</dd>
          <dt>${escapeHtml(text.controllerRole)}</dt><dd>${escapeHtml(board.controller?.role || text.none)}</dd>
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

    <section class="panel" id="orchestration-plan">
      <h2>${escapeHtml(text.orchestrationPlan)}</h2>
      ${renderOrchestration(board.orchestration, text)}
    </section>

    <section class="panel" id="recommendations">
      <h2>${escapeHtml(text.improvementPlan)}</h2>
      ${renderRecommendations(board.recommendations || board.improvement_plan, text)}
    </section>

    <section class="panel" id="task-inbox">
      <h2>${escapeHtml(text.taskInbox)}</h2>
      ${renderTaskInbox(board.task_inbox, board.workstreams, board.conflicts, text)}
    </section>

    <section class="panel" id="workflow-evolution">
      <h2>${escapeHtml(text.workflowEvolution)}</h2>
      <div class="metrics">
        ${renderMetric(text.evolutionCandidates, board.summary.evolution_candidates || 0)}
        ${renderMetric(text.genericCandidates, board.evolution.generic_candidates.length)}
        ${renderMetric(text.capabilityGaps, board.summary.capability_gaps || 0)}
        ${renderMetric(text.capabilityGapCandidates, board.capability_gaps.generic_candidates.length)}
        ${renderMetric(text.missingEvolutionReview, board.evolution.missing_review_nodes.length)}
        ${renderMetric(text.nodes, board.evolution.recorded_nodes)}
      </div>
      <p><strong>${escapeHtml(text.missingEvolutionReview)}:</strong> ${renderNodeLinks(board.evolution.missing_review_nodes, text)}</p>
      ${renderEvolutionCandidates(board.evolution.candidates, text)}
      <h3>${escapeHtml(text.capabilityGaps)}</h3>
      ${renderCapabilityGaps(board.capability_gaps.gaps, text)}
    </section>

    <section class="panel" id="task-tracker">
      <h2>${escapeHtml(text.taskTracker)}</h2>
      ${renderTaskTracker(allNodes, text)}
      <p id="filter-status" class="muted" aria-live="polite"></p>
    </section>

    <section class="panel" id="skill-usage">
      <h2>${escapeHtml(text.skillUsage)}</h2>
      <div class="metrics">
        ${renderMetric(text.skillsUsed, board.summary.skills_used || text.notRecorded)}
        ${renderMetric(text.skillRecorded, board.skills.recorded_nodes)}
        ${renderMetric(text.skillMissing, board.skills.missing_nodes.length)}
        ${renderMetric(text.skillCoverage, `${board.skills.coverage_percent}%`)}
        ${renderMetric(text.skillDecisions, board.summary.skill_decisions || 0)}
        ${renderMetric(text.skillDecisionCoverage, `${board.skills.selection_coverage_percent}%`)}
      </div>
      <p><strong>${escapeHtml(text.skillMissing)}:</strong> ${escapeHtml(board.skills.missing_nodes.join(", ") || text.none)}</p>
      <p><strong>${escapeHtml(text.skillDecisionMissing)}:</strong> ${escapeHtml(board.skills.selection_missing_nodes.join(", ") || text.none)}</p>
      <h3>${escapeHtml(text.skillsUsed)}</h3>
      ${renderSkillGroups(board.skills.by_skill, text)}
      <h3>${escapeHtml(text.skillDecisions)}</h3>
      ${renderSkillDecisionGroups(board.skills.by_capability, text)}
    </section>

    <section class="panel" id="model-usage">
      <h2>${escapeHtml(text.modelUsage)}</h2>
      <div class="metrics">
        ${renderMetric(text.recommendedModel, board.models.recommended_nodes)}
        ${renderMetric(text.modelRecorded, board.models.actual_recorded_nodes)}
        ${renderMetric(text.modelUnavailable, board.models.unavailable_nodes.length)}
        ${renderMetric(text.modelMissing, board.models.missing_actual_nodes.length)}
        ${renderMetric(text.modelCoverage, `${board.models.actual_coverage_percent}%`)}
        ${renderMetric(text.modelValueCoverage, `${board.models.recorded_value_coverage_percent}%`)}
      </div>
      <p><strong>${escapeHtml(text.modelMissing)}:</strong> ${escapeHtml(board.models.missing_actual_nodes.join(", ") || text.none)}</p>
      <p><strong>${escapeHtml(text.modelUnavailable)}:</strong> ${escapeHtml(board.models.unavailable_nodes.join(", ") || text.none)}</p>
      <h3>${escapeHtml(text.recommendedModel)}</h3>
      ${renderModelGroups(board.models.recommended_by_model, text)}
      <h3>${escapeHtml(text.actualModel)}</h3>
      ${renderModelGroups(board.models.actual_by_model, text)}
    </section>

    <section class="panel">
      <h2>${escapeHtml(text.tokenUsage)}</h2>
      <div class="metrics">
        ${renderMetric(text.tokenTotal, board.usage.totals.total_tokens || text.notRecorded)}
        ${renderMetric(text.tokenRecorded, board.usage.recorded_nodes)}
        ${renderMetric(text.tokenUnavailable, board.usage.unavailable_nodes.length)}
        ${renderMetric(text.tokenMissing, board.usage.missing_nodes.length)}
        ${renderMetric(text.tokenCoverage, `${board.usage.coverage_percent}%`)}
        ${renderMetric(text.tokenValueCoverage, `${board.usage.recorded_value_coverage_percent}%`)}
      </div>
      <p><strong>${escapeHtml(text.tokenMissing)}:</strong> ${escapeHtml(board.usage.missing_nodes.join(", ") || text.none)}</p>
      <p><strong>${escapeHtml(text.tokenUnavailable)}:</strong> ${escapeHtml(board.usage.unavailable_nodes.join(", ") || text.none)}</p>
      <h3>${escapeHtml(text.parallelGroups)}</h3>
      ${renderUsageGroups(board.usage.by_parallel_group, text)}
    </section>

    <section class="panel">
      <h2>${escapeHtml(text.contextUsage)} / ${escapeHtml(text.timeUsage)}</h2>
      <div class="metrics">
        ${renderMetric(text.contextTotal, board.context.totals.estimated_tokens || text.notRecorded)}
        ${renderMetric(text.contextBytes, board.context.totals.source_bytes || text.notRecorded)}
        ${renderMetric(text.contextInputFiles, board.context.totals.input_files || text.notRecorded)}
        ${renderMetric(text.contextRecorded, board.context.recorded_nodes)}
        ${renderMetric(text.contextCoverage, `${board.context.coverage_percent}%`)}
        ${renderMetric(text.taskSizeTotal, board.task_size?.totals?.estimated_tokens || text.notRecorded)}
        ${renderMetric(text.elapsed, formatDuration(board.timing.elapsed_minutes, text))}
        ${renderMetric(text.estimatedRemaining, formatDuration(board.timing.estimated_remaining_minutes, text))}
        ${renderMetric(text.averageNodeTime, formatDuration(board.timing.average_node_minutes, text))}
      </div>
      <p><strong>${escapeHtml(text.contextMissing)}:</strong> ${escapeHtml(board.context.missing_nodes.join(", ") || text.none)}</p>
      <h3>${escapeHtml(text.contextSourceBreakdown)}</h3>
      ${renderContextUsageGroups(board.context.by_source || [], text)}
      <h3>${escapeHtml(text.taskSize)}</h3>
      ${renderTaskSizeRows(board.task_size?.largest_nodes || [], text)}
    </section>

    <section class="grid-2" id="handoff-commands">
      <div class="panel">
        <h2>${escapeHtml(text.handoffPackets)}</h2>
        ${renderHandoffPackets(board.handoff_packets.by_node, text)}
      </div>
      <div class="panel">
        <h2>${escapeHtml(text.commandRuns)}</h2>
        <div class="metrics">
          ${renderMetric(text.commandRuns, board.commands.records.length)}
          ${renderMetric(text.activeCommandRuns, board.commands.active.length)}
          ${renderMetric(text.resumableCommandRuns, board.commands.resumable.length)}
        </div>
        <h3>${escapeHtml(text.activeCommandRuns)}</h3>
        ${renderCommandRuns(board.commands.active, text)}
        <h3>${escapeHtml(text.resumableCommandRuns)}</h3>
        ${renderCommandRuns(board.commands.resumable, text)}
      </div>
    </section>

    <section class="panel" id="node-details">
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

    <section class="panel" id="agent-roster">
      <h2>${escapeHtml(text.agentRoster)}</h2>
      <div class="metrics">
        ${renderMetric(text.assignments, board.assignments.records.length)}
        ${renderMetric(text.running, board.assignments.active.length)}
        ${renderMetric(text.handoff, board.assignments.missing_handoffs.length)}
        ${renderMetric(text.writeScope, board.assignments.write_scope_conflicts.length)}
      </div>
      ${renderAgentRoster(board.collaboration.agent_roster, text)}
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

function persistHandoffInWorkflow(workflowDir, handoffPath, handoff) {
  const handoffDir = path.join(workflowDir, "handoffs");
  const source = path.resolve(handoffPath);
  const targetDir = path.resolve(handoffDir);
  if (source.startsWith(`${targetDir}${path.sep}`)) return handoffPath;

  const parsed = path.parse(handoffPath);
  const baseName = slugify(parsed.name || handoff.node_id || "handoff");
  let target = path.join(handoffDir, `${baseName}.json`);
  let counter = 2;
  while (fs.existsSync(target)) {
    target = path.join(handoffDir, `${baseName}-${counter}.json`);
    counter += 1;
  }
  writeJson(target, handoff);
  return target;
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

const WORKFLOW_RUNTIME_DIRS = [
  "nodes",
  "handoffs",
  "context-packs",
  "commands",
  "evidence",
  path.join("evidence", "screenshots"),
];

function workflowUpgradeFile(workflowDir) {
  return path.join(workflowDir, "workflow-upgrade.json");
}

function ensureWorkflowRuntimeDir(workflowDir, relativeDir, actions) {
  const dir = path.join(workflowDir, relativeDir);
  if (fs.existsSync(dir)) return;
  ensureDir(dir);
  actions.push(`created directory ${relativeDir}`);
}

function ensureWorkflowTextFile(workflowDir, relativeFile, title, workflowId, actions) {
  const file = path.join(workflowDir, relativeFile);
  if (fs.existsSync(file)) return;
  fs.writeFileSync(file, `# ${title}\n\nWorkflow: ${workflowId}\n\n`);
  actions.push(`created ${relativeFile}`);
}

function upgradeWorkflowArtifacts(workflowDir, options = {}) {
  const graphPath = path.join(workflowDir, "graph.json");
  const statePath = path.join(workflowDir, "state.json");
  if (!fs.existsSync(graphPath)) throw new Error(`Missing graph.json in ${workflowDir}`);
  if (!fs.existsSync(statePath)) throw new Error(`Missing state.json in ${workflowDir}`);

  const graph = readJson(graphPath);
  const state = readJson(statePath);
  const workflowId = graph.workflow_id || path.basename(workflowDir);
  const previousArtifactVersion = graph.metadata?.workflow_artifact_version || null;
  const actions = [];
  const warnings = [];
  let graphChanged = false;
  let stateChanged = false;

  if (graph.schema_version !== SCHEMA_VERSION) {
    graph.schema_version = SCHEMA_VERSION;
    graphChanged = true;
    actions.push(`set graph.schema_version=${SCHEMA_VERSION}`);
  }
  if (!graph.metadata || typeof graph.metadata !== "object") {
    graph.metadata = {};
    graphChanged = true;
    actions.push("created graph.metadata");
  }

  const metadataDefaults = {
    controller: "omykit-workflow",
    controller_role: "orchestrator-observer",
    workflow_artifact_version: WORKFLOW_ARTIFACT_VERSION,
  };
  for (const [key, value] of Object.entries(metadataDefaults)) {
    if (graph.metadata[key] !== value) {
      graph.metadata[key] = value;
      graphChanged = true;
      actions.push(`set graph.metadata.${key}`);
    }
  }

  const commandSurface = {
    user_primary_intents: ["start_execute", "continue", "status", "board", "delivery", "upgrade"],
    internal_primitives: ["orchestrate", "dispatch-plan", "context-pack", "assign", "record-run", "start", "complete", "reject", "block", "unblock"],
    manual_dispatch_required: false,
  };
  if (JSON.stringify(graph.metadata.command_surface || null) !== JSON.stringify(commandSurface)) {
    graph.metadata.command_surface = commandSurface;
    graphChanged = true;
    actions.push("set graph.metadata.command_surface");
  }

  const orchestrationPolicy = {
    automatic_dispatch_decision: true,
    human_intervention_only_for_blockers: true,
    evidence_migration_policy: "do_not_fabricate_missing_handoffs_or_usage",
  };
  if (JSON.stringify(graph.metadata.orchestration_policy || null) !== JSON.stringify(orchestrationPolicy)) {
    graph.metadata.orchestration_policy = orchestrationPolicy;
    graphChanged = true;
    actions.push("set graph.metadata.orchestration_policy");
  }

  if (state.schema_version !== SCHEMA_VERSION) {
    state.schema_version = SCHEMA_VERSION;
    stateChanged = true;
    actions.push(`set state.schema_version=${SCHEMA_VERSION}`);
  }
  if (state.workflow_id !== workflowId) {
    state.workflow_id = workflowId;
    stateChanged = true;
    actions.push("set state.workflow_id");
  }
  const stateWorkflowMetadata = workflowMetadataFromGraph(graph);
  if (JSON.stringify(state.workflow_metadata || null) !== JSON.stringify(stateWorkflowMetadata)) {
    state.workflow_metadata = stateWorkflowMetadata;
    stateChanged = true;
    actions.push("set state.workflow_metadata");
  }

  for (const relativeDir of WORKFLOW_RUNTIME_DIRS) ensureWorkflowRuntimeDir(workflowDir, relativeDir, actions);
  ensureWorkflowTextFile(workflowDir, "decisions.md", "Decisions", workflowId, actions);
  ensureWorkflowTextFile(workflowDir, "blockers.md", "Blockers", workflowId, actions);
  if (!fs.existsSync(assignmentsFile(workflowDir))) {
    fs.writeFileSync(assignmentsFile(workflowDir), "");
    actions.push("created assignments.jsonl");
  }
  for (const node of graph.nodes || []) {
    const cardFile = path.join(workflowDir, "nodes", `${node.id}.json`);
    if (!fs.existsSync(cardFile)) {
      writeJson(cardFile, nodeCard(graph, node));
      actions.push(`created nodes/${node.id}.json`);
    }
    const nodeState = state.nodes?.[node.id];
    if (nodeState && TERMINAL_STATUSES.has(nodeState.status)) {
      const handoffPath = nodeState.last_handoff ? path.join(workflowDir, nodeState.last_handoff) : null;
      if (!handoffPath || !fs.existsSync(handoffPath)) {
        warnings.push(`node ${node.id} is ${nodeState.status} but has no readable handoff; upgrade will not invent evidence`);
      }
    }
  }

  if (graphChanged) writeJson(graphPath, graph);
  if (stateChanged) {
    state.updated_at = now();
    writeJson(statePath, state);
  }
  const report = {
    schema_version: SCHEMA_VERSION,
    artifact_version: WORKFLOW_ARTIFACT_VERSION,
    workflow_id: workflowId,
    upgraded_at: now(),
    previous_artifact_version: previousArtifactVersion,
    graph_changed: graphChanged,
    state_changed: stateChanged,
    actions,
    warnings,
    evidence_policy: "Upgrade adds compatibility metadata, runtime directories, missing node cards, and reports gaps. It never fabricates handoffs, token usage, skill usage, actual models, or verification evidence.",
  };
  const reportFile = workflowUpgradeFile(workflowDir);
  writeJson(reportFile, report);
  if (actions.length > 0 || warnings.length > 0 || options.recordLedger) {
    appendLedger(workflowDir, {
      event: "workflow.upgrade",
      workflow_id: workflowId,
      artifact_version: WORKFLOW_ARTIFACT_VERSION,
      actions: actions.length,
      warnings: warnings.length,
      report: relativeToWorkflow(workflowDir, reportFile),
    });
  }
  return { report, reportFile };
}

function doctorIssue({ id, severity = "warning", scope = "project", path: issuePath = null, workflow_id = null, summary, detail = null, fixable = false, next_action = null }) {
  return {
    id,
    severity,
    scope,
    path: issuePath,
    workflow_id,
    summary,
    detail,
    fixable,
    next_action,
  };
}

function cleanupCandidate({ id, kind, workflow_id = null, paths, reason, reason_zh = null, safety = "archive_only", action = "archive" }) {
  const candidate = {
    id,
    kind,
    workflow_id,
    paths: asStringArray(paths),
    reason,
    safety,
    action,
  };
  if (reason_zh) candidate.reason_zh = reason_zh;
  return candidate;
}

function cleanupReasonForDisplay(candidate, language) {
  if (language === "zh-CN" && candidate.reason_zh) return candidate.reason_zh;
  return candidate.reason || "";
}

function workflowStatusSummary(graph, state) {
  if (!graph?.nodes || !state?.nodes) return {};
  return statusCounts(graph.nodes.map((node) => ({ status: state.nodes[node.id]?.status || "missing" })));
}

function workflowAllNodesTerminal(graph, state) {
  const nodes = graph?.nodes || [];
  if (nodes.length === 0) return false;
  return nodes.every((node) => TERMINAL_STATUSES.has(state?.nodes?.[node.id]?.status));
}

function workflowSourceFiles(workflowDir) {
  return [
    path.join(workflowDir, "graph.json"),
    path.join(workflowDir, "state.json"),
    path.join(workflowDir, "ledger.jsonl"),
    path.join(workflowDir, "decisions.md"),
    path.join(workflowDir, "blockers.md"),
    assignmentsFile(workflowDir),
    ...filesInDir(path.join(workflowDir, "nodes"), (name) => name.endsWith(".json")),
    ...filesInDir(path.join(workflowDir, "handoffs"), (name) => name.endsWith(".json")),
    ...filesInDir(path.join(workflowDir, "context-packs"), (name) => name.endsWith(".json")),
    ...filesInDir(path.join(workflowDir, "commands"), () => true),
  ];
}

function boardProjectionStatus(workflowDir) {
  const jsonPath = path.join(workflowDir, "board.json");
  const htmlPath = path.join(workflowDir, "board.html");
  const jsonStat = safeStat(jsonPath);
  const htmlStat = safeStat(htmlPath);
  const missing = [];
  if (!jsonStat) missing.push("board.json");
  if (!htmlStat) missing.push("board.html");
  const sourceMtime = latestMtimeMs(workflowSourceFiles(workflowDir));
  const boardMtime = Math.min(jsonStat?.mtimeMs || 0, htmlStat?.mtimeMs || 0);
  return {
    json_path: jsonPath,
    html_path: htmlPath,
    missing,
    source_mtime_ms: sourceMtime,
    board_mtime_ms: boardMtime,
    stale: missing.length === 0 && sourceMtime > boardMtime,
  };
}

function workflowNeedsCompatibilityUpgrade(workflowDir, graph, state) {
  const reasons = [];
  if (graph.schema_version !== SCHEMA_VERSION) reasons.push("graph schema version");
  if (graph.metadata?.workflow_artifact_version !== WORKFLOW_ARTIFACT_VERSION) reasons.push("artifact version");
  for (const relativeDir of WORKFLOW_RUNTIME_DIRS) {
    if (!fs.existsSync(path.join(workflowDir, relativeDir))) reasons.push(`missing ${relativeDir}`);
  }
  for (const file of ["decisions.md", "blockers.md", "assignments.jsonl"]) {
    if (!fs.existsSync(path.join(workflowDir, file))) reasons.push(`missing ${file}`);
  }
  for (const node of graph.nodes || []) {
    if (!fs.existsSync(path.join(workflowDir, "nodes", `${node.id}.json`))) reasons.push(`missing nodes/${node.id}.json`);
    const nodeState = state.nodes?.[node.id];
    if (nodeState && TERMINAL_STATUSES.has(nodeState.status)) {
      const handoffPath = nodeState.last_handoff ? path.join(workflowDir, nodeState.last_handoff) : null;
      if (!handoffPath || !fs.existsSync(handoffPath)) reasons.push(`terminal ${node.id} lacks readable handoff`);
    }
  }
  return reasons;
}

function collectWorkflowCleanupCandidates(workflowDir, cwd, graph = null, state = null, validateErrors = [], activeCommands = []) {
  const candidates = [];
  const workflowId = graph?.workflow_id || path.basename(workflowDir);
  const nodeIds = new Set((graph?.nodes || []).map((node) => node.id));
  if (validateErrors.length > 0 && workflowAllNodesTerminal(graph, state) && activeCommands.length === 0) {
    candidates.push(cleanupCandidate({
      id: `${workflowId}:completed-legacy-workflow`,
      kind: "completed_legacy_workflow",
      workflow_id: workflowId,
      paths: [projectRelativePath(workflowDir, cwd)],
      reason: "Completed historical workflow fails the current evidence schema. Archive it instead of fabricating missing handoff fields.",
      reason_zh: "已完结的历史 workflow 不符合当前证据 schema；应归档，不能补造缺失 handoff 字段。",
    }));
    return candidates;
  }
  const board = boardProjectionStatus(workflowDir);
  if (board.stale) {
    candidates.push(cleanupCandidate({
      id: `${workflowId}:stale-board`,
      kind: "stale_board_projection",
      workflow_id: workflowId,
      paths: [projectRelativePath(board.json_path, cwd), projectRelativePath(board.html_path, cwd)],
      reason: "Board projection is older than workflow source files. It can be regenerated with the board command.",
      reason_zh: "看板投影早于 workflow 源文件，可用 board 命令重新生成。",
    }));
  }
  if (nodeIds.size > 0) {
    for (const file of filesInDir(path.join(workflowDir, "nodes"), (name) => name.endsWith(".json"))) {
      const nodeId = path.basename(file, ".json");
      if (!nodeIds.has(nodeId)) {
        candidates.push(cleanupCandidate({
          id: `${workflowId}:orphan-node-card:${nodeId}`,
          kind: "orphan_node_card",
          workflow_id: workflowId,
          paths: [projectRelativePath(file, cwd)],
          reason: `Node card ${nodeId} is not present in graph.json.`,
          reason_zh: `节点卡 ${nodeId} 不存在于 graph.json。`,
        }));
      }
    }
    for (const file of filesInDir(path.join(workflowDir, "context-packs"), (name) => name.endsWith(".json"))) {
      const nodeId = path.basename(file, ".json");
      if (!nodeIds.has(nodeId)) {
        candidates.push(cleanupCandidate({
          id: `${workflowId}:orphan-context-pack:${nodeId}`,
          kind: "orphan_context_pack",
          workflow_id: workflowId,
          paths: [projectRelativePath(file, cwd)],
          reason: `Context pack ${nodeId} is not present in graph.json.`,
          reason_zh: `上下文包 ${nodeId} 不存在于 graph.json。`,
        }));
      }
    }
  }
  return candidates;
}

function inspectWorkflowHealth(workflowDir, cwd = process.cwd()) {
  const workflowId = path.basename(workflowDir);
  const relativePath = projectRelativePath(workflowDir, cwd);
  const issues = [];
  const cleanupCandidates = [];
  const graphPath = path.join(workflowDir, "graph.json");
  const statePath = path.join(workflowDir, "state.json");
  const graphRead = fs.existsSync(graphPath) ? safeReadJsonForDoctor(graphPath) : { ok: false, error: "missing graph.json" };
  const stateRead = fs.existsSync(statePath) ? safeReadJsonForDoctor(statePath) : { ok: false, error: "missing state.json" };
  if (!graphRead.ok || !stateRead.ok) {
    const paths = [workflowDir].map((file) => projectRelativePath(file, cwd));
    cleanupCandidates.push(cleanupCandidate({
      id: `${workflowId}:invalid-workflow-dir`,
      kind: "invalid_workflow_dir",
      workflow_id: workflowId,
      paths,
      reason: `Workflow directory cannot be loaded (${graphRead.error || stateRead.error}).`,
      reason_zh: `工作流目录无法加载（${graphRead.error || stateRead.error}）。`,
    }));
    issues.push(doctorIssue({
      id: "invalid_workflow_dir",
      severity: "error",
      scope: "workflow",
      workflow_id: workflowId,
      path: relativePath,
      summary: "Workflow directory is not loadable.",
      detail: graphRead.error || stateRead.error,
      next_action: "Archive after review or restore graph.json/state.json from history.",
    }));
    return {
      workflow_id: workflowId,
      path: relativePath,
      valid: false,
      status_counts: {},
      needs_upgrade: false,
      issues,
      cleanup_candidates: cleanupCandidates,
    };
  }

  const graph = graphRead.value;
  const state = stateRead.value;
  const id = graph.workflow_id || workflowId;
  const validateErrors = validateWorkflow(workflowDir);
  for (const error of validateErrors) {
    issues.push(doctorIssue({
      id: "workflow_validation_error",
      severity: "error",
      scope: "workflow",
      workflow_id: id,
      path: relativePath,
      summary: "Workflow validation failed.",
      detail: error,
      next_action: "Run validate after repairing the listed file.",
    }));
  }

  const upgradeReasons = workflowNeedsCompatibilityUpgrade(workflowDir, graph, state);
  const evidenceOnlyGaps = upgradeReasons.filter((reason) => /lacks readable handoff/.test(reason));
  const compatibilityReasons = upgradeReasons.filter((reason) => !/lacks readable handoff/.test(reason));
  if (compatibilityReasons.length > 0) {
    issues.push(doctorIssue({
      id: "workflow_compatibility_upgrade_needed",
      severity: "warning",
      scope: "workflow",
      workflow_id: id,
      path: relativePath,
      summary: "Workflow artifacts need the current controller compatibility surface.",
      detail: compatibilityReasons.join("; "),
      fixable: true,
      next_action: "Run doctor --fix or upgrade --all.",
    }));
  }
  for (const gap of evidenceOnlyGaps) {
    issues.push(doctorIssue({
      id: "terminal_node_missing_handoff",
      severity: "error",
      scope: "workflow",
      workflow_id: id,
      path: relativePath,
      summary: "Terminal node is missing readable handoff evidence.",
      detail: gap,
      next_action: "Recover the handoff from history or reject/re-run the affected node.",
    }));
  }

  const board = boardProjectionStatus(workflowDir);
  if (board.missing.length > 0) {
    issues.push(doctorIssue({
      id: "board_projection_missing",
      severity: "info",
      scope: "workflow",
      workflow_id: id,
      path: relativePath,
      summary: "Board projection has not been generated.",
      detail: board.missing.join(", "),
      next_action: "Run board --open when visualization is needed.",
    }));
  } else if (board.stale) {
    issues.push(doctorIssue({
      id: "board_projection_stale",
      severity: "warning",
      scope: "workflow",
      workflow_id: id,
      path: relativePath,
      summary: "Board projection is older than workflow source files.",
      detail: "Regenerate board.html/board.json before using the board for review.",
      next_action: "Run board --open.",
    }));
  }

  const commandProjection = buildCommandRunProjection(readCommandRuns(workflowDir));
  for (const command of commandProjection.active) {
    issues.push(doctorIssue({
      id: "active_command_run",
      severity: command.resume_command || command.log_path ? "warning" : "error",
      scope: "workflow",
      workflow_id: id,
      path: relativePath,
      summary: "Workflow has an active command run record.",
      detail: `${command.run_id || "unknown"}: ${command.command || "unknown command"}`,
      next_action: command.resume_command || command.log_path
        ? "Inspect the log or resume command before continuing."
        : "Record a log path or resume command so interruption recovery is possible.",
    }));
  }

  cleanupCandidates.push(...collectWorkflowCleanupCandidates(workflowDir, cwd, graph, state, validateErrors, commandProjection.active));
  if (cleanupCandidates.some((candidate) => candidate.kind === "completed_legacy_workflow")) {
    issues.push(doctorIssue({
      id: "completed_legacy_workflow_archive_candidate",
      severity: "warning",
      scope: "workflow",
      workflow_id: id,
      path: relativePath,
      summary: "Completed legacy workflow should be archived instead of repaired with invented evidence.",
      detail: "All nodes are terminal, but old handoff artifacts do not satisfy the current evidence schema.",
      next_action: "Run cleanup --dry-run, then cleanup --apply after review.",
    }));
  }
  return {
    workflow_id: id,
    path: relativePath,
    template_id: graph.metadata?.template_id || null,
    artifact_version: graph.metadata?.workflow_artifact_version || null,
    valid: validateErrors.length === 0,
    status_counts: workflowStatusSummary(graph, state),
    needs_upgrade: compatibilityReasons.length > 0,
    board: {
      missing: board.missing,
      stale: board.stale,
    },
    issues,
    cleanup_candidates: cleanupCandidates,
  };
}

function projectWorkflowHealth(cwd = process.cwd(), options = {}) {
  const language = normalizeBoardLanguage(options.lang);
  const root = workflowsRoot(cwd);
  const namespace = omyKitNamespaceStatus(cwd);
  const localGitIgnore = inspectLocalGitIgnore(cwd);
  const rootArtifactConflicts = rootWorkflowArtifactConflicts(cwd);
  const gitRemovalPlan = buildGitRemovalPlan(cwd);
  const allDirs = options.workflow
    ? [path.join(root, String(options.workflow))]
    : listAllWorkflowDirs(root);
  const validDirs = listWorkflowDirs(root);
  const activeId = readActiveWorkflowId(cwd);
  const taskInbox = readTaskInbox(cwd);
  const issues = [];
  const cleanupCandidates = [];
  const project = {
    root: cwd,
    omykit_root: projectRelativePath(omykitRoot(cwd), cwd),
    has_omykit_root: fs.existsSync(omykitRoot(cwd)),
    omykit_namespace: {
      exists: namespace.exists,
      is_directory: namespace.is_directory,
      conflict: namespace.conflict,
      path: projectRelativePath(namespace.path, cwd),
    },
    has_workflows_root: fs.existsSync(root),
    active_workflow: activeId,
    active_workflow_valid: activeId ? fs.existsSync(path.join(root, activeId, "graph.json")) : null,
    local_git_ignore: localGitIgnore,
    remote_hygiene: {
      runtime_state_policy: "local_only",
      default_ignore_surface: ".git/info/exclude",
      runtime_dir: `${OMYKIT_RUNTIME_DIR}/`,
      tracked_project_files_required: false,
      actual_ignore_active: localGitIgnore.active,
      tracked_runtime_files: gitRemovalPlan.tracked_runtime_files,
      tracked_legacy_artifact_files: gitRemovalPlan.tracked_legacy_artifact_files,
      history: gitRemovalPlan.history,
    },
    root_artifact_name_conflicts: rootArtifactConflicts,
    has_agents_md: fs.existsSync(path.join(cwd, "AGENTS.md")),
    has_readme: fs.existsSync(path.join(cwd, "README.md")),
    has_project_profile: fs.existsSync(path.join(cwd, "docs", "workflow", "project-profile.md")),
    task_inbox: taskInboxSummary(taskInbox.tasks),
    task_inbox_invalid_lines: taskInbox.invalid,
    repo_local_skill_dirs: [".codex/skills", ".agents/skills"]
      .filter((relative) => fs.existsSync(path.join(cwd, relative))),
  };

  if (namespace.conflict) {
    issues.push(doctorIssue({
      id: "omykit_namespace_conflict",
      severity: "error",
      scope: "project",
      path: OMYKIT_RUNTIME_DIR,
      summary: ".omykit exists but is not a directory.",
      detail: "omyKit will not overwrite user-owned files. Move or rename this path before creating workflow state.",
      next_action: `Move or rename ${OMYKIT_RUNTIME_DIR}, then rerun init or doctor.`,
    }));
  }
  if (namespace.is_directory && localGitIgnore.git_repo && !localGitIgnore.active) {
    issues.push(doctorIssue({
      id: "local_runtime_ignore_missing",
      severity: "warning",
      scope: "project",
      path: localGitIgnore.path,
      summary: ".omykit runtime state is not ignored by local Git exclude.",
      detail: "Workflow state is local runtime data and should not be submitted unless the user explicitly asks to vendor it.",
      fixable: true,
      next_action: "Run doctor --fix to add .omykit/ to .git/info/exclude.",
    }));
  }
  if (gitRemovalPlan.tracked_runtime_files.length > 0) {
    issues.push(doctorIssue({
      id: "tracked_runtime_state",
      severity: "warning",
      scope: "project",
      path: OMYKIT_RUNTIME_DIR,
      summary: ".omykit runtime state is tracked by Git.",
      detail: "Local ignore prevents future accidental adds, but already tracked files require an explicit Git index removal and commit.",
      fixable: false,
      next_action: "Run cleanup --git-removal-plan, then choose cleanup --untrack-runtime --apply or cleanup --reset-runtime --apply.",
    }));
  }
  if (rootArtifactConflicts.length > 0) {
    issues.push(doctorIssue({
      id: "root_workflow_artifact_name_conflict",
      severity: "warning",
      scope: "project",
      path: rootArtifactConflicts.join(", "),
      summary: "Project root contains names that look like legacy workflow artifacts.",
      detail: "omyKit keeps runtime files under .omykit/ to avoid these names; doctor will not move or delete possible user files automatically.",
      next_action: "Review these files manually. Keep real project files in place; move only confirmed legacy workflow artifacts into .omykit or archive them.",
    }));
  }
  if (gitRemovalPlan.tracked_legacy_artifact_files.length > 0) {
    issues.push(doctorIssue({
      id: "tracked_root_workflow_artifact",
      severity: "warning",
      scope: "project",
      path: gitRemovalPlan.tracked_legacy_artifact_files.join(", "),
      summary: "Root-level legacy-looking workflow artifacts are tracked by Git.",
      detail: "These names may be real project files. omyKit reports them but does not remove them automatically.",
      fixable: false,
      next_action: "Review cleanup --git-removal-plan. Remove only confirmed legacy workflow artifacts with normal Git review.",
    }));
  }
  if (!project.has_omykit_root) {
    issues.push(doctorIssue({
      id: "missing_omykit_root",
      severity: "warning",
      scope: "project",
      path: ".omykit",
      summary: "Project has no .omykit directory.",
      next_action: "Run init, retrofit, or start a tracked workflow if this project should use omyKit.",
    }));
  }
  if (!project.has_workflows_root) {
    issues.push(doctorIssue({
      id: "missing_workflows_root",
      severity: "info",
      scope: "project",
      path: ".omykit/workflows",
      summary: "No tracked workflow directory exists.",
      next_action: "Create a tracked workflow only when the task needs resumable state.",
    }));
  }
  if (activeId && !project.active_workflow_valid) {
    issues.push(doctorIssue({
      id: "active_workflow_missing",
      severity: "warning",
      scope: "project",
      path: ".omykit/active-workflow",
      summary: `Active workflow points to missing workflow '${activeId}'.`,
      fixable: validDirs.length === 1,
      next_action: validDirs.length === 1
        ? `Run doctor --fix to point active workflow to ${path.basename(validDirs[0])}.`
        : "Run workflows and choose the active workflow explicitly.",
    }));
  }
  if (!project.has_project_profile) {
    issues.push(doctorIssue({
      id: "missing_project_profile",
      severity: "warning",
      scope: "project",
      path: "docs/workflow/project-profile.md",
      summary: "Retrofit profile is missing, so old-project workflow readiness is hard to audit.",
      next_action: "Run $omykit 改造旧项目 or create docs/workflow/project-profile.md from existing project facts.",
    }));
  }
  if (project.repo_local_skill_dirs.length > 0) {
    issues.push(doctorIssue({
      id: "repo_local_skill_copy_present",
      severity: "info",
      scope: "project",
      path: project.repo_local_skill_dirs.join(", "),
      summary: "Repo-local skill directories exist.",
      detail: "Keep them only when the project intentionally vendors skills for team or CI use; otherwise prefer global omyKit.",
      next_action: "Compare repo-local skills with global install before relying on them.",
    }));
  }
  if (taskInbox.invalid.length > 0) {
    issues.push(doctorIssue({
      id: "task_inbox_invalid_jsonl",
      severity: "warning",
      scope: "project",
      path: projectRelativePath(taskInbox.file, cwd),
      summary: "Task inbox contains invalid JSONL records.",
      detail: taskInbox.invalid.map((item) => `line ${item.line}: ${item.error}`).join("; "),
      next_action: "Repair the invalid JSONL line or archive the broken task inbox before relying on merge decisions.",
    }));
  }

  const workflows = allDirs.map((dir) => {
    if (!fs.existsSync(dir)) {
      const id = path.basename(dir);
      return {
        workflow_id: id,
        path: projectRelativePath(dir, cwd),
        valid: false,
        status_counts: {},
        needs_upgrade: false,
        issues: [doctorIssue({
          id: "requested_workflow_missing",
          severity: "error",
          scope: "workflow",
          workflow_id: id,
          path: projectRelativePath(dir, cwd),
          summary: "Requested workflow does not exist.",
          next_action: "Use workflows list or pass a valid --workflow id.",
        })],
        cleanup_candidates: [],
      };
    }
    return inspectWorkflowHealth(dir, cwd);
  });

  for (const workflow of workflows) {
    issues.push(...workflow.issues);
    cleanupCandidates.push(...workflow.cleanup_candidates);
  }

  const severityCounts = issues.reduce((counts, issue) => {
    counts[issue.severity] = (counts[issue.severity] || 0) + 1;
    return counts;
  }, {});
  const health = severityCounts.error > 0 ? "fail" : severityCounts.warning > 0 ? "warning" : "pass";
  const recommendations = buildDoctorRecommendations({ health, issues, workflows, cleanupCandidates, validWorkflowCount: validDirs.length, language });
  return {
    schema_version: SCHEMA_VERSION,
    artifact_version: WORKFLOW_ARTIFACT_VERSION,
    checked_at: now(),
    language,
    health,
    project,
    counts: {
      workflows_total: workflows.length,
      workflows_valid: workflows.filter((workflow) => workflow.valid).length,
      workflows_needing_upgrade: workflows.filter((workflow) => workflow.needs_upgrade).length,
      cleanup_candidates: cleanupCandidates.length,
      issues: severityCounts,
    },
    workflows,
    issues,
    cleanup_candidates: cleanupCandidates,
    recommendations,
  };
}

function buildDoctorRecommendations({ issues, workflows, cleanupCandidates, validWorkflowCount, language }) {
  const isZh = language === "zh-CN";
  const recommendations = [];
  const has = (id) => issues.some((issue) => issue.id === id);
  if (has("workflow_compatibility_upgrade_needed")) {
    recommendations.push(isZh ? "运行 doctor --fix 或 upgrade --all 补齐旧 workflow 的兼容元数据、运行目录和节点卡。" : "Run doctor --fix or upgrade --all to repair legacy workflow compatibility metadata, runtime directories, and node cards.");
  }
  if (has("active_workflow_missing")) {
    recommendations.push(validWorkflowCount === 1
      ? (isZh ? "运行 doctor --fix 自动修正 active workflow 指针。" : "Run doctor --fix to repair the active workflow pointer.")
      : (isZh ? "先运行 workflows 选择正确 workflow，再执行 workflows use <id>。" : "Run workflows, choose the correct workflow, then run workflows use <id>."));
  }
  if (has("local_runtime_ignore_missing")) {
    recommendations.push(isZh ? "运行 doctor --fix 把 .omykit/ 写入本地 .git/info/exclude，避免 workflow 运行态进入远程提交。" : "Run doctor --fix to add .omykit/ to local .git/info/exclude so workflow runtime state stays out of remote commits.");
  }
  if (has("tracked_runtime_state")) {
    recommendations.push(isZh ? "运行 cleanup --git-removal-plan 查看已跟踪 runtime，再按需用 cleanup --untrack-runtime --apply 保留本地状态并撤出 Git，或 cleanup --reset-runtime --apply 归档并重置本地状态。" : "Run cleanup --git-removal-plan, then use cleanup --untrack-runtime --apply to keep local state out of Git or cleanup --reset-runtime --apply to archive and reset local state.");
  }
  if (has("tracked_root_workflow_artifact")) {
    recommendations.push(isZh ? "根目录已跟踪的旧 workflow 名称必须人工确认后再从 Git 移除；omyKit 不会自动删除可能属于项目本体的文件。" : "Review tracked root-level legacy workflow names manually before removing them from Git; omyKit will not auto-delete possible project files.");
  }
  if (has("omykit_namespace_conflict")) {
    recommendations.push(isZh ? "先移动或重命名已有 .omykit 文件；omyKit 不会覆盖用户文件。" : "Move or rename the existing .omykit file first; omyKit will not overwrite user-owned files.");
  }
  if (has("root_workflow_artifact_name_conflict")) {
    recommendations.push(isZh ? "根目录疑似旧 workflow 文件只提示不自动处理，避免误删项目本体文件；确认后再手动迁移或归档。" : "Root-level legacy-looking workflow files are reported but not moved automatically, to avoid touching real project files.");
  }
  if (has("terminal_node_missing_handoff")) {
    recommendations.push(isZh ? "不要让升级伪造证据；从历史恢复 handoff，或 reject/re-run 缺证据节点。" : "Do not fabricate evidence during upgrade; recover handoffs from history or reject/re-run nodes with missing evidence.");
  }
  if (has("completed_legacy_workflow_archive_candidate")) {
    recommendations.push(isZh ? "已完结但旧证据 schema 不合规的历史 workflow 应归档到 .omykit/archive/，不要补造缺失字段。" : "Archive completed legacy workflows with obsolete evidence schemas under .omykit/archive/ instead of inventing missing fields.");
  }
  if (has("missing_project_profile")) {
    recommendations.push(isZh ? "补齐 docs/workflow/project-profile.md，让旧项目改造有明确项目现状、命令、门禁和遗留问题。" : "Add docs/workflow/project-profile.md so retrofit state, commands, gates, and legacy issues are auditable.");
  }
  if (cleanupCandidates.length > 0) {
    recommendations.push(isZh ? "先运行 cleanup --dry-run 审查候选，再按需运行 cleanup --apply 归档，不直接删除。" : "Run cleanup --dry-run first, then cleanup --apply only when archiving candidates is acceptable. It archives, not deletes.");
  }
  if (workflows.some((workflow) => workflow.board?.stale || workflow.board?.missing?.length)) {
    recommendations.push(isZh ? "需要看板时重新运行 board --open，避免用过期 board 做判断。" : "Regenerate the board with board --open before relying on it for review.");
  }
  if (recommendations.length === 0) {
    recommendations.push(isZh ? "当前未发现阻塞性工作流健康问题；继续按当前 workflow 推进。" : "No blocking workflow health issue found; continue with the current workflow.");
  }
  return recommendations;
}

function writeHealthReport(report, cwd = process.cwd()) {
  const namespace = omyKitNamespaceStatus(cwd);
  if (namespace.conflict) return null;
  const file = healthReportFile(cwd);
  writeJson(file, report);
  return file;
}

function applyDoctorFixes(initialReport, cwd = process.cwd()) {
  const actions = [];
  const root = workflowsRoot(cwd);
  const validDirs = listWorkflowDirs(root);
  if (initialReport.issues.some((issue) => issue.id === "active_workflow_missing" && issue.fixable) && validDirs.length === 1) {
    const workflowId = path.basename(validDirs[0]);
    writeActiveWorkflowId(workflowId, cwd);
    actions.push(`set active workflow to ${workflowId}`);
  }
  if (initialReport.issues.some((issue) => issue.id === "local_runtime_ignore_missing" && issue.fixable)) {
    const result = ensureLocalGitIgnore(cwd);
    actions.push(`local git ignore ${result.status}: ${result.path || "not-git"}`);
  }
  for (const workflow of initialReport.workflows) {
    if (!workflow.needs_upgrade) continue;
    const workflowDir = path.join(root, workflow.workflow_id);
    if (!fs.existsSync(path.join(workflowDir, "graph.json")) || !fs.existsSync(path.join(workflowDir, "state.json"))) continue;
    const { report } = upgradeWorkflowArtifacts(workflowDir, { recordLedger: true });
    actions.push(`upgraded ${report.workflow_id}: actions=${report.actions.length} warnings=${report.warnings.length}`);
  }
  return actions;
}

function printDoctorReport(report, reportFile = null) {
  const isZh = report.language === "zh-CN";
  const counts = report.counts.issues || {};
  console.log(`${isZh ? "工作流健康检查" : "Workflow health"}: ${report.health}`);
  console.log(`${isZh ? "项目" : "Project"}: ${projectRelativePath(report.project.root, report.project.root)}`);
  console.log(`${isZh ? "工作流" : "Workflows"}: total=${report.counts.workflows_total} valid=${report.counts.workflows_valid} needs_upgrade=${report.counts.workflows_needing_upgrade}`);
  console.log(`${isZh ? "问题" : "Issues"}: error=${counts.error || 0} warning=${counts.warning || 0} info=${counts.info || 0}`);
  for (const issue of report.issues.slice(0, 12)) {
    const workflow = issue.workflow_id ? ` ${issue.workflow_id}` : "";
    console.log(`- [${issue.severity}]${workflow} ${issue.id}: ${issue.summary}${issue.detail ? ` (${issue.detail})` : ""}`);
  }
  if (report.issues.length > 12) {
    console.log(isZh ? `... 另有 ${report.issues.length - 12} 个问题，详见报告。` : `... ${report.issues.length - 12} more issues in the report.`);
  }
  console.log(`${isZh ? "清理候选" : "Cleanup candidates"}: ${report.cleanup_candidates.length}`);
  console.log(isZh ? "下一步建议:" : "Next recommendations:");
  for (const item of report.recommendations) console.log(`- ${item}`);
  if (reportFile) console.log(`${isZh ? "报告" : "Report"}: ${path.relative(process.cwd(), reportFile)}`);
}

function timestampForArchive() {
  return now().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function uniqueArchivePath(destination) {
  if (!fs.existsSync(destination)) return destination;
  const parsed = path.parse(destination);
  for (let index = 1; index < 1000; index += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    if (!fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Could not find unique archive path for ${destination}`);
}

function archiveCleanupCandidates(candidates, cwd = process.cwd()) {
  const stamp = timestampForArchive();
  const archiveBase = path.join(archiveRoot(cwd), stamp);
  const actions = [];
  const cwdResolved = path.resolve(cwd);
  for (const candidate of candidates) {
    for (const relativePath of candidate.paths || []) {
      const source = path.resolve(cwd, relativePath);
      if (!source.startsWith(`${cwdResolved}${path.sep}`)) {
        actions.push({ candidate_id: candidate.id, path: relativePath, status: "skipped", reason: "path is outside project root" });
        continue;
      }
      if (!fs.existsSync(source)) {
        actions.push({ candidate_id: candidate.id, path: relativePath, status: "skipped", reason: "path no longer exists" });
        continue;
      }
      const destination = uniqueArchivePath(path.join(archiveBase, relativePath));
      ensureDir(path.dirname(destination));
      fs.renameSync(source, destination);
      actions.push({
        candidate_id: candidate.id,
        path: relativePath,
        status: "archived",
        archive_path: projectRelativePath(destination, cwd),
      });
    }
  }
  return { archive_dir: projectRelativePath(archiveBase, cwd), actions };
}

function printCleanupPlan(report, result = null) {
  const isZh = report.language === "zh-CN";
  const candidates = report.cleanup_candidates || [];
  console.log(`${isZh ? "清理计划" : "Cleanup plan"}: ${candidates.length} ${isZh ? "个候选" : "candidates"}`);
  for (const candidate of candidates.slice(0, 20)) {
    console.log(`- ${candidate.kind}: ${candidate.paths.join(", ")} (${cleanupReasonForDisplay(candidate, report.language)})`);
  }
  if (candidates.length > 20) {
    console.log(isZh ? `... 另有 ${candidates.length - 20} 个候选，详见报告。` : `... ${candidates.length - 20} more candidates in the report.`);
  }
  if (result) {
    console.log(`${isZh ? "归档目录" : "Archive"}: ${result.archive_dir}`);
    const archived = result.actions.filter((action) => action.status === "archived").length;
    const skipped = result.actions.filter((action) => action.status === "skipped").length;
    console.log(`${isZh ? "结果" : "Result"}: archived=${archived} skipped=${skipped}`);
  } else {
    console.log(isZh ? "默认只 dry-run。确认后再运行 cleanup --apply，文件会归档到 .omykit/archive/，不会直接删除。" : "Default is dry-run. Run cleanup --apply after review; files are archived under .omykit/archive/ and are not deleted.");
  }
}

function cmdInit(positional, options) {
  assertOmyKitNamespaceAvailable(process.cwd());
  const title = positional.join(" ").trim();
  if (!title) throw new Error("init requires a workflow title");
  const ignoreResult = ensureLocalGitIgnore(process.cwd());

  const requestedTemplateId = options.template ? String(options.template) : AUTO_TEMPLATE_ID;
  const templateId = resolveInitTemplateId(title, requestedTemplateId);
  const template = loadWorkflowTemplate(templateId);
  const mode = options.mode ? String(options.mode) : template.default_mode || DEFAULT_MODE;
  if (!MODES.has(mode)) throw new Error(`--mode must be one of ${[...MODES].join(", ")}`);
  const language = options.lang ? normalizeBoardLanguage(options.lang) : inferLanguageFromText(title);

  const workflowId = options.id ? slugify(options.id) : `${dateStamp()}-${slugify(title)}`;
  const workflowDir = path.join(workflowsRoot(), workflowId);
  if (fs.existsSync(workflowDir)) throw new Error(`Workflow already exists: ${workflowId}`);

  const templateErrors = validateWorkflowTemplate(template);
  if (templateErrors.length > 0) throw new Error(templateErrors.join("\n"));
  const templateMetadata = templateId === "deck.proposal" ? { deck_variant: inferDeckVariant(title) } : {};
  const graph = compileTemplateToGraph(template, {
    templateId,
    workflowId,
    title,
    mode,
    language,
    metadata: templateMetadata,
  });
  const graphErrors = validateGraph(graph);
  if (graphErrors.length > 0) throw new Error(graphErrors.join("\n"));

  ensureDir(path.join(workflowDir, "nodes"));
  ensureDir(path.join(workflowDir, "handoffs"));
  ensureDir(path.join(workflowDir, "context-packs"));
  ensureDir(path.join(workflowDir, "commands"));
  ensureDir(path.join(workflowDir, "evidence", "screenshots"));
  writeJson(path.join(workflowDir, "graph.json"), graph);
  writeJson(path.join(workflowDir, "state.json"), initialState(graph));
  for (const node of graph.nodes) writeJson(path.join(workflowDir, "nodes", `${node.id}.json`), nodeCard(graph, node));
  fs.writeFileSync(path.join(workflowDir, "decisions.md"), `# Decisions\n\nWorkflow: ${workflowId}\n\n`);
  fs.writeFileSync(path.join(workflowDir, "blockers.md"), `# Blockers\n\nWorkflow: ${workflowId}\n\n`);
  appendLedger(workflowDir, { event: "workflow.init", workflow_id: workflowId, title, mode, template_id: templateId, requested_template_id: requestedTemplateId, language, ...templateMetadata });
  const linkedTask = linkPendingTaskToWorkflow(process.cwd(), graph);
  if (linkedTask) {
    appendLedger(workflowDir, {
      event: "task.linked",
      workflow_id: workflowId,
      task_id: linkedTask.task_id,
      decision: linkedTask.decision,
      relation: linkedTask.relation,
      template_id: linkedTask.template_id,
      deck_variant: linkedTask.deck_variant || null,
      link_reason: linkedTask.link_reason,
    });
  }
  writeActiveWorkflowId(workflowId);

  const { graph: savedGraph, state } = loadWorkflow(workflowDir);
  console.log(`Workflow created: ${workflowId}`);
  console.log(`Path: ${path.relative(process.cwd(), workflowDir)}`);
  console.log(`Template: ${templateId}${requestedTemplateId === AUTO_TEMPLATE_ID ? " (auto)" : ""}`);
  if (ignoreResult.status === "added") console.log(`Local ignore: ${ignoreResult.path}`);
  printStatus(savedGraph, state);
  const board = buildBoardProjection(workflowDir, savedGraph, state, language);
  const plan = buildOrchestrationPlan(board, buildDispatchPlan(board, { surface: "auto" }));
  const planFile = writeOrchestrationPlan(workflowDir, plan);
  printOrchestrationPlan(plan, planFile);
}

function printTaskRecord(record) {
  const isZh = record.language === "zh-CN";
  console.log(`${isZh ? "任务已登记" : "Task recorded"}: ${record.task_id}`);
  console.log(`${isZh ? "决策" : "Decision"}: ${record.decision}`);
  console.log(`${isZh ? "关系" : "Relation"}: ${record.relation}`);
  console.log(`${isZh ? "模板" : "Template"}: ${record.template_id}`);
  console.log(`${isZh ? "关联工作流" : "Linked workflow"}: ${record.linked_workflow_id || (isZh ? "无" : "none")}`);
  console.log(`${isZh ? "写入范围" : "Write scope"}: ${record.suggested_write_scope.join(", ")}`);
  console.log(`${isZh ? "冲突风险" : "Conflict risk"}: ${record.conflict_risk}`);
}

function printTaskInbox(projection, language = "en") {
  const isZh = language === "zh-CN";
  console.log(`${isZh ? "任务收件箱" : "Task inbox"}: ${projection.summary.total}`);
  console.log(`${isZh ? "打开任务" : "Open tasks"}: ${projection.summary.open}`);
  console.log(`${isZh ? "工作流组" : "Workstreams"}: ${projection.workstreams.length}`);
  console.log(`${isZh ? "冲突" : "Conflicts"}: ${projection.conflicts.length}`);
  for (const task of projection.tasks) {
    console.log(`- ${task.task_id}: ${task.decision} ${task.relation} ${task.template_id} ${task.linked_workflow_id || "-"} :: ${task.brief}`);
  }
}

function cmdTasks(positional, options) {
  const action = positional[0] || "list";
  const language = options.lang ? normalizeBoardLanguage(options.lang) : "en";
  if (action === "add") {
    const brief = positional.slice(1).join(" ").trim();
    if (!brief) throw new Error("tasks add requires a task brief");
    const record = createTaskRecord(brief, options);
    appendTaskRecord(record);
    if (record.linked_workflow_id) {
      const workflowDir = path.join(workflowsRoot(), record.linked_workflow_id);
      if (fs.existsSync(workflowDir)) {
        appendLedger(workflowDir, {
          event: "task.add",
          task_id: record.task_id,
          decision: record.decision,
          relation: record.relation,
          conflict_risk: record.conflict_risk,
          suggested_write_scope: record.suggested_write_scope,
        });
      }
    }
    if (options.json) {
      console.log(JSON.stringify(record, null, 2));
      return;
    }
    printTaskRecord(record);
    return;
  }
  if (action === "list") {
    const projection = buildTaskInboxProjection(process.cwd());
    if (options.json) {
      console.log(JSON.stringify(projection, null, 2));
      return;
    }
    printTaskInbox(projection, language);
    return;
  }
  throw new Error(`Unknown tasks action: ${action}`);
}

function cmdStatus(options) {
  const { graph, state } = loadWorkflow(resolveWorkflowDir(options));
  printStatus(graph, state);
}

function cmdNext(options) {
  cmdOrchestrate(options);
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

function cmdWorkflows(positional) {
  const action = positional[0] || "list";
  const root = workflowsRoot();
  if (action === "use") {
    const workflowId = positional[1];
    if (!workflowId) throw new Error("workflows use requires a workflow id");
    const workflowDir = path.join(root, workflowId);
    if (!fs.existsSync(path.join(workflowDir, "graph.json"))) throw new Error(`Cannot find workflow: ${workflowId}`);
    writeActiveWorkflowId(workflowId);
    console.log(`Active workflow set: ${workflowId}`);
    return;
  }
  if (action !== "list") throw new Error(`Unknown workflows action: ${action}`);
  const activeId = readActiveWorkflowId();
  const dirs = listWorkflowDirs(root);
  if (dirs.length === 0) {
    console.log("No omyKit workflows found.");
    return;
  }
  for (const dir of dirs) {
    const graph = readJson(path.join(dir, "graph.json"));
    const state = readJson(path.join(dir, "state.json"));
    const id = graph.workflow_id || path.basename(dir);
    const active = id === activeId ? "*" : " ";
    const counts = statusCounts(graph.nodes.map((node) => ({ status: state.nodes[node.id]?.status || "missing" })));
    const marker = id === activeId ? "active" : "inactive";
    console.log(`${active} ${id} [${marker}] ${graph.mode} ready=${counts.ready || 0} running=${counts.running || 0} blocked=${counts.blocked || 0} failed=${counts.failed || 0} passed=${counts.passed || 0}`);
  }
}

function cmdScorecard(options) {
  const workflowDir = resolveWorkflowDir(options);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const { graph, state } = loadWorkflow(workflowDir);
  const language = resolveWorkflowLanguage(options, graph, loadHandoffs(workflowDir));
  const board = buildBoardProjection(workflowDir, graph, state, language);
  if (options.json) {
    console.log(JSON.stringify({
      workflow_id: board.workflow_id,
      language: board.language,
      scorecard: board.scorecard,
    }, null, 2));
    return;
  }
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

function cmdDispatchPlan(options) {
  const workflowDir = resolveWorkflowDir(options);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const { graph, state } = loadWorkflow(workflowDir);
  const language = resolveWorkflowLanguage(options, graph, loadHandoffs(workflowDir));
  const board = buildBoardProjection(workflowDir, graph, state, language);
  const requestedSurface = normalizeDispatchSurfaceOption(options.surface);
  if (options.surface && !["auto", ...EXECUTION_SURFACES].includes(requestedSurface)) {
    throw new Error(`--surface must be one of auto, ${[...EXECUTION_SURFACES].join(", ")}`);
  }
  const plan = buildDispatchPlan(board, { surface: requestedSurface });
  if (options.json) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }
  printDispatchPlan(plan);
}

function cmdOrchestrate(options) {
  const workflowDir = resolveWorkflowDir(options);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const { graph, state } = loadWorkflow(workflowDir);
  const language = resolveWorkflowLanguage(options, graph, loadHandoffs(workflowDir));
  const board = buildBoardProjection(workflowDir, graph, state, language);
  const dispatchPlan = buildDispatchPlan(board, { surface: "auto" });
  const plan = buildOrchestrationPlan(board, dispatchPlan);
  const planFile = writeOrchestrationPlan(workflowDir, plan);
  if (options.json) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }
  printOrchestrationPlan(plan, planFile);
}

function cmdUpgrade(options) {
  const root = workflowsRoot();
  const workflowDirs = options.all ? listWorkflowDirs(root) : [resolveWorkflowDir(options)];
  if (workflowDirs.length === 0) throw new Error("No omyKit workflows found.");
  const results = workflowDirs.map((workflowDir) => upgradeWorkflowArtifacts(workflowDir));
  if (options.json) {
    console.log(JSON.stringify(results.map(({ report, reportFile }) => ({
      ...report,
      report_file: path.relative(process.cwd(), reportFile),
    })), null, 2));
    return;
  }
  const language = normalizeBoardLanguage(options.lang);
  const isZh = language === "zh-CN";
  console.log(`${isZh ? "工作流升级完成" : "Workflow upgrade complete"}: ${results.length}`);
  for (const { report, reportFile } of results) {
    console.log(`- ${report.workflow_id} artifact=${report.artifact_version} actions=${report.actions.length} warnings=${report.warnings.length} report=${path.relative(process.cwd(), reportFile)}`);
  }
  console.log(isZh
    ? "说明: 升级只补 controller 兼容元数据、目录、节点卡和报告；不会伪造 handoff、token、skill、模型或验证证据。旧 board 可以重新运行 board 命令生成新版投影。"
    : "Note: upgrade only adds controller compatibility metadata, directories, node cards, and reports. It never fabricates handoffs, token usage, skill usage, models, or verification evidence. Regenerate old boards with the board command.");
}

function cmdDoctor(options) {
  const language = normalizeBoardLanguage(options.lang);
  let fixActions = [];
  if (options.fix) {
    const initialReport = projectWorkflowHealth(process.cwd(), { ...options, lang: language });
    fixActions = applyDoctorFixes(initialReport, process.cwd());
  }
  const report = projectWorkflowHealth(process.cwd(), { ...options, lang: language });
  if (fixActions.length > 0) {
    report.fix = {
      applied: true,
      actions: fixActions,
    };
  }
  const reportFile = writeHealthReport(report);
  if (options.json) {
    console.log(JSON.stringify({
      ...report,
      report_file: reportFile ? path.relative(process.cwd(), reportFile) : null,
    }, null, 2));
    return;
  }
  printDoctorReport(report, reportFile);
  if (fixActions.length > 0) {
    const isZh = language === "zh-CN";
    console.log(isZh ? "已应用修复:" : "Applied fixes:");
    for (const action of fixActions) console.log(`- ${action}`);
  }
}

function cmdCleanup(options) {
  const language = normalizeBoardLanguage(options.lang);
  const report = projectWorkflowHealth(process.cwd(), { ...options, lang: language });
  let result = null;
  if (options["git-removal-plan"]) {
    report.cleanup = {
      applied: false,
      mode: "git-removal-plan",
      ...buildGitRemovalPlan(process.cwd()),
    };
  } else if (options["untrack-runtime"]) {
    const plan = buildGitRemovalPlan(process.cwd());
    if (options.apply) {
      result = untrackGitPaths(process.cwd(), [OMYKIT_RUNTIME_DIR]);
      report.cleanup = {
        applied: result.applied,
        mode: "untrack-runtime",
        status: result.status,
        tracked_runtime_files: plan.tracked_runtime_files,
        actions: result.actions,
        error: result.error || null,
        next_action: result.status === "untracked_from_index"
          ? "Commit the staged removals after review. Local .omykit files remain on disk and are locally ignored."
          : "No Git index removal was needed.",
      };
    } else {
      report.cleanup = {
        applied: false,
        mode: "untrack-runtime-dry-run",
        tracked_runtime_files: plan.tracked_runtime_files,
        next_action: "Run cleanup --untrack-runtime --apply to stage Git index removals while keeping local .omykit files.",
      };
    }
  } else if (options["reset-runtime"]) {
    const plan = buildGitRemovalPlan(process.cwd());
    if (options.apply) {
      const untrackResult = untrackGitPaths(process.cwd(), [OMYKIT_RUNTIME_DIR]);
      if (!untrackResult.applied && untrackResult.status !== "not_git_repo") {
        report.cleanup = {
          applied: false,
          mode: "reset-runtime",
          status: untrackResult.status,
          tracked_runtime_files: plan.tracked_runtime_files,
          actions: untrackResult.actions,
          error: untrackResult.error || null,
        };
      } else {
        result = uninstallLocalRuntime(process.cwd());
        report.cleanup = {
          applied: result.applied,
          mode: "reset-runtime",
          status: result.status,
          archive_dir: result.archive_dir,
          reason: result.reason || null,
          tracked_runtime_files: plan.tracked_runtime_files,
          git_index: {
            status: untrackResult.status,
            actions: untrackResult.actions,
          },
          actions: [...untrackResult.actions, ...result.actions],
          next_action: result.applied
            ? "Commit staged Git removals after review, or reinitialize omyKit when a fresh local runtime is needed."
            : "Resolve the reported blocker before resetting runtime state.",
        };
      }
      if (options.json) {
        console.log(JSON.stringify({
          ...report,
          report_file: null,
        }, null, 2));
        return;
      }
      printCleanupPlan(report, result);
      console.log(language === "zh-CN" ? "本地运行态已重置；未重新写入 .omykit/ 报告。" : "Local runtime reset; no .omykit/ report was rewritten.");
      return;
    } else {
      report.cleanup = {
        applied: false,
        mode: "reset-runtime-dry-run",
        source: projectRelativePath(omykitRoot(process.cwd()), process.cwd()),
        archive_root: localRuntimeUninstallArchiveRoot(process.cwd()),
        tracked_runtime_files: plan.tracked_runtime_files,
        next_action: "Run cleanup --reset-runtime --apply to stage Git untracking and archive local .omykit state.",
      };
    }
  } else if (options["uninstall-local"] || options.uninstall) {
    if (options.apply) {
      const reportFileBeforeMove = writeHealthReport(report);
      const untrackResult = untrackGitPaths(process.cwd(), [OMYKIT_RUNTIME_DIR]);
      result = uninstallLocalRuntime(process.cwd());
      report.cleanup = {
        applied: result.applied,
        mode: "uninstall-local",
        status: result.status,
        archive_dir: result.archive_dir,
        reason: result.reason || null,
        git_index: {
          status: untrackResult.status,
          actions: untrackResult.actions,
        },
        actions: [...untrackResult.actions, ...result.actions],
        report_file: reportFileBeforeMove && result.archive_dir
          ? path.join(result.archive_dir, "health", "health-report.json")
          : null,
      };
      if (options.json) {
        console.log(JSON.stringify({
          ...report,
          report_file: report.cleanup.report_file,
        }, null, 2));
        return;
      }
      printCleanupPlan(report, result);
      const label = result.applied
        ? (language === "zh-CN" ? "本地工作流已卸载" : "Local workflow runtime uninstalled")
        : (language === "zh-CN" ? "本地工作流未卸载" : "Local workflow runtime not uninstalled");
      console.log(`${label}: ${result.archive_dir || result.reason}`);
      return;
    }
    report.cleanup = {
      applied: false,
      mode: "uninstall-local-dry-run",
      source: projectRelativePath(omykitRoot(process.cwd()), process.cwd()),
      archive_root: localRuntimeUninstallArchiveRoot(process.cwd()),
    };
  } else if (options.apply) {
    result = archiveCleanupCandidates(report.cleanup_candidates, process.cwd());
    report.cleanup = {
      applied: true,
      archive_dir: result.archive_dir,
      actions: result.actions,
    };
  } else {
    report.cleanup = {
      applied: false,
      mode: "dry-run",
    };
  }
  const reportFile = writeHealthReport(report);
  if (options.json) {
    console.log(JSON.stringify({
      ...report,
      report_file: reportFile ? path.relative(process.cwd(), reportFile) : null,
    }, null, 2));
    return;
  }
  printCleanupPlan(report, result);
  console.log(`${language === "zh-CN" ? "报告" : "Report"}: ${path.relative(process.cwd(), reportFile)}`);
}

function cmdAssign(positional, options) {
  const nodeId = positional[0];
  if (!nodeId) throw new Error("assign requires a node id");
  const workflowDir = resolveWorkflowDir(options);
  const { graph, state } = loadWorkflow(workflowDir);
  const node = requireNode(graph, nodeId);
  const agentId = options.agent ? String(options.agent) : null;
  if (!agentId) throw new Error("assign requires --agent <agent-id>");
  if (!AGENT_ID_PATTERN.test(agentId)) {
    throw new Error("--agent must use lowercase letters, digits, dot, colon, underscore, or hyphen");
  }
  const surface = normalizeExecutionSurface(options.surface || "subagent");
  if (!EXECUTION_SURFACES.has(surface)) throw new Error(`--surface must be one of ${[...EXECUTION_SURFACES].join(", ")}`);
  const status = options.status ? String(options.status) : "planned";
  if (!ASSIGNMENT_STATUSES.has(status)) throw new Error(`--status must be one of ${[...ASSIGNMENT_STATUSES].join(", ")}`);
  const modelTier = options["model-tier"] ? String(options["model-tier"]) : null;
  if (modelTier && !MODEL_TIERS.has(modelTier)) throw new Error(`--model-tier must be one of ${[...MODEL_TIERS].join(", ")}`);
  const role = options.role ? String(options.role) : node.agent || node.worker_profile || dispatchAgentType(node);
  const record = {
    schema_version: SCHEMA_VERSION,
    at: now(),
    workflow_id: graph.workflow_id,
    assignment_id: `${nodeId}:${agentId}:${Date.now()}`,
    node_id: nodeId,
    agent_id: agentId,
    role,
    execution_surface: surface,
    status,
    thread_id: options.thread ? String(options.thread) : null,
    worktree_path: options.worktree ? String(options.worktree) : null,
    model_tier: modelTier || node.model_tier || null,
    model: options.model ? String(options.model) : null,
    write_scope: splitCsv(options.scope),
    context_pack: options["context-pack"] ? String(options["context-pack"]) : null,
    handoff_path: options.handoff ? String(options.handoff) : null,
    notes: options.notes ? String(options.notes) : null,
  };
  const errors = validateAssignmentRecord(graph, record, 0);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  appendText(assignmentsFile(workflowDir), `${JSON.stringify(record)}\n`);
  appendLedger(workflowDir, {
    event: "assignment.record",
    node_id: nodeId,
    agent_id: agentId,
    execution_surface: surface,
    status,
    thread_id: record.thread_id,
    worktree_path: record.worktree_path,
    context_pack: record.context_pack,
    handoff_path: record.handoff_path,
  });
  console.log(`Assignment recorded: ${agentId}`);
  console.log(`Node: ${nodeId}`);
  console.log(`Surface: ${surface}`);
  console.log(`Status: ${status}`);
  console.log(`Context pack: ${record.context_pack || "none"}`);
  console.log(`Handoff: ${record.handoff_path || "none"}`);
}

function cmdContextPack(positional, options) {
  const nodeId = positional[0];
  if (!nodeId) throw new Error("context-pack requires a node id");
  const workflowDir = resolveWorkflowDir(options);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const { graph, state } = loadWorkflow(workflowDir);
  requireNode(graph, nodeId);
  const language = resolveWorkflowLanguage(options, graph, loadHandoffs(workflowDir));
  const board = buildBoardProjection(workflowDir, graph, state, language);
  const payload = buildContextPackPayload(board, nodeId);
  const outputPath = path.join(workflowDir, "context-packs", `${nodeId}.json`);
  writeJson(outputPath, payload);
  console.log(`Context pack generated: ${nodeId}`);
  console.log(`JSON: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`Next action: ${payload.next_action}`);
}

function cmdResume(options) {
  const workflowDir = resolveWorkflowDir(options);
  const { graph, state } = loadWorkflow(workflowDir);
  const errors = validateWorkflow(workflowDir);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const language = resolveWorkflowLanguage(options, graph, loadHandoffs(workflowDir));
  const board = buildBoardProjection(workflowDir, graph, state, language);
  const running = board.columns.running;
  const ready = board.columns.ready;
  console.log("Resume context:");
  console.log(`Active workflow: ${graph.workflow_id}`);
  printStatus(graph, state);
  const dispatchPlan = buildDispatchPlan(board, { surface: "auto" });
  const plan = buildOrchestrationPlan(board, dispatchPlan);
  const planFile = writeOrchestrationPlan(workflowDir, plan);
  printOrchestrationPlan(plan, planFile);
  console.log("Command runs:");
  if (board.commands.records.length === 0) {
    console.log("none");
  } else {
    for (const item of board.commands.records) {
      console.log(`- ${item.run_id || "run"} ${item.status || "unknown"} node=${item.node_id || "none"} log=${item.log_path || "none"} resume=${item.resume_command || "none"}`);
    }
  }
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

function cmdRecordRun(positional, options) {
  const nodeId = positional[0];
  if (!nodeId) throw new Error("record-run requires a node id");
  const runId = options.id ? String(options.id) : null;
  if (!runId) throw new Error("record-run requires --id <run-id>");
  if (!/^[a-z0-9][a-z0-9._:-]{1,80}$/.test(runId)) {
    throw new Error("--id must use lowercase letters, digits, dot, colon, underscore, or hyphen");
  }
  const command = options.command ? String(options.command) : null;
  if (!command) throw new Error("record-run requires --command <cmd>");
  const status = options.status ? String(options.status) : "running";
  const allowedStatuses = new Set(["starting", "running", "passed", "failed", "stopped", "unknown"]);
  if (!allowedStatuses.has(status)) throw new Error(`--status must be one of ${[...allowedStatuses].join(", ")}`);
  const workflowDir = resolveWorkflowDir(options);
  const { graph } = loadWorkflow(workflowDir);
  requireNode(graph, nodeId);
  const record = {
    schema_version: SCHEMA_VERSION,
    at: now(),
    workflow_id: graph.workflow_id,
    node_id: nodeId,
    run_id: runId,
    label: options.label ? String(options.label) : null,
    command,
    status,
    pid: options.pid ? String(options.pid) : null,
    log_path: options.log ? String(options.log) : null,
    stdout_path: options.stdout ? String(options.stdout) : null,
    stderr_path: options.stderr ? String(options.stderr) : null,
    exit_code: options["exit-code"] !== undefined ? Number(options["exit-code"]) : null,
    resume_command: options.resume ? String(options.resume) : null,
    notes: options.notes ? String(options.notes) : null,
  };
  ensureDir(path.join(workflowDir, "commands"));
  appendText(commandRunsFile(workflowDir), `${JSON.stringify(record)}\n`);
  appendLedger(workflowDir, {
    event: "command.record",
    node_id: nodeId,
    run_id: runId,
    status,
    log_path: record.log_path,
  });
  console.log(`Command run recorded: ${runId}`);
  console.log(`Status: ${status}`);
  console.log(`Log: ${record.log_path || "none"}`);
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
  const persistedHandoffPath = persistHandoffInWorkflow(workflowDir, handoffPath, handoff);
  const relativeHandoff = relativeToWorkflow(workflowDir, persistedHandoffPath);
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
  const persistedHandoffPath = persistHandoffInWorkflow(workflowDir, handoffPath, handoff);
  const relativeHandoff = relativeToWorkflow(workflowDir, persistedHandoffPath);
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
  const blockedAt = now();
  state.nodes[nodeId] = stateEntry("blocked", String(reason), entry.last_handoff || null, {
    started_at: entry.started_at || blockedAt,
    blocked_at: blockedAt,
  });
  clearActive(state, nodeId);
  saveState(workflowDir, state);
  appendLedger(workflowDir, { at: blockedAt, event: "node.block", node_id: nodeId, reason: String(reason) });
  appendText(path.join(workflowDir, "blockers.md"), `- ${now()} ${nodeId}: ${reason}\n`);
  printStatus(graph, state);
}

function cmdUnblock(positional, options) {
  const nodeId = positional[0];
  const reason = options.reason || "Blocker resolved";
  if (!nodeId) throw new Error("unblock requires a node id");
  const workflowDir = resolveWorkflowDir(options);
  const { graph, state } = loadWorkflow(workflowDir);
  const node = requireNode(graph, nodeId);
  const entry = state.nodes[nodeId];
  if (entry.status !== "blocked") throw new Error(`Node ${nodeId} is ${entry.status}, not blocked`);
  const completedAt = now();
  const nextStatus = dependenciesSatisfied(node, state) ? "ready" : "pending";
  state.nodes[nodeId] = stateEntry(nextStatus, String(reason), entry.last_handoff || null);
  saveState(workflowDir, state);
  appendLedger(workflowDir, { at: completedAt, event: "node.unblock", node_id: nodeId, reason: String(reason) });
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
    case "tasks":
      cmdTasks(positional, options);
      return;
    case "workflows":
      cmdWorkflows(positional, options);
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
    case "orchestrate":
      cmdOrchestrate(options);
      return;
    case "upgrade":
      cmdUpgrade(options);
      return;
    case "doctor":
      cmdDoctor(options);
      return;
    case "cleanup":
      cmdCleanup(options);
      return;
    case "dispatch-plan":
      cmdDispatchPlan(options);
      return;
    case "assign":
      cmdAssign(positional, options);
      return;
    case "context-pack":
      cmdContextPack(positional, options);
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
    case "record-run":
      cmdRecordRun(positional, options);
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
    case "unblock":
      cmdUnblock(positional, options);
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
