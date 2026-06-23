# Workflow Controller Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the C-lite omyKit workflow controller: a local task-graph protocol, JSON schemas, CLI state machine, tests, install support, and skill/docs integration.

**Architecture:** Keep Codex skills as the decision layer and add a deterministic local CLI for state, handoff validation, and next-node recommendations. Persist workflow state under `.omykit/workflows/<workflow-id>/` in the target project; install the controller script and schemas into `${CODEX_HOME:-$HOME/.codex}/omykit/` for global skill use.

**Tech Stack:** Node.js ESM with only core modules, JSON Schema documents, Markdown docs, existing Bash install/rollback scripts, existing omyKit skill validator.

---

## File Structure

- Create `schemas/workflow-graph.schema.json`: task graph schema for workflow id, mode, nodes, dependencies, acceptance, retry limits, and metadata.
- Create `schemas/workflow-node.schema.json`: per-node task card schema.
- Create `schemas/workflow-state.schema.json`: controller state snapshot schema.
- Create `schemas/workflow-handoff.schema.json`: node handoff schema for passed, failed, blocked, and skipped outcomes.
- Create `scripts/omykit-workflow.mjs`: local controller CLI with `init`, `status`, `next`, `validate`, `start`, `complete`, `reject`, `block`, and `resume`.
- Create `scripts/test-omykit-workflow.mjs`: deterministic CLI smoke tests using temporary directories.
- Modify `scripts/install-global.sh`: install controller script and schemas under `$CODEX_HOME/omykit/`, and back them up.
- Modify `scripts/rollback-global.sh`: restore backed-up controller script and schemas when available.
- Modify `skills/codex-change-workflow/SKILL.md`: add controller trigger and execution rules.
- Modify `skills/codex-context-budget/SKILL.md`: add compact/continuation read order for controller workflows.
- Modify `skills/codex-delivery-gate/SKILL.md`: include controller status/handoff/evidence in completion claims.
- Modify `skills/codex-workflow-evolution/SKILL.md`: treat repeated controller friction as workflow-evolution evidence.
- Create `docs/workflow/controller.md` and `docs/workflow/controller.zh-CN.md`: controller overview and commands.
- Create `docs/workflow/task-graph.md` and `docs/workflow/task-graph.zh-CN.md`: task graph model.
- Create `docs/workflow/handoff-protocol.md` and `docs/workflow/handoff-protocol.zh-CN.md`: handoff protocol.
- Modify `docs/README.md`, `docs/README.zh-CN.md`, `README.md`, `README.zh-CN.md`, `docs/workflow/codex-workflow-kit.md`, `docs/workflow/codex-workflow-kit.zh-CN.md`, `docs/workflow/skill-coordination.md`, `docs/workflow/skill-coordination.zh-CN.md`, `docs/workflow/context-budget.md`, `docs/workflow/context-budget.zh-CN.md`, `docs/workflow/delivery-gates.md`, `docs/workflow/delivery-gates.zh-CN.md`, `docs/workflow/evolution.md`, `docs/workflow/evolution.zh-CN.md`, and `CHANGELOG.md`.

## Task 1: Add JSON Schemas

- [ ] **Step 1: Create graph schema**

Create `schemas/workflow-graph.schema.json` with draft-07 schema, required `schema_version`, `workflow_id`, `title`, `mode`, `created_at`, and `nodes`. Node entries require `id`, `type`, `title`, `depends_on`, `required`, `retry_limit`, and `acceptance`.

- [ ] **Step 2: Create node schema**

Create `schemas/workflow-node.schema.json` requiring `schema_version`, `workflow_id`, `node_id`, `type`, `title`, `objective`, `depends_on`, `context_level`, `acceptance`, `allowed_outputs`, and `handoff_required`.

- [ ] **Step 3: Create state schema**

Create `schemas/workflow-state.schema.json` requiring `schema_version`, `workflow_id`, `updated_at`, `active_node`, `nodes`, and `retry_edges`.

- [ ] **Step 4: Create handoff schema**

