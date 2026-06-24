---
name: omykit
description: User-facing entry point for Codex Workflow Kit. Use when the user says omyKit, omykit, help, 帮助, 怎么用, 初始化项目, 改造旧项目, 开始一个需求, 交付检查, 收尾, 整理文档, 安装 omyKit, 更新 omyKit, 生成看板, 查看进度, 继续工作流, 升级旧工作流, 诊断工作流健康, 清理旧工作流残留, 工作流列表, or asks Codex to initialize, retrofit, run, verify, install, update, inspect, resume, explain, clean up knowledge, or visualize app, deck, video, design, research, data, or mixed projects with a guided workflow.
---

# omyKit

Use this as the front door for Codex Workflow Kit. Keep it short; route to the specific workflow skill after the first decision.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

## Control

Use omyKit at task boundaries, not for every action. Route once at intake, when scope/risk changes, or before final delivery. After routing, continue normal execution until new evidence requires a different workflow.

## Tool Priority

Prefer official, first-party, dedicated, or project-native tools before generic GUI automation. Use Computer Use only when no suitable official/bundled connector, MCP/plugin, browser automation, shell/API path, or project script can complete the local GUI task. Do not use Computer Use for code edits, shell work, browser tasks with dedicated tools, or risky UI actions that need explicit user confirmation.

When the target platform provides an official CLI or automation surface, treat it as the preferred tool for that platform and record it in project-local runtime/tool guidance when useful. Examples include WeChat Mini Program developer tools CLI for mini-program preview/upload/build checks, Xcode tools for iOS, Android/Gradle tools for Android, and project framework CLIs. Add these by project evidence; do not hard-code every ecosystem tool into omyKit.

## Codex-First Operations

Treat terminal commands as internal implementation details. When the user asks in Codex chat to install, update, inspect, resume, validate, or visualize omyKit workflow state, run the needed local command for them and report the result.

For omyKit maintenance:

- first-time install from Codex can only start from a plain user request because `$omykit` is not available yet; after install, tell the user to open a fresh Codex thread
- update/reinstall omyKit with the current trusted checkout when available; otherwise use the official repository URL the user supplied or `https://github.com/GnosiST/omyKit`
- run `./scripts/install-global.sh` from the omyKit checkout, then confirm `${CODEX_HOME:-$HOME/.codex}/omykit/install-manifest`

For controller and board requests, use the first available script:

1. project `scripts/omykit-workflow.mjs`
2. `${CODEX_HOME:-$HOME/.codex}/omykit/scripts/omykit-workflow.mjs`

Map user intent to commands:

- task brief, bug, UI issue, test request, or follow-up work -> internally run `tasks add "<brief>" --lang <user-language>` first so the controller can decide `merge_current`, `linked_follow_up`, or `new_workflow`; users should not need to choose merge, parallel, or conflict primitives manually
- create or execute tracked workflow -> after task intake, run `init --template auto --lang <user-language>` only when the task decision requires a new workflow and no suitable active workflow exists; controller auto-selects `change.standard`, `bugfix.standard`, `frontend-ui.strict`, or `mission.orchestration`, and explicit user template requests override auto
- continue execution -> `resume`, then `orchestrate --json --lang <user-language>`; follow the orchestration plan internally instead of asking the user to choose subagent, thread, context-pack, or assignment commands
- skeleton-only workflow -> run only `init` when the user explicitly says `只创建`, `只初始化`, `skeleton only`, or `do not execute`
- inspect workflow templates -> `templates list`, `templates show <template-id>`, or `templates validate`
- progress/status -> `status`
- next work -> `orchestrate --lang <user-language>` or `next`; both should show the automatic orchestration decision, not only raw ready nodes
- task inbox/debugging the merge gate -> `tasks list --json` only when the user asks why a request was merged, linked, or split
- upgrade historical workflow artifacts -> `upgrade --all --lang <user-language>` when old `.omykit/workflows/*` should use the latest controller metadata, command surface, node cards, and board projection rules
- diagnose project workflow health -> `doctor --lang <user-language>` to inspect retrofit completeness, active workflow pointer, legacy workflows, stale boards, command recovery, cleanup candidates, and next recommendations; add `--fix` only for safe compatibility repairs
- cleanup legacy workflow residue -> `cleanup --dry-run --lang <user-language>` first; run `cleanup --apply` only after review because it archives safe candidates into `.omykit/archive/` instead of deleting them
- list or switch tracked workflows -> `workflows` or `workflows use <workflow-id>`
- record long-running command metadata -> `record-run <node-id> --id <run-id> --command <cmd> --status <status> --log <path> --resume <cmd>`
- continue after interruption -> `resume`
- validate workflow files -> `validate`
- scorecard audit -> `scorecard --lang <user-language>`
- generate or open board -> `board --open`; pass `--lang <user-language>` only when overriding workflow language; use `zh-CN` for Simplified Chinese prompts and `en` otherwise

