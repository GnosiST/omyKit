# Workflow Controller

Language: [English](controller.md) | [简体中文](controller.zh-CN.md)

The omyKit workflow controller is a local C-lite state machine for long, resumable, or multi-node Codex work. It complements the skill layer; it does not replace Codex, run models, edit code by itself, or act as a background service.

Use it when a task needs durable state, structured handoffs, retry visibility, or continuation after compact.

## Execution Surfaces

| Surface | Responsibility | Default |
| --- | --- | --- |
| Main Codex thread | Orchestrate, observe, dispatch, integrate handoffs, audit scorecards, and escalate real human blockers. | Required |
| Board/observer view | Inspect progress, evidence, logs, handoff packets, model/skill/usage records, and improvement actions. | Recommended for long work |
| Subagent | Handle one bounded node or subtask and return a structured handoff. | Use only when work can be split or context should be isolated |
| Second Codex main window | Pure observer or human intervention surface. | Optional; use only for team collaboration or explicit separation of observing and execution |

The default can stay in one Codex conversation: the main thread reads controller state, opens the board as an observer surface when useful, and delegates bounded workers through subagent tools. Do not force two windows for every task. The important invariant is that each worker receives only the node `context-pack` and writes back a handoff.

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
$omykit 开始执行：重构登录模块
$omykit 只创建工作流：重构登录模块
$omykit 查看工作流状态
$omykit 继续工作流
$omykit 派发计划
$omykit 交接包
$omykit 查看工作流列表
$omykit 切换工作流：<workflow-id>
$omykit 解除阻塞
$omykit 下一步
$omykit 生成看板并打开
$omykit 校验工作流
```

Codex should choose the project-local controller script when present, otherwise the globally installed script, run the command, and report the status, next action, generated board paths, task-tracker highlights, skill usage, recommended and actual model records, token/context coverage, timing or ETA signals, failed/blocked nodes, generated improvement actions, and residual risk.

Use shell commands directly only for automation, CI, troubleshooting, or when Codex cannot operate the local shell.

## Long Task Execution

Creating a workflow is not completion. `init` only creates durable state. For long work, Codex should continue after creation unless the user explicitly says `only create`, `skeleton only`, or `do not execute`.

Execution loop:

1. `resume` or `next` identifies running, failed, blocked, and ready nodes; when a node is running, converge it with handoff/block/reject before expanding parallel work.
2. `start <node-id>` marks the node active.
3. If the node will be delegated or resumed after compaction, generate `context-pack <node-id>` first.
4. Codex performs that node's real work in the current project.
5. For dev servers, test watchers, long builds, or screenshot services, record command metadata with `record-run` when recovery depends on logs, pid, or resume commands.
6. Codex writes a structured handoff with work items, evidence, `downstream_context`, skills/model/usage when available, and delivery `evolution_candidates`.
7. Codex runs `complete`, `reject`, `block`, or `unblock` after a recorded blocker is resolved.
8. The loop repeats until delivery passes, a real blocker needs the user, or the user asks to stop.

Use `$omykit 开始执行：<任务>` or `$omykit 创建并执行工作流：<任务>` when you want Codex to create/resume and keep advancing. Use `$omykit 只创建工作流：<任务>` only when you want the skeleton and manual continuation commands.

## Subagent Dispatch

For tracked long work, the main Codex thread should behave as an orchestrator-observer: keep the durable workflow state, create or read the dispatch plan, spawn bounded subagents when the task is independently scoped, integrate handoffs, run scorecards, and escalate only true human blockers. Do not switch the main thread's model for a worker task; that risks losing the main coordination context.

Use:

```bash
node scripts/omykit-workflow.mjs dispatch-plan --workflow <workflow-id>
node scripts/omykit-workflow.mjs dispatch-plan --workflow <workflow-id> --json
```

The dispatch plan lists ready nodes, suggested worker profile, subagent role, recommended model tier, recommended concrete model, Codex model override name when known, context pack, and handoff contract. The controller still does not spawn agents or call models by itself. Codex can pass the recommended model override only when the active subagent runtime exposes a `model` parameter; otherwise the worker inherits the main model and the handoff should record the recommended-vs-actual gap. If actual model metadata is hidden, record `agent_activity[].model_unavailable_reason` instead of inventing a model name.

## Thread-Native Multi-Agent Coordination

The Codex app can also run background work in separate threads or worktrees. The current omyKit controller records coordination plans and handoffs, but it does not yet create threads, manage worktrees, or maintain a runtime thread roster. The next stage should treat this as a second `dispatch-plan` execution backend, not as a replacement for existing subagents:

| Surface | Good for | Constraint |
| --- | --- | --- |
| `subagent` | Same-turn parallel exploration, review, test analysis, and short tasks. | Uses more tokens; not ideal for long-running background code edits. |
| `background_thread` | Long tasks, independent research, or work the user may inspect or continue later. | Record thread id, handoff, and returned summary in the workflow. |
| `thread_worktree` | Heavier write tasks that need branch isolation or should not disturb the local checkout. | Do not let multiple workers edit the same file set by default; define worktree handoff strategy. |

See [multi-agent-coordination.md](multi-agent-coordination.md) for feasibility and design details. Until this is implemented formally, independent threads must still follow three constraints: each thread has a clear role and write scope, receives only the node `context-pack`, and writes a structured handoff back to the active workflow.

## Context Packs

`context-pack` generates the smallest executable context for one node:

```bash
node scripts/omykit-workflow.mjs context-pack 03-plan --workflow <workflow-id> --lang en
```

It writes:

```text
.omykit/workflows/<workflow-id>/context-packs/<node-id>.json
```

The pack contains `workflow_id`, the target node contract, dependency handoff summaries, upstream `downstream_context`, recent relevant events, active command runs, and resume pointers. It does not copy the whole conversation or the whole project source. A subagent or resumed Codex thread should read the context pack first, then load exact source files only when the node needs edits, quotes, root-cause analysis, or safety-sensitive judgment.

## Command Run Records

The controller does not own processes and does not pretend it can recover arbitrary shell sessions. For long commands that affect continuation, Codex should record the run facts:

```bash
node scripts/omykit-workflow.mjs record-run 05-verify \
  --id dev-server \
  --command "npm run dev" \
  --status running \
  --pid 4242 \
  --log .omykit/workflows/<workflow-id>/commands/dev-server.log \
  --resume "npm run dev"