Create `schemas/workflow-handoff.schema.json` requiring `workflow_id`, `node_id`, `status`, and `summary`, with conditional requirements for `passed`, `failed`, `blocked`, and `skipped`.

- [ ] **Step 5: Parse schemas**

Run: `node -e 'for (const f of ["schemas/workflow-graph.schema.json","schemas/workflow-node.schema.json","schemas/workflow-state.schema.json","schemas/workflow-handoff.schema.json"]) JSON.parse(require("fs").readFileSync(f,"utf8")); console.log("schemas parse")'`

Expected: `schemas parse`.

## Task 2: Build Controller CLI

- [ ] **Step 1: Create controller script**

Create `scripts/omykit-workflow.mjs` with:

```js
const STATUSES = new Set(["pending", "ready", "running", "passed", "failed", "blocked", "skipped"]);
const NODE_TYPES = new Set(["intake", "research", "design", "plan", "implement", "verify", "review", "delivery", "evolution"]);
const MODES = new Set(["Lite", "Standard", "Strict"]);
```

Implement helpers for reading/writing JSON, resolving the active workflow, appending `ledger.jsonl`, recalculating ready nodes, validating graph dependencies, validating handoff fields, and printing compact status.

- [ ] **Step 2: Implement `init`**

`node scripts/omykit-workflow.mjs init "feature-x"` creates `.omykit/workflows/YYYY-MM-DD-feature-x/` with graph, state, ledger, decisions, blockers, node cards, handoff, and evidence directories. Default graph is `intake -> design -> plan -> implement -> verify -> delivery`.

- [ ] **Step 3: Implement read-only commands**

Implement `status`, `next`, `validate`, and `resume`. `next` prints ready nodes; `validate` fails on missing files, dependency cycles, missing state entries, invalid statuses, and invalid handoff files.

- [ ] **Step 4: Implement mutation commands**

Implement `start <node>`, `complete <node> --handoff <path>`, `reject <node> --to <node> --handoff <path>`, and `block <node> --reason <text>`. Mutations update `state.json`, append `ledger.jsonl`, and keep unrelated ready nodes available.

- [ ] **Step 5: Check syntax**

Run: `node --check scripts/omykit-workflow.mjs`

Expected: no output and exit code 0.

## Task 3: Add Controller Tests

- [ ] **Step 1: Create smoke test script**

Create `scripts/test-omykit-workflow.mjs`. Use `fs.mkdtempSync(path.join(os.tmpdir(), "omykit-workflow-"))`, run the CLI with `execFileSync(process.execPath, [controller, ...args], { cwd })`, and assert that init/status/next/start/complete/reject/block/validate work.

- [ ] **Step 2: Cover success path**

The test should initialize a workflow, assert `01-intake` is ready, start it, write a passed handoff, complete it, and assert `02-design` becomes ready.

- [ ] **Step 3: Cover rejection path**

The test should start `02-design`, write a failed handoff rejecting to `01-intake`, run `reject`, and assert `01-intake` becomes ready and `02-design` becomes failed.

- [ ] **Step 4: Cover blocking path**

The test should block `02-design`, run `status`, and assert blocked output includes `02-design`.

- [ ] **Step 5: Run tests**

Run: `node scripts/test-omykit-workflow.mjs`

Expected: `omykit workflow tests passed`.

## Task 4: Install And Rollback Support

- [ ] **Step 1: Update installer**

Modify `scripts/install-global.sh` to copy `scripts/omykit-workflow.mjs` into `$CODEX_HOME/omykit/scripts/` and `schemas/*.schema.json` into `$CODEX_HOME/omykit/schemas/`. Include these paths in backup creation when they already exist.

- [ ] **Step 2: Update rollback**

Modify `scripts/rollback-global.sh` to restore backed-up `$CODEX_HOME/omykit/scripts/` and `$CODEX_HOME/omykit/schemas/` when the selected backup contains them.

- [ ] **Step 3: Check shell syntax**

Run: `for f in scripts/*.sh; do bash -n "$f"; done`

Expected: no output and exit code 0.

## Task 5: Update Skills

- [ ] **Step 1: Update change workflow**

