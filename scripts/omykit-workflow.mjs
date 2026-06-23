#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SCHEMA_VERSION = "1";
const COLUMN_STATUSES = ["pending", "ready", "running", "blocked", "failed", "passed", "skipped"];
const STATUSES = new Set(["pending", "ready", "running", "passed", "failed", "blocked", "skipped"]);
const TERMINAL_STATUSES = new Set(["passed", "skipped"]);
const HANDOFF_STATUSES = new Set(["passed", "failed", "blocked", "skipped"]);
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
const COLLABORATION_FIELDS = [
  "worker_profile",
  "claimed_by",
  "parallel_group",
  "join_policy",
  "lease_expires_at",
  "handoff_target",
];
const DEFAULT_MODE = "Standard";

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

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
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
  node scripts/omykit-workflow.mjs init "feature title" [--id workflow-id] [--mode Standard]
  node scripts/omykit-workflow.mjs status [--workflow workflow-id]
  node scripts/omykit-workflow.mjs next [--workflow workflow-id]
  node scripts/omykit-workflow.mjs validate [--workflow workflow-id]
  node scripts/omykit-workflow.mjs start <node-id> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs complete <node-id> --handoff <path> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs reject <node-id> --to <node-id> --handoff <path> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs block <node-id> --reason <text> [--workflow workflow-id]
  node scripts/omykit-workflow.mjs board [--workflow workflow-id] [--open]
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

