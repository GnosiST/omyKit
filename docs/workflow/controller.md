# Workflow Controller

Language: [English](controller.md) | [简体中文](controller.zh-CN.md)

The omyKit workflow controller is a local C-lite state machine for long, resumable, or multi-node Codex work. It complements the skill layer; it does not replace Codex, run models, edit code by itself, or act as a background service.

Use it when a task needs durable state, structured handoffs, retry visibility, or continuation after compact.

## Activation

| Mode | Controller use |
| --- | --- |
| Lite | Do not enable by default. Use brief -> execute -> verify. |
| Standard | Enable only when the task is multi-node, compact-prone, parallel, rejected, resumable, or explicitly asks for tracked workflow state. |
| Strict | Enable by default. Use task graph, handoffs, evidence, blockers, and delivery gates. |

Signals that justify the controller:

- multiple phases with separate acceptance criteria
- fan-out research, implementation, review, or verification
- failed tests or gates that should reject to an upstream node
- long tasks likely to cross context compaction or sessions
- user asks for autonomous progress with clear blocker handling

## Codex-First Use

Prefer operating the controller through Codex chat:

```text
$omykit 创建工作流：重构登录模块
$omykit 查看工作流状态
$omykit 继续工作流
$omykit 下一步
$omykit 生成看板并打开
$omykit 校验工作流
```

Codex should choose the project-local controller script when present, otherwise the globally installed script, run the command, and report the status, next action, generated board paths, task-tracker highlights, token coverage, failed/blocked nodes, and residual risk.

Use shell commands directly only for automation, CI, troubleshooting, or when Codex cannot operate the local shell.

## Runtime Location

When installed globally, omyKit places the controller here:

```text
${CODEX_HOME:-$HOME/.codex}/omykit/scripts/omykit-workflow.mjs
${CODEX_HOME:-$HOME/.codex}/omykit/schemas/*.schema.json
```

Inside the omyKit source repository, use:

```bash
node scripts/omykit-workflow.mjs status
```

In a target project, prefer a project-local `scripts/omykit-workflow.mjs` if present. Otherwise use the global installed controller path.

## Commands

```bash
node scripts/omykit-workflow.mjs init "feature title"
node scripts/omykit-workflow.mjs status
node scripts/omykit-workflow.mjs next
node scripts/omykit-workflow.mjs validate
node scripts/omykit-workflow.mjs start 03-implement
node scripts/omykit-workflow.mjs complete 03-implement --handoff handoffs/03-implement-to-04-verify.json
node scripts/omykit-workflow.mjs reject 04-verify --to 03-implement --handoff handoffs/04-verify-to-03-implement.reject.json
node scripts/omykit-workflow.mjs block 02-design --reason "Waiting for user confirmation"
node scripts/omykit-workflow.mjs board
node scripts/omykit-workflow.mjs board --open --lang zh-CN
node scripts/omykit-workflow.mjs resume
```

Commands operate on `.omykit/workflows/<workflow-id>/` in the current project. If there are multiple workflows, pass `--workflow <workflow-id>`.

## Visual Board

The board command creates a local collaboration map for the active workflow:

```bash
node scripts/omykit-workflow.mjs board --workflow <workflow-id>
node scripts/omykit-workflow.mjs board --workflow <workflow-id> --lang zh-CN --open
```

It writes:

```text
.omykit/workflows/<workflow-id>/board.json
.omykit/workflows/<workflow-id>/board.html
```

`board.json` is a stable projection for tools and tests. `board.html` is a self-contained dashboard you can open in a browser. It shows a task tracker, actual node work items, changed files, verification results, evidence availability, agent activity, token usage coverage, command-center metrics, project snapshot, Git branch/commit/status, dependency and reject edges, parallel groups, worker profile lanes, blockers, decisions, retry alerts, and recent ledger events.

Token totals are source-aware. The controller aggregates recorded node or agent token usage only when a handoff or ledger event provides it; missing nodes are shown as missing records, not zero cost.

Use `--lang zh-CN` to render Simplified Chinese board labels. Use `--open` to ask the controller to open the generated HTML with the system default browser. If the browser cannot be opened automatically, the files remain in place and the command prints the HTML path.

The board is intentionally static. It does not automatically start agents, enforce claims, run tests, poll files, sync remote state, or replace `validate`, `resume`, handoffs, or delivery gates. It can record and display multiple agents, worker lanes, logical parallel groups, and handoff evidence when Codex or another worker writes those records.

## Files

```text
.omykit/
  workflows/
    <workflow-id>/
      graph.json
      state.json
      ledger.jsonl
      decisions.md
      blockers.md
      nodes/
      handoffs/
      evidence/
      board.json
      board.html
```

`graph.json` defines the DAG. `state.json` records current node status and may track multiple `active_nodes` for parallel work. `ledger.jsonl` is append-only event history. `nodes/` contains task cards. `handoffs/` contains structured node results. `evidence/` contains command output, screenshots, summaries, or export evidence. `board.json` and `board.html` are generated read-only views and can be regenerated at any time.

## Compact Recovery

After compact or interruption, read in this order:

1. `state.json`
2. `graph.json`
3. latest relevant `ledger.jsonl` events
4. active, ready, failed, or blocked node cards
5. related handoff and evidence summaries

Only return to full source files or full evidence when exact edits, quotes, security/legal/privacy judgment, or failure root cause requires it.

## What It Does Not Do

- It does not automatically spawn agents.
- It does not treat `parallel_group` as proof of physical concurrency; actual worker activity should be recorded in handoffs or ledger events.
- It does not call an LLM.
- It does not run tests automatically unless Codex or a user runs commands.
- It does not replace local project conventions.
- It does not make Lite work heavy by default.

See [task-graph.md](task-graph.md) and [handoff-protocol.md](handoff-protocol.md).