In `skills/codex-change-workflow/SKILL.md`, add a Controller section: Lite does not default to controller; Standard enables it for multi-node, compact-prone, parallel, rejected, or user-requested resumable work; Strict defaults to it. Mention script lookup order: project `scripts/omykit-workflow.mjs`, then `${CODEX_HOME:-$HOME/.codex}/omykit/scripts/omykit-workflow.mjs`.

- [ ] **Step 2: Update context budget**

In `skills/codex-context-budget/SKILL.md`, add controller continuation read order: `state.json`, `graph.json`, latest ledger events, active node cards, related handoffs/evidence summaries.

- [ ] **Step 3: Update delivery gate**

In `skills/codex-delivery-gate/SKILL.md`, require controller workflows to include status, failed/blocked nodes, handoff evidence, and skipped gates before completion claims.

- [ ] **Step 4: Update workflow evolution**

In `skills/codex-workflow-evolution/SKILL.md`, treat repeated controller friction, invalid handoffs, retry loops, or missing node types as evidence for omyKit improvement.

- [ ] **Step 5: Validate skills**

Run: `PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/validate-skills.sh`

Expected: `All omyKit skills are valid.`

## Task 6: Add Workflow Docs

- [ ] **Step 1: Write controller docs**

Create `docs/workflow/controller.md` and `.zh-CN.md` covering purpose, activation rules, CLI commands, install locations, and what the controller does not do.

- [ ] **Step 2: Write task graph docs**

Create `docs/workflow/task-graph.md` and `.zh-CN.md` covering node types, statuses, dependencies, fan-out, join, reject, block, skip, and retry limits.

- [ ] **Step 3: Write handoff docs**

Create `docs/workflow/handoff-protocol.md` and `.zh-CN.md` covering passed, failed, blocked, skipped handoff fields and examples.

- [ ] **Step 4: Link docs**

Update doc indexes and overview docs so English and Chinese links are complete.

- [ ] **Step 5: Validate docs**

Run: `node ./scripts/validate-docs.mjs`

Expected: all Markdown links resolve.

## Task 7: Update README, Coordination, And Changelog

- [ ] **Step 1: Update README files**

Add workflow controller to the feature list, workflow diagram, repository contents, operational rules, docs links, validation commands, and maintenance notes in English and Chinese.

- [ ] **Step 2: Update coordination docs**

Add controller to skill coordination as a repo-local mechanism that supports `codex-change-workflow` and `codex-delivery-gate`, without replacing existing skills.

- [ ] **Step 3: Update context, delivery, and evolution docs**

Mirror the skill behavior in docs: continuation read order, controller evidence at delivery, and controller friction as evolution evidence.

- [ ] **Step 4: Update changelog**

Add an unreleased entry describing the C-lite workflow controller, schemas, CLI, install support, and docs.

- [ ] **Step 5: Diff check**

Run: `git diff --check`

Expected: no whitespace errors.

## Task 8: Final Verification And Install

- [ ] **Step 1: Run controller test**

Run: `node scripts/test-omykit-workflow.mjs`

Expected: `omykit workflow tests passed`.

- [ ] **Step 2: Run skill validation**

Run: `PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/validate-skills.sh`

Expected: `All omyKit skills are valid.`

- [ ] **Step 3: Run docs validation**

Run: `node ./scripts/validate-docs.mjs`

Expected: all local links resolve.

- [ ] **Step 4: Run upstream reference check**

Run: `node ./scripts/check-upstream-refs.mjs --strict`

Expected: all tracked references match baselines, or any drift is reviewed before release.

- [ ] **Step 5: Run install after commit**

After committing final changes, run `PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/install-global.sh` so the manifest points to the final clean commit with `git_dirty=false`.

## Self-Review

- Spec coverage: The plan covers C-lite local file protocol, schemas, CLI, tests, install support, skill integration, docs, validation, global install, and preserves Lite behavior.
- Red-flag scan: No unresolved marker wording or vague edge-handling steps remain.
- Type consistency: Node status names, node type names, command names, and file paths match the design spec.
