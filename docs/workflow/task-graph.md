# Task Graph

Language: [English](task-graph.md) | [简体中文](task-graph.zh-CN.md)

The controller uses a directed acyclic graph. Each node has one responsibility, explicit dependencies, acceptance criteria, and a handoff requirement.

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

These fields prevent similar capabilities from fighting by keeping responsibility explicit: the graph owns dependency order, node cards own local acceptance, handoffs own evidence, and the board only visualizes the resulting state.

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

See [controller.md](controller.md) for commands and [handoff-protocol.md](handoff-protocol.md) for node outputs.
