# Handoff Protocol

Language: [English](handoff-protocol.md) | [简体中文](handoff-protocol.zh-CN.md)

Every controller node exits with a structured handoff. The handoff is the contract between nodes and lets the controller decide whether to continue, reject, block, or expose risk.

## Required Base Fields

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "03-implement",
  "status": "passed",
  "summary": "Implemented the scoped change."
}
```

`status` must be `passed`, `failed`, `blocked`, or `skipped`.

## Passed

Use `passed` when the node completed and evidence is available.

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "03-implement",
  "status": "passed",
  "summary": "Implemented the scoped change.",
  "outputs": [
    "src/foo.ts",
    "tests/foo.test.ts"
  ],
  "verification": [
    {
      "command": "npm test -- foo",
      "result": "passed",
      "evidence": "evidence/03-implement-test-output.txt"
    }
  ],
  "open_risks": [],
  "non_blocking_notes": [],
  "next_recommended_node": "04-verify"
}
```

## Failed And Reject

Use `failed` when a node cannot accept upstream output. It must name where to send the work back.

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "04-verify",
  "status": "failed",
  "summary": "Focused regression test failed.",
  "reject_to": "03-implement",
  "reason": "Empty-state behavior regressed.",
  "evidence": [
    "evidence/04-verify-test-output.txt"
  ],
  "required_fix": "Preserve the previous empty-state behavior and rerun the focused test."
}
```

## Blocked

Use `blocked` when progress needs a user decision, credential, access, external state, or missing tool.

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "02-design",
  "status": "blocked",
  "summary": "Delivery policy needs confirmation.",
  "blocker_type": "user_confirmation",
  "question": "Should release tagging be automatic?",
  "blocked_scope": "delivery only",
  "can_continue_nodes": [
    "03-research-current-docs"
  ]
}
```

## Skipped

Use `skipped` only when skipping is intentional and the remaining risk is explicit.

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "05-visual-review",
  "status": "skipped",
  "summary": "No rendered UI changed.",
  "reason": "The change only touched non-visual markdown docs."
}
```

## Rules

- Do not mark a node `passed` without evidence.
- Do not write free-form "done" notes instead of handoff JSON.
- Do not reject without `reject_to`, `reason`, `evidence`, and `required_fix`.
- Do not let a blocked node stop unrelated ready nodes.
- Keep evidence paths retrievable from the workflow directory or target project.
- Keep user-facing summaries in the user's current language.

See [task-graph.md](task-graph.md) for node states and [controller.md](controller.md) for commands.