In Codex Desktop, after generating a board, return the local `board.html` link and open it in the built-in browser when that surface is available. Treat CLI `--open` as a system-browser fallback, not as the only UX.

If there are multiple workflows and no active workflow is selected, run `workflows`, choose only when safe, otherwise ask which workflow to use; then run `workflows use <workflow-id>` or pass `--workflow <workflow-id>`. If the controller script is missing, tell the user omyKit must be installed or reinstalled first.

For long tasks, do not stop after creating the workflow. Creation only establishes state. Unless the user asked for a skeleton only, continue the loop:

1. `resume` and `orchestrate --json` to identify running, failed, blocked, ready, parallelizable, and externally claimed nodes.
2. Let the orchestration plan decide whether the next node runs in the main thread, same-turn subagent, background thread, or worktree. Do not ask the user to pick this unless no safe automatic route exists.
3. Execute that node's real work.
4. For delegated or resumed work, internally generate `context-pack <node-id>` and pass only that bounded packet plus exact files that the node needs.
5. Internally record worker/thread assignment with `assign` only after a worker or thread actually exists.
6. Record long-running shell/server/test watcher metadata with `record-run` when interruption recovery depends on logs, pid, or resume commands.
7. Write a structured handoff with actual work items, evidence, `downstream_context`, skills/model/usage when available, and `evolution_candidates` for delivery nodes.
8. `complete`, `reject`, or `block` the node.
9. Repeat until delivery passes, a real blocker requires the user, or the user explicitly asks to stop.

When reporting a newly created workflow, always tell the user whether Codex will keep executing now, which node is next, and the exact continue command for manual fallback.

## Help

When the user asks for `help`, `帮助`, `怎么用`, available commands, or how to use omyKit, answer directly in the user's language. Do not start a workflow, inspect the repository broadly, or generate a board unless the user also asks for that action.

Include these concise groups:

- start: `$omykit 初始化项目`, `$omykit 改造旧项目`, `$omykit 开始一个需求`
- execute long work: `$omykit 开始执行：<任务>`, `$omykit 创建并执行工作流：<任务>`, `$omykit 继续工作流`, `$omykit 推进下一步`
- skeleton only: `$omykit 只创建工作流：<任务>`, `$omykit 只初始化 workflow：<任务>`
- tracked workflow: `$omykit 创建工作流：<任务>`, `$omykit 查看工作流状态`, `$omykit 下一步`, `$omykit 查看当前节点`, `$omykit 解除阻塞`, `$omykit 查看工作流列表`, `$omykit 切换工作流：<id>`
- task-specific shortcuts: `$omykit 修 bug：<问题>`, `$omykit 做 UI：<页面>`, `$omykit 做调研：<主题>`, `$omykit 跑测试：<范围>`
- recovery: `$omykit 解除阻塞`, `$omykit 阻塞已解决，继续执行`
- board and audit: `$omykit 生成看板并打开`, `$omykit scorecard 验票`, `$omykit 校验工作流`
- health and cleanup: `$omykit 诊断工作流健康`, `$omykit 修复工作流健康`, `$omykit 清理旧工作流残留`
- maintenance: `$omykit 更新自己`, `$omykit 升级旧工作流`, `$omykit 交付检查`, `$omykit 收尾`, `$omykit 整理文档`
- templates: `$omykit 查看模板`, `$omykit 查看 frontend-ui.strict 模板`
- diagnostics, only when asked: `$omykit 查看编排计划`, `$omykit 导出交接包`, `$omykit 查看 Agent 通讯录`

Explain that task-specific shortcuts go through the controller task inbox first. The merge gate automatically decides whether to add the request to the current workflow, link it as a follow-up to a completed workflow, or create a new workflow. Users normally do not run `tasks add/list`; those are debugging primitives for Codex and maintainers.

Mention that `$omykit` is a Codex chat trigger, not a shell prompt. If the user wants terminal fallback, give only the local controller examples they need, such as `node scripts/omykit-workflow.mjs help`, `workflows`, `orchestrate`, `upgrade --all`, `templates list`, `status`, or `board --open`. Do not present `tasks`, `dispatch-plan`, `context-pack`, or `assign` as normal user choices; they are internal primitives unless the user is debugging the controller.

## Start

Apply `codex-context-budget` and stay in `scan`.

Run an intake decision gate before edits, installs, controller state changes, broad tool use, or long-running work. For help, status, board, template inspection, validation, install, or update requests, use the matching direct operation instead of forcing a change workflow.

The intake gate must settle or show:

