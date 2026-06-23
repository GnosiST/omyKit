#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const SCHEMA_VERSION = "1";
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
  return {
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
    for (const dependency of node.depends_on || []) {
      if (!map.has(dependency)) errors.push(`${node.id} depends on missing node ${dependency}`);
      if (dependency === node.id) errors.push(`${node.id} cannot depend on itself`);
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