```

Records append to `commands/commands.jsonl` and appear in `resume` plus the board. Typical background commands are dev servers, test watchers, long builds, browser capture jobs, screenshot services, data imports, and local container checks. After interruption, inspect the run record, log path, and resume command before deciding whether to wait, restart the command, or block the node.

## Runtime Location

When installed globally, omyKit places the controller here:

```text
${CODEX_HOME:-$HOME/.codex}/omykit/scripts/omykit-workflow.mjs
${CODEX_HOME:-$HOME/.codex}/omykit/schemas/*.schema.json
${CODEX_HOME:-$HOME/.codex}/omykit/workflow-templates/
```

Inside the omyKit source repository, use:

```bash
node scripts/omykit-workflow.mjs status
```

In a target project, prefer a project-local `scripts/omykit-workflow.mjs` if present. Otherwise use the global installed controller path.

## Commands

```bash
node scripts/omykit-workflow.mjs init "feature title"
node scripts/omykit-workflow.mjs init "bug title" --template bugfix.standard
node scripts/omykit-workflow.mjs init "UI redesign" --template frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs workflows
node scripts/omykit-workflow.mjs workflows use <workflow-id>
node scripts/omykit-workflow.mjs templates list --lang zh-CN
node scripts/omykit-workflow.mjs templates show frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs templates validate
node scripts/omykit-workflow.mjs status
node scripts/omykit-workflow.mjs next
node scripts/omykit-workflow.mjs validate
node scripts/omykit-workflow.mjs scorecard
node scripts/omykit-workflow.mjs dispatch-plan --json
node scripts/omykit-workflow.mjs context-pack 03-implement
node scripts/omykit-workflow.mjs record-run 05-verify --id test-watch --command "npm test -- --watch" --status running --log .omykit/workflows/<workflow-id>/commands/test-watch.log --resume "npm test -- --watch"
node scripts/omykit-workflow.mjs start 03-implement
node scripts/omykit-workflow.mjs complete 03-implement --handoff handoffs/03-implement-to-04-verify.json
node scripts/omykit-workflow.mjs reject 04-verify --to 03-implement --handoff handoffs/04-verify-to-03-implement.reject.json
node scripts/omykit-workflow.mjs block 02-design --reason "Waiting for user confirmation"
node scripts/omykit-workflow.mjs board
node scripts/omykit-workflow.mjs board --open --lang zh-CN
node scripts/omykit-workflow.mjs resume
```

Commands operate on `.omykit/workflows/<workflow-id>/` in the current project. `init` writes `.omykit/active-workflow`. When multiple workflows exist, run `workflows`, select with `workflows use <workflow-id>`, or pass `--workflow <workflow-id>`. Without an active workflow and with multiple workflows present, the controller refuses to guess to avoid resuming the wrong task.

## Workflow Templates

`init` compiles a reusable YAML workflow template into the project-local runtime files under `.omykit/workflows/<workflow-id>/`. YAML is the human-editable source; `graph.json`, node cards, `state.json`, handoffs, and board projections remain the runtime contract.

Built-in templates:

| Template | Use |
| --- | --- |
| `change.standard` | Default scoped feature, refactor, docs, or maintenance work. |
| `bugfix.standard` | Reproduce, diagnose, fix, verify, review, and deliver bug fixes. |
| `frontend-ui.strict` | Design-sensitive frontend work with UI direction, implementation, browser/visual QA, review, and delivery. |

Templates are layered:

| Layer | Purpose |
| --- | --- |
| graph topology | Node ids, node types, dependencies, retry limits, joins, handoff targets. |
| agent profile | Role names and scope boundaries used by node cards and handoffs. |
| model profile | Recommended model-tier policy and concrete model map; actual provider/model remains execution metadata. |
| runtime profile | Expected local verification context such as project default, browser QA, or docs-only work. |
| safety limits | Retry, parallelism, permission, and stop-condition guidance. |
| scorecards | Evidence checks that audit handoffs, verification, usage records, language, model-tier policy, and delivery evolution review. |

To add a node, edit the relevant template YAML. To change who should do a step, edit the agent layer or node `agent` field. To change model policy, edit the model profile, node tier, or node-level recommendation. This keeps topology, agents, models, runtime, safety, and scoring independently reviewable.

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

`board.json` is a stable projection for tools and tests. `board.html` is a self-contained dashboard you can open in a browser. It shows clickable command-center metrics, intake decisions, a task tracker, actual node work items, downstream handoff context, handoff packets, command run records, changed-file summaries, skill usage, verification results, evidence availability, workflow evolution candidates, agent activity, model-tier policy, recommended concrete models, actual model records, token/context coverage, timing and ETA estimates, project snapshot, Git branch/commit/status, dependency and reject edges, parallel groups, worker profile lanes, blockers, decisions, retry alerts, recent ledger events, and generated improvement actions.

Token, context, skill, and actual-model totals are source-aware. The controller aggregates recorded node or agent usage only when a handoff or ledger event provides it; missing nodes are shown as missing records, not zero cost. Recommended models come from the selected `model_profile` and node policy; actual models come from `handoff.model`, `handoff.token_usage.model`, `agent_activity[].model`, or `agent_activity[].token_usage.model`.

Board language follows this order: explicit `--lang`, workflow metadata language, latest handoff language, then title-language inference. Use `--lang zh-CN` only when you need to override the workflow language. In Codex Desktop, Codex should return the generated `board.html` path as a local link and open it in the built-in browser when that surface is available. The CLI `--open` fallback asks the operating system to open the generated HTML with the system default browser; if that fails, the files remain in place and the command prints the HTML path.

The board also renders the selected workflow template and scorecard audit. Scorecards inspect recorded evidence; they do not trust natural-language completion claims by themselves. Passed intake nodes must record `intake_decision`, including route, workflow shape, assumptions, and custom-answer policy. Passed delivery nodes must record `evolution_candidates`; an empty array means the delivery was reviewed and no reusable lesson was found. Generic candidates are surfaced as improvement actions for `codex-workflow-evolution` review. Failed scorecard checks become improvement actions with affected node links when possible. Skill-usage and actual-model checks are recommended warnings: they expose missing records without forcing fake skill or model records where the runtime did not expose them.

The board is intentionally static. It does not automatically start agents, enforce claims, choose a provider model, infer skill usage, run tests, poll files, sync remote state, or replace `validate`, `resume`, handoffs, or delivery gates. It can record and display multiple agents, worker lanes, logical parallel groups, skill usage, model-tier recommendations, recommended models, actual model records, timing, usage, and handoff evidence when Codex or another worker writes those records.

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
      context-packs/
      commands/
      evidence/
      board.json
      board.html
```

`graph.json` defines the DAG. `state.json` records current node status and may track multiple `active_nodes` for parallel work. `ledger.jsonl` is append-only event history. `nodes/` contains task cards. `handoffs/` contains structured node results. `context-packs/` stores minimal context packets for recovery or subagents. `commands/` stores command run records and optional logs. `evidence/` contains command output, screenshots, summaries, or export evidence. `board.json` and `board.html` are generated read-only views and can be regenerated at any time.

## Compact Recovery

After compact or interruption, read in this order:

1. `.omykit/active-workflow` or explicit `--workflow <id>`
2. `state.json`
3. `graph.json`
4. `context-packs/<node-id>.json` for the running or ready node; generate it first when missing
5. latest relevant `ledger.jsonl` events
6. active, ready, failed, or blocked node cards
7. related handoff, command run, and evidence summaries

Only return to full source files or full evidence when exact edits, quotes, security/legal/privacy judgment, or failure root cause requires it.

## What It Does Not Do

- It does not automatically spawn agents.
- It does not treat `parallel_group` as proof of physical concurrency; actual worker activity should be recorded in handoffs or ledger events.
- It does not call an LLM.
- It does not run tests automatically unless Codex or a user runs commands.
- It does not replace local project conventions.
- It does not make Lite work heavy by default.

See [task-graph.md](task-graph.md) and [handoff-protocol.md](handoff-protocol.md).