- `Goal`: one-sentence user goal.
- `Route`: entry type, project type, mode, and next skill.
- `Workflow`: direct Lite/Standard execution or tracked controller workflow with the nearest template.
- `Execution options`: 2-3 viable approaches, one recommended approach, tradeoffs, and what will happen after confirmation.
- `Assumptions`: only assumptions that affect deliverables, target project, risk, runtime, language, or versioning.
- `Questions`: ask only when a wrong assumption would change the deliverable, target project, risk mode, destructive action, runtime/deployment constraint, workflow template, or controller choice.

Before real execution, present the execution options and recommended option, then get user confirmation or use the user's explicit auto-authorization if they already said to proceed by judgment. Do not start implementation, destructive commands, worker dispatch, or long-running execution before this confirmation gate. If questions are needed, ask 1-3 concise questions before implementation. Questions may include suggested choices, but must explicitly allow a custom answer. Do not repeat the intake gate for routine file reads, edits, commands, or verification; rerun it only when scope, risk, artifact type, or user intent changes.

For tracked workflows, the intake handoff must record `execution_options`, `selected_option`, and `confirmation`. Use `confirmation.status=confirmed` when the user chose or accepted a plan, `auto_authorized` when the user explicitly asked Codex to proceed by professional judgment, `changed` when the user corrected the plan before execution, and `pending` only when execution has not started yet.

Classify the user request:

1. `maintenance`: install, update, reinstall, rollback, or inspect omyKit itself.
2. `controller`: create, inspect, resume, validate, or visualize a tracked workflow.
3. `init`: initialize a new project.
4. `retrofit`: add the kit to an existing project.
5. `change`: start a feature, bug fix, refactor, design pass, deck/video edit, research task, or data analysis.
6. `delivery`: verify, export, hand off, commit, or prepare release.

If the entry is unclear, infer when safe and state the assumption. Ask only when a wrong route would waste work or change risk.

For controller entries, distinguish user intent:

- `execute`: phrases like `开始执行`, `创建并执行`, `继续`, `推进`, `跑完整个工作流`, or a task brief without `只创建` mean Codex should advance nodes after controller setup.
- `inspect`: phrases like `状态`, `进度`, `下一步`, `看板`, `scorecard`, `校验`, `健康`, `诊断`, `清理残留`, or `模板` mean run the matching direct operation and report; for `下一步`, prefer `orchestrate` so the user sees the automatic decision.
- `skeleton_only`: phrases like `只创建`, `只初始化`, `先建骨架`, or `不要执行` mean create state only and return the next command.

## Project Type

If project type is unclear, infer from the current folder and user request. When asking, offer these options as suggestions and explicitly allow a custom answer:

1. app development
2. maintenance/refactor
3. deck/presentation
4. video/editing
5. design/prototype
6. research/document
7. data/spreadsheet
8. mixed

## Mode

Recommend one mode, but let the user override:

- `Lite`: one-off, low-risk.
- `Standard`: default.
- `Strict`: durable, client-facing, high-risk, architecture, security, migration, or broad blast radius.

When asking about mode, allow the user to answer with `Lite`, `Standard`, `Strict`, or free-form constraints such as "fast pass", "very cautious", or "client-ready".

## Route

- `maintenance` -> handle directly with the omyKit repository scripts; then report install/update evidence
- `controller` -> handle directly with `omykit-workflow.mjs`; then report status, next action, board paths, task-tracker highlights, improvement actions, skill usage, recommended and actual model records, token/context coverage, timing or ETA signals, failed/blocked nodes, or validation evidence
- `init` -> `codex-project-init`
- `retrofit` -> `codex-project-retrofit`
- `change` -> `codex-change-workflow`
- `delivery` -> `codex-delivery-gate`

For app work that needs middleware, include `codex-runtime-readiness`.
For durable, release, migration, rollback, history, or customization concerns, include `codex-version-readiness`.

Read [commands.md](references/commands.md) for supported natural-language entry phrases.

## Agent And Cost Signals

Use subagents only when work can be split into independent, bounded scopes. For tracked long work, keep the main Codex thread as an orchestrator-observer: it reads workflow state, runs `orchestrate` to decide execution shape, internally uses dispatch/context-pack/assignment primitives when needed, starts/blocks/completes nodes, integrates handoffs, audits scorecards, and escalates only true human blockers. Do not switch the main thread's model for a worker task; that risks losing the main context. Spawn subagents with bounded node context instead.

When the orchestration plan recommends separate/background threads and the Codex app exposes thread-management tools, prefer thread or worktree execution for long-running, write-heavy, independently reviewable work. Keep same-turn subagents for short exploration, review, test analysis, and other read-heavy tasks. Independent threads must still receive the node `context-pack`, have a disjoint or clearly bounded write scope, and write a structured handoff back to the active workflow. Record the runtime assignment with `assign` so `assignments.jsonl`, the board Agent Roster, and scorecard checks can audit the thread/worktree facts. Do not imply the controller itself created a Codex thread unless the current runtime tool actually did it.

