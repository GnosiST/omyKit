# Workflow Visual Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static visual collaboration board to the omyKit workflow controller so users can inspect progress, flow dependencies, parallel work, handoffs, risks, and recent events without running a server.

**Architecture:** Keep the existing Skill + lightweight Controller model. Extend `scripts/omykit-workflow.mjs` with a read-only `board` command that validates the workflow, builds a stable `board.json` projection, and renders a self-contained `board.html` file from local `.omykit/workflows/<workflow-id>/` state.

**Tech Stack:** Node.js ESM with core modules only, JSON schemas, static HTML/CSS, existing smoke tests, existing skill/docs validators, existing global installer.

---

## File Structure

- Modify `scripts/omykit-workflow.mjs`: add collaboration metadata defaults, board projection, static HTML rendering, `board` CLI command, and optional `--open`.
- Modify `scripts/test-omykit-workflow.mjs`: cover board generation, columns, reject edges, collaboration fields, and backward-compatible missing optional fields.
- Modify `schemas/workflow-graph.schema.json`: allow optional collaboration metadata on graph nodes.
- Modify `schemas/workflow-node.schema.json`: allow optional collaboration metadata on node cards.
- Modify `docs/workflow/controller.md` and `docs/workflow/controller.zh-CN.md`: document the board command and generated files.
- Modify `docs/workflow/task-graph.md` and `docs/workflow/task-graph.zh-CN.md`: document collaboration fields and why they do not automatically dispatch workers.
- Modify `README.md` and `README.zh-CN.md`: add the board to quick start, feature summary, and validation notes.
- Modify `CHANGELOG.md`: add an unreleased visual board entry.

## Task 1: Extend Data Model

- [ ] **Step 1: Add optional collaboration fields to default nodes**

Add `worker_profile`, `claimed_by`, `parallel_group`, `join_policy`, `lease_expires_at`, and `handoff_target` to default graph nodes where useful. Keep all fields optional for existing workflows.

- [ ] **Step 2: Mirror metadata into node cards**

When a node card is generated, include the optional collaboration fields if present so each node card remains useful when opened in isolation.

- [ ] **Step 3: Validate collaboration field values**

Reject invalid `join_policy` values and invalid optional field types in the controller and schemas. Missing fields must stay valid.

## Task 2: Build Board Projection

- [ ] **Step 1: Read local workflow artifacts**

Load graph, state, node cards, handoffs, ledger, blockers, and decisions. Missing handoffs or empty blocker/decision files should appear as missing evidence or empty panels, not crash the command.

- [ ] **Step 2: Generate `board.json`**

Build a projection with `summary`, `columns`, `flow`, `collaboration`, `risks`, and `recent_events`. Include dependency edges, reject edges, parallel groups, critical path, retry alerts, failed handoffs, skipped required nodes, leases, unclaimed ready nodes, and claimed running nodes.

- [ ] **Step 3: Keep projection stable**

Use deterministic ordering from the graph and state files. Do not include volatile environment-specific fields beyond `generated_at` and local output paths.

## Task 3: Render Static Board HTML

- [ ] **Step 1: Render command center**

Show workflow id, title, mode, completion percentage, status counts, next recommended action, critical path, and the latest ledger event.

- [ ] **Step 2: Render flow and work board**

Show dependency/reject edges, parallel groups, status columns, card metadata, retry counts, handoff status, and evidence status.

- [ ] **Step 3: Render collaboration and risk panels**

Show worker profile lanes, claims, leases, unclaimed ready nodes, overloaded worker profiles, blockers, failed handoffs, retry alerts, skipped gates, and decisions.

- [ ] **Step 4: Keep HTML self-contained**

Use inline CSS and inline JSON only. Do not depend on a CDN, server, database, WebSocket, or live refresh.

## Task 4: Add CLI Command

- [ ] **Step 1: Add help and command routing**

Support:

```bash
node scripts/omykit-workflow.mjs board
node scripts/omykit-workflow.mjs board --workflow <workflow-id>
node scripts/omykit-workflow.mjs board --open
```

- [ ] **Step 2: Validate before rendering**

Call the existing workflow validation. If graph/state/handoff validation fails, stop before writing board files and tell the user to run `validate`.

- [ ] **Step 3: Print useful output**

Print `board.json`, `board.html`, and the next recommended action. If `--open` fails, keep the files and print the HTML path.

## Task 5: Update Tests

- [ ] **Step 1: Generate a board in the smoke test**

After exercising complete/reject/block flows, run `board` and assert both output files exist.

- [ ] **Step 2: Assert projection shape**

Assert `board.json` includes `summary`, `columns`, `flow`, `collaboration`, `risks`, and `recent_events`.

- [ ] **Step 3: Assert behavior**

Check that passed and blocked nodes appear in the right columns, failed handoffs create reject edges, optional collaboration fields appear in the projection, and workflows with missing optional fields still render.

## Task 6: Update Docs And Release Notes

- [ ] **Step 1: Update workflow docs**

Document the board in English and Chinese controller docs, and document collaboration metadata in English and Chinese task graph docs.

- [ ] **Step 2: Update README files**

Add the board command to quick start and explain that the HTML board is a local collaboration map, not a realtime collaboration platform.

- [ ] **Step 3: Update changelog**

Add an unreleased entry describing the visual board, board projection, collaboration metadata, and tests.

## Task 7: Verify, Install, Commit, Push

- [ ] **Step 1: Syntax and smoke tests**

Run:

```bash
node --check scripts/omykit-workflow.mjs
node --check scripts/test-omykit-workflow.mjs
node scripts/test-omykit-workflow.mjs
```

- [ ] **Step 2: Schema and docs checks**

Run:

```bash
node -e 'for (const f of ["schemas/workflow-graph.schema.json","schemas/workflow-node.schema.json","schemas/workflow-state.schema.json","schemas/workflow-handoff.schema.json"]) JSON.parse(require("fs").readFileSync(f,"utf8")); console.log("schemas parse")'
PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/validate-skills.sh
node ./scripts/validate-docs.mjs
node ./scripts/check-upstream-refs.mjs --strict
git diff --check
```

- [ ] **Step 3: Install global copy from final clean commit**

After committing implementation, run `./scripts/install-global.sh` and confirm `${CODEX_HOME:-$HOME/.codex}/omykit/install-manifest` points to the final commit with `git_dirty=false`.

- [ ] **Step 4: Push**

Push `main` after validations and install confirmation pass.
