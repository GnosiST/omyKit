# Task Graph

Language: [English](task-graph.md) | [简体中文](task-graph.zh-CN.md)

The controller uses a directed acyclic graph. Each node has one responsibility, explicit dependencies, acceptance criteria, and a handoff requirement.

Graphs are normally compiled from workflow templates such as `change.standard`, `bugfix.standard`, `frontend-ui.strict`, or `mission.orchestration`. You can still inspect and edit the generated `graph.json`, but durable changes should usually be made in template/profile YAML so the workflow remains reusable.

## Node Types

| Type | Responsibility |
| --- | --- |
| `intake` | Capture goal, constraints, deliverable, language, and success criteria. |
| `research` | Gather bounded evidence without changing artifacts. |
| `design` | Choose approach, boundaries, risks, and verification strategy. |
| `plan` | Break accepted design into executable steps. |
| `implement` | Modify code, docs, config, or artifacts. |
| `verify` | Run checks and record pass/fail/skipped evidence. |
| `review` | Review quality, risks, omissions, or specialist fit. |
| `delivery` | Package final evidence and completion status. |
| `evolution` | Promote reusable workflow lessons into omyKit only when justified. |

## Statuses

```text
pending -> ready -> running -> passed
                         |-> failed
                         |-> blocked
                         |-> skipped
```

| Status | Meaning |
| --- | --- |
| `pending` | Dependencies are not satisfied. |
| `ready` | Dependencies are satisfied and the node can run. |
| `running` | Work is in progress. |
| `passed` | The node completed with a valid handoff. |
| `failed` | The node found a problem and must reject to an upstream node or be resolved. |
| `blocked` | The node needs user confirmation, access, credentials, external state, or a missing tool. |
| `skipped` | The node was intentionally skipped with a reason and impact. |

## Patterns

- **Serial:** a node becomes ready when dependencies pass or are explicitly skipped.
- **Parallel:** unrelated ready nodes can proceed independently.
- **Fan-out:** one brief can feed multiple research, implementation, or review nodes.
- **Join:** synthesis, verification, or delivery nodes wait for all required dependencies.
- **Reject:** a failed node names `reject_to`, evidence, and required fix.
- **Block:** a blocked node should not stop unrelated ready nodes.
- **Skip:** skipped required work must state why and what risk remains.

## Collaboration Metadata

Nodes may include optional collaboration fields. They are routing and display metadata for the board; they do not automatically dispatch workers.

| Field | Meaning |
| --- | --- |
| `worker_profile` | Suggested worker lane such as `planner`, `researcher`, `coder`, `tester`, `reviewer`, `delivery`, or a project-specific profile. |
| `claimed_by` | Current responsible actor. The controller displays it but does not enforce ownership. |
| `parallel_group` | A named group that can be scanned as a parallel branch or work lane. |
| `join_policy` | How a downstream join should reason about the group: `all_required`, `any_passed`, or `manual_review`. |
| `lease_expires_at` | Future timeout or takeover metadata. The current controller only displays it. |
| `handoff_target` | Default downstream handoff target for board readability. It must point to an existing node when present. |
| `task_complexity` | Supplier-independent difficulty signal: `simple`, `standard`, `complex`, or `expert`. |
| `model_tier` | Recommended model tier: `fast`, `standard`, or `frontier`; the controller records the policy but does not call a model. |
| `model_selection_reason` | Short explanation for why that tier is appropriate. |
| `recommended_model` | Optional concrete model recommendation. If omitted, the controller derives it from the active `model_profile` and node policy. |
| `recommended_model_reason` | Short explanation for the concrete model recommendation. |
| `estimated_minutes` | Planning estimate used for board ETA and remaining-time calculations. |
| `agent` | Template-level role id expected to execute or own the node. |
| `model_profile` | Template-level model policy reference. |
| `runtime_profile` | Template-level runtime or verification environment reference. |
| `safety_profile` | Template-level safety limit reference. |
| `scorecard` | Scorecard id used to audit the node's evidence. |

These fields prevent similar capabilities from fighting by keeping responsibility explicit: the graph owns dependency order, node cards own local acceptance, handoffs own evidence, and the board only visualizes the resulting state.

For multi-agent work, treat this as two layers:

- `parallel_group`, `worker_profile`, `claimed_by`, and `join_policy` describe the logical collaboration map.
- `agent_activity` in handoffs and related ledger events describe actual worker activity, including scope, task, status, evidence, skill usage, token usage, context usage, and timestamps when available.
- `orchestrate` is the user-facing bridge between the two: it reads ready nodes and model policy, writes `orchestration-plan.json`, and returns whether Codex should run the node in the main thread, a same-turn subagent, a background thread, or a worktree. `dispatch-plan` remains a lower-level primitive for diagnostics and controller internals.
- `downstream_context` is the compressed fact packet a node carries forward: target nodes, inputs, evidence, risks, and context budget.
- `context-pack` is the controller-generated minimal executable context for one node or worker, built from state, graph, the node card, dependency handoffs, `downstream_context`, recent events, and command run records. Codex usually generates it internally when `orchestrate` recommends delegation or compact-safe recovery.
- `commands/commands.jsonl` records long-command facts such as dev servers, test watchers, long builds, and screenshot services. It does not mark a node as passed and does not replace a handoff.

Do not treat a logical parallel group as proof that work physically ran at the same time unless timestamps or agent activity records show it.

Use `model_tier` to avoid over-spending on simple work: `fast` for clear bounded tasks, `standard` for ordinary implementation and verification, and `frontier` for architecture, design judgment, high-risk review, or unresolved ambiguity. The active `model_profile` maps tiers to recommended concrete models and may add node-specific overrides. Codex Desktop worker tools support model overrides, so the main orchestrator should pass the orchestration plan's recommended model to subagents or new threads while keeping the main thread model stable. Record actual provider/model names only in handoff execution metadata, because the controller recommends but does not call models. If a non-Codex runtime cannot override or expose model metadata, record the recommendation/actual gap and `model_unavailable_reason`.

## Retry Limits

Each graph node has `retry_limit`. When the same reject edge exceeds the target node's limit, the controller blocks the target node and requires human decision or design review. This prevents quiet loops.

## Validation

`node scripts/omykit-workflow.mjs validate` checks:

- required workflow files exist
- graph has no duplicate node ids
- dependencies point to existing nodes
- dependency graph has no cycle
- state entries match graph nodes
- node statuses are valid
- collaboration metadata has valid types and join policies
- node cards exist
- handoff files have required fields

See [controller.md](controller.md), [workflow-templates.md](workflow-templates.md), and [handoff-protocol.md](handoff-protocol.md).