When `orchestrate --json` returns `action=dispatch_worker`, treat it as an execution contract, not a suggestion to show the user. If the current Codex runtime exposes a matching subagent/thread/worktree tool, create the worker with the node context pack, then run `assign` only after the worker exists. If the runtime cannot create the requested worker, record the unavailable reason in the handoff or assignment notes, safely execute in the main thread only when scope permits, or block the node with the missing capability named. Never silently skip worker creation.

Subagents must hand off through the controller, not through informal chat alone. Before delegation or recovery, generate a context pack for the node. The worker receives that pack, exact files only when needed, and a handoff contract. The completed handoff must include `downstream_context` when later nodes need a compact, accurate carry-forward summary.

Codex Desktop thread and subagent tools may expose model overrides, but tool policy controls whether the active call can set them. For worker creation, map the node's `recommended_model` to the concrete model parameter and pass it only when the current runtime tool and policy allow it, or when the user explicitly authorized the concrete model. Keep the main thread's model stable as the orchestrator-observer; do not switch the main thread to satisfy a worker need. If a non-Codex client, permission boundary, or tool policy prevents model override, omit the override and record the recommendation/actual-model gap. The controller recommends models and records intended assignment; Codex runtime performs the actual worker creation.

Name each agent clearly in handoff `agent_activity`, record role/scope/task/status/mode, and choose the lowest sufficient model tier: `fast` for simple bounded work, `standard` for ordinary implementation or verification, and `frontier` for architecture, design judgment, high-risk review, or unresolved ambiguity. Let the active workflow `model_profile` provide concrete model recommendations, but record actual provider/model only when the runtime exposes it through handoff `model`, `model_provider`, `token_usage.model`, `agent_activity[].model`, `agent_activity[].model_provider`, or `agent_activity[].token_usage.model`. If the runtime hides the actual model, write `agent_activity[].model_unavailable_reason` and node-level `usage_observation.model_status=unavailable` with `model_unavailable_reason` instead of inventing a value. When a node uses a Codex skill, record it in handoff `skills_used`; when a specific worker uses a skill, record it in `agent_activity[].skills_used` with purpose and evidence when available. If several same-lane skills could reasonably apply, also record `skill_decisions` with capability lane, selected skill, selection basis, skipped alternatives, fallback policy, user feedback when available, and outcome. If the user is dissatisfied, follow the recorded fallback instead of stacking every same-lane skill, then update the handoff and consider an `evolution_candidates` lesson if the pattern should improve omyKit. If exact token or context metrics are unavailable, record `usage_observation.token_status=unavailable` with the reason when the node is terminal; do not invent usage numbers.

## Workflow Templates And Scorecards

For tracked controller work, select the nearest reusable template instead of inventing a graph ad hoc:

- `change.standard`: scoped feature, refactor, docs, or maintenance work
- `bugfix.standard`: reproduce, diagnose, fix, verify, review, and delivery loops
- `frontend-ui.strict`: design-sensitive UI work with visual QA and review
- `mission.orchestration`: broad requirements that need demand insight, task decomposition, workflow routing, monitored execution, integration gates, and workflow learning

Do not force strict UI, bugfix, or mission templates onto unrelated work. If no template fits, use `change.standard` and record the mismatch as a possible workflow evolution candidate.

Scorecards audit recorded evidence. Treat failed required scorecard checks as delivery blockers unless the user explicitly accepts the residual risk. Treat recommended scorecard warnings as improvement suggestions, not automatic blockers.

For tracked delivery, record `knowledge_sync` in the delivery handoff. Use `completed` when README/docs/AGENTS or agent memory were reviewed and updated, `not_needed` when no durable knowledge changed, and `deferred` only with a reason. If the installed `neat-freak` skill is available and the task changed durable workflow docs, project rules, or handoff knowledge, use it as the knowledge cleanup pass; do not run it after every node or copy its body into omyKit.

## Drift Guard

Treat drift as a workflow event, not a vague concern. Drift includes changes to the user goal, target project, workflow template fit, acceptance criteria, write scope, evidence quality, model/runtime availability, external upstream behavior, or specialist skill selection.

When drift is non-blocking, record it in the current handoff `non_blocking_notes`, carry it through `downstream_context.carry_forward_risks`, and keep executing. When drift changes acceptance, safety, target project, destructive action, or the selected workflow template, stop the affected node and write a `blocked` or `failed` handoff with the exact upstream node, required fix, and evidence. Do not silently reinterpret the original requirement after compact or worker handoff.

For external reference drift, run `node ./scripts/check-upstream-refs.mjs --force-review` only before releases, larger omyKit workflow revisions, or tasks that depend on current upstream behavior. Ordinary work should rely on the current reviewed baseline unless the task itself requires fresh upstream facts.