function stateEntry(status, reason = null, lastHandoff = null) {
  return {
    status,
    updated_at: now(),
    last_handoff: lastHandoff,
    reason,
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

function nodeCard(graph, node) {
  const card = {
    schema_version: SCHEMA_VERSION,
    workflow_id: graph.workflow_id,
    node_id: node.id,
    type: node.type,
    title: node.title,
    objective: nodeObjective(node),
    depends_on: node.depends_on,
    context_level: node.context_level || "focus",
    acceptance: node.acceptance,
    allowed_outputs: [
      `handoffs/${node.id}.json`,
      `evidence/${node.id}-summary.txt`,
    ],
    handoff_required: true,
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
    nodes: entries,
    retry_edges: {},
  };
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
    if (!Array.isArray(card.acceptance) || card.acceptance.length === 0) {
      errors.push(`node card ${node.id} acceptance must be non-empty`);
    }
    if (!Array.isArray(card.allowed_outputs) || card.allowed_outputs.length === 0) {
      errors.push(`node card ${node.id} allowed_outputs must be non-empty`);
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

function readMarkdownItems(file, limit = 8) {
  return readTextIfExists(file)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .slice(-limit);
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
  for (const item of handoff.verification || []) {
    if (item.evidence) paths.add(item.evidence);
  }
  return [...paths];
}

function evidenceStatus(entry, handoff) {
  if (handoff?.status === "missing") return "missing";
  if (handoff?.status === "invalid") return "invalid";
  if (handoff) return "present";
  if (["passed", "failed", "blocked", "skipped"].includes(entry?.status)) return "missing";
  return "not_required_yet";
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

function projectNode(state, cards, handoffs, node) {
  const entry = state.nodes[node.id] || {};
  const card = cards.get(node.id) || {};
  const handoff = latestHandoffForNode(entry, handoffs, node.id);
  const retry = retryInfoForNode(state, node.id);
  return {
    id: node.id,
    title: node.title,
    type: node.type,
    status: entry.status || "missing",
    owner: node.owner || "codex",
    required: node.required,
    context_level: node.context_level || card.context_level || "focus",
    worker_profile: collaborationValue(node, card, "worker_profile", "unassigned"),
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
    evidence_status: evidenceStatus(entry, handoff),
    objective: card.objective || nodeObjective(node),
    depends_on: node.depends_on || [],
    inputs: node.depends_on || [],
    inputs_used: handoff?.inputs_used || [],
    allowed_scope: card.allowed_scope || [],
    acceptance: card.acceptance || node.acceptance || [],
    required_checks: (handoff?.verification || []).map((item) => ({
      command: item.command,
      result: item.result,
      evidence: item.evidence || null,
    })),
    outputs: card.allowed_outputs || [],
    evidence_paths: collectEvidencePaths(handoff),
    open_risks: ["failed", "blocked"].includes(entry.status) && entry.reason ? [entry.reason] : [],
    non_blocking_notes: [],
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

function nextRecommendedAction(graph, state) {
  const ready = readyNodes(graph, state);
  const running = nodesWithStatus(graph, state, "running");
  const blocked = nodesWithStatus(graph, state, "blocked");
  const failed = nodesWithStatus(graph, state, "failed");
  if (failed.length > 0) return `Resolve or reject from ${failed[0].id}.`;
  if (blocked.length > 0 && ready.length === 0) return `Unblock ${blocked[0].id} or record a blocking handoff.`;
  if (ready.length > 0) return `Start ${ready[0].id}.`;
  if (running.length > 0) return `Complete ${running[0].id} with a structured handoff.`;
  return "Delivery complete or no ready nodes.";
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

function buildBoardProjection(workflowDir, graph, state) {
  const cards = loadNodeCards(workflowDir, graph);
  const handoffs = loadHandoffs(workflowDir);
  const projectedNodes = graph.nodes.map((node) => projectNode(state, cards, handoffs, node));
  const counts = statusCounts(projectedNodes);
  const columns = {};
  for (const status of COLUMN_STATUSES) {
    columns[status] = projectedNodes.filter((node) => node.status === status);
  }
  const recentEvents = readLedgerEvents(workflowDir, 10);
  const critical = criticalPath(graph);
  return {
    schema_version: SCHEMA_VERSION,
    workflow_id: graph.workflow_id,
    title: graph.title,
    mode: graph.mode,
    generated_at: now(),
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
      next_recommended_action: nextRecommendedAction(graph, state),
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
    risks: buildRisks(workflowDir, graph, state, projectedNodes, handoffs),
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

function renderList(items, empty = "none") {
  if (!items || items.length === 0) return `<span class="muted">${escapeHtml(empty)}</span>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : JSON.stringify(item))}</li>`).join("")}</ul>`;
}

function renderMetric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderNodeCard(node) {
  return `<article class="node-card ${escapeHtml(node.status)}">
    <div class="node-head">
      <strong>${escapeHtml(node.id)}</strong>
      <span class="status ${escapeHtml(node.status)}">${escapeHtml(node.status)}</span>
    </div>
    <div class="node-title">${escapeHtml(node.title)}</div>
    <dl>
      <dt>Type</dt><dd>${escapeHtml(node.type)}</dd>
      <dt>Worker</dt><dd>${escapeHtml(node.worker_profile)}</dd>
      <dt>Claimed</dt><dd>${escapeHtml(node.claimed_by || "unclaimed")}</dd>
      <dt>Retry</dt><dd>${escapeHtml(node.retry_count)}</dd>
      <dt>Handoff</dt><dd>${escapeHtml(node.last_handoff || "missing")}</dd>
      <dt>Evidence</dt><dd>${escapeHtml(node.evidence_status)}</dd>
    </dl>
  </article>`;
}

function renderEdgeList(edges, empty = "No edges") {
  if (!edges || edges.length === 0) return `<p class="muted">${escapeHtml(empty)}</p>`;
  return `<div class="edge-list">${edges
    .map((edge) => `<div class="edge"><code>${escapeHtml(edge.from)}</code><span>-></span><code>${escapeHtml(edge.to)}</code>${edge.retry_count ? `<small>retry ${escapeHtml(edge.retry_count)}</small>` : ""}</div>`)
    .join("")}</div>`;
}

function renderBoardHtml(board) {
  const columnsHtml = COLUMN_STATUSES.map(
    (status) => `<section class="column">
      <h3>${escapeHtml(status)} <span>${board.columns[status].length}</span></h3>
      ${board.columns[status].length > 0 ? board.columns[status].map(renderNodeCard).join("") : '<p class="muted">empty</p>'}
    </section>`,
  ).join("");

  const detailsHtml = Object.values(board.columns)
    .flat()
    .map((node) => `<details class="detail">
      <summary><strong>${escapeHtml(node.id)}</strong> ${escapeHtml(node.title)}</summary>
      <div class="detail-grid">
        <section><h4>Objective</h4><p>${escapeHtml(node.objective)}</p></section>
        <section><h4>Depends On</h4>${renderList(node.depends_on)}</section>
        <section><h4>Acceptance</h4>${renderList(node.acceptance)}</section>
        <section><h4>Outputs</h4>${renderList(node.outputs)}</section>
        <section><h4>Required Checks</h4>${renderList(node.required_checks)}</section>
        <section><h4>Evidence Paths</h4>${renderList(node.evidence_paths)}</section>
        <section><h4>Open Risks</h4>${renderList(node.open_risks)}</section>
        <section><h4>Notes</h4>${renderList(node.non_blocking_notes)}</section>
      </div>
    </details>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>omyKit Board - ${escapeHtml(board.workflow_id)}</title>
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
    .metric { border: 1px solid var(--line); border-radius: 6px; padding: 10px; background: #fbfcfe; }
    .metric span { display: block; color: var(--muted); font-size: 12px; }
    .metric strong { display: block; font-size: 22px; line-height: 1.2; }
    .grid-2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
    .board { display: grid; grid-template-columns: repeat(7, minmax(170px, 1fr)); gap: 12px; overflow-x: auto; padding-bottom: 6px; }
    .column { min-width: 170px; background: #fdfefe; border: 1px solid var(--line); border-radius: 8px; padding: 10px; }
    .node-card { border: 1px solid var(--line); border-left: 4px solid var(--pending); border-radius: 6px; padding: 10px; background: #fff; margin-bottom: 8px; }
    .node-card.ready { border-left-color: var(--ready); }
    .node-card.running { border-left-color: var(--running); }
    .node-card.blocked { border-left-color: var(--blocked); }
    .node-card.failed { border-left-color: var(--failed); }
    .node-card.passed { border-left-color: var(--passed); }
    .node-card.skipped { border-left-color: var(--skipped); }
    .node-head { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
    .node-title { color: var(--muted); margin: 4px 0 8px; }
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
      .board { grid-template-columns: 1fr; overflow-x: visible; }
      .column { min-width: 0; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(board.title)}</h1>
    <p class="muted"><code>${escapeHtml(board.workflow_id)}</code> &middot; ${escapeHtml(board.mode)} &middot; generated ${escapeHtml(board.generated_at)}</p>
  </header>
  <main>
    <section class="panel command">
      <div>
        <h2>Command Center</h2>
        <div class="progress" aria-label="Completion ${escapeHtml(board.summary.completion_percent)} percent"><span style="width:${escapeHtml(board.summary.completion_percent)}%"></span></div>
        <p><strong>${escapeHtml(board.summary.completion_percent)}%</strong> complete</p>
        <p><strong>Next:</strong> ${escapeHtml(board.summary.next_recommended_action)}</p>
        <p><strong>Critical path:</strong> ${escapeHtml(board.summary.critical_path.join(" -> ") || "none")}</p>
      </div>
      <div class="metrics">
        ${renderMetric("Total", board.summary.total)}
        ${renderMetric("Ready", board.summary.ready)}
        ${renderMetric("Running", board.summary.running)}
        ${renderMetric("Blocked", board.summary.blocked)}
        ${renderMetric("Failed", board.summary.failed)}
        ${renderMetric("Passed", board.summary.passed)}
        ${renderMetric("Skipped", board.summary.skipped)}
        ${renderMetric("Pending", board.summary.pending)}
      </div>
    </section>

    <section class="grid-2">
      <div class="panel">
        <h2>Flow Map</h2>
        <h3>Dependencies</h3>
        ${renderEdgeList(board.flow.dependency_edges)}
        <h3>Reject Edges</h3>
        ${renderEdgeList(board.flow.reject_edges, "No reject edges")}
      </div>
      <div class="panel">
        <h2>Collaboration Lanes</h2>
        <div class="lanes">
          ${board.collaboration.worker_profiles
            .map((lane) => `<div class="lane"><h3>${escapeHtml(lane.profile)} <span>${escapeHtml(lane.nodes.length)}</span></h3><p><strong>Nodes:</strong> ${escapeHtml(lane.nodes.join(", "))}</p><p><strong>Counts:</strong> ${escapeHtml(JSON.stringify(lane.counts))}</p></div>`)
            .join("")}
        </div>
        <p><strong>Unclaimed ready:</strong> ${escapeHtml(board.collaboration.unclaimed_ready.join(", ") || "none")}</p>
        <p><strong>Claimed running:</strong> ${escapeHtml(JSON.stringify(board.collaboration.claimed_running))}</p>
        <p><strong>Leases:</strong> ${escapeHtml(JSON.stringify(board.collaboration.leases))}</p>
      </div>
    </section>

    <section class="panel">
      <h2>Work Board</h2>
      <div class="board">${columnsHtml}</div>
    </section>

    <section class="panel">
      <h2>Node Details</h2>
      ${detailsHtml}
    </section>

    <section class="grid-2">
      <div class="panel">
        <h2>Risk And Decision Panel</h2>
        <h3>Blockers</h3>${renderList(board.risks.blockers)}
        <h3>Failed Handoffs</h3>${renderList(board.risks.failed_handoffs)}
        <h3>Retry Alerts</h3>${renderList(board.risks.retry_alerts)}
        <h3>Skipped Required</h3>${renderList(board.risks.skipped_required)}
        <h3>Decisions</h3>${renderList(board.risks.decisions)}
      </div>
      <div class="panel">
        <h2>Recent Events</h2>
        ${renderList(board.recent_events)}
      </div>
    </section>

    <section class="panel">
      <h2>Board Projection</h2>
      <pre>${escapeHtml(JSON.stringify(board, null, 2))}</pre>
    </section>
  </main>
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

  const mode = options.mode ? String(options.mode) : DEFAULT_MODE;
  if (!MODES.has(mode)) throw new Error(`--mode must be one of ${[...MODES].join(", ")}`);

  const workflowId = options.id ? slugify(options.id) : `${dateStamp()}-${slugify(title)}`;
  const workflowDir = path.join(workflowsRoot(), workflowId);
  if (fs.existsSync(workflowDir)) throw new Error(`Workflow already exists: ${workflowId}`);

  const graph = {
    schema_version: SCHEMA_VERSION,
    workflow_id: workflowId,
    title,
    mode,
    created_at: now(),
    metadata: {
      controller: "omykit-workflow",
    },
    nodes: defaultGraphNodes(),
  };
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
  appendLedger(workflowDir, { event: "workflow.init", workflow_id: workflowId, title, mode });

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
  const board = buildBoardProjection(workflowDir, graph, state);
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
  state.nodes[nodeId] = stateEntry("running", "Started", entry.last_handoff || null);
  state.active_node = nodeId;
  saveState(workflowDir, state);
  appendLedger(workflowDir, { event: "node.start", node_id: nodeId });
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

  const relativeHandoff = relativeToWorkflow(workflowDir, handoffPath);
  state.nodes[nodeId] = stateEntry("passed", null, relativeHandoff);
  if (state.active_node === nodeId) state.active_node = null;
  recalculateReady(graph, state);
  saveState(workflowDir, state);
  appendLedger(workflowDir, { event: "node.complete", node_id: nodeId, handoff: relativeHandoff });
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

  const edge = `${nodeId}->${rejectTo}`;
  const retryCount = (state.retry_edges[edge] || 0) + 1;
  state.retry_edges[edge] = retryCount;
  const relativeHandoff = relativeToWorkflow(workflowDir, handoffPath);
  state.nodes[nodeId] = stateEntry("failed", handoff.reason, relativeHandoff);
  state.nodes[rejectTo] = stateEntry("ready", `Rejected by ${nodeId}: ${handoff.required_fix}`, state.nodes[rejectTo].last_handoff || null);
  resetDependents(graph, state, rejectTo, new Set([nodeId]));
  if (retryCount > target.retry_limit) {
    state.nodes[rejectTo] = stateEntry(
      "blocked",
      `Retry limit exceeded for ${edge}; requires human decision or design review`,
      state.nodes[rejectTo].last_handoff || null,
    );
  }
  if (state.active_node === nodeId || state.active_node === rejectTo) state.active_node = null;
  saveState(workflowDir, state);
  appendLedger(workflowDir, {
    event: "node.reject",
    node_id: nodeId,
    reject_to: rejectTo,
    retry_count: retryCount,
    handoff: relativeHandoff,
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
  state.nodes[nodeId] = stateEntry("blocked", String(reason), entry.last_handoff || null);
  if (state.active_node === nodeId) state.active_node = null;
  saveState(workflowDir, state);
  appendLedger(workflowDir, { event: "node.block", node_id: nodeId, reason: String(reason) });
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
    case "status":
      cmdStatus(options);
      return;
    case "next":
      cmdNext(options);
      return;
    case "validate":
      cmdValidate(options);
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
