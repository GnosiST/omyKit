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
  "summary": "Implemented the scoped change and updated the focused tests.",
  "work_items": [
    {
      "title": "Add empty-state copy fallback",
      "status": "done",
      "detail": "Kept the existing API contract and only changed the UI fallback branch.",
      "files": [
        "src/foo.ts"
      ],
      "evidence": [
        "evidence/03-implement-test-output.txt"
      ]
    }
  ],
  "outputs": [
    "src/foo.ts",
    "tests/foo.test.ts"
  ],
  "changed_files": [
    {
      "path": "src/foo.ts",
      "status": "modified",
      "summary": "Added empty-state fallback."
    }
  ],
  "verification": [
    {
      "command": "npm test -- foo",
      "result": "passed",
      "evidence": "evidence/03-implement-test-output.txt"
    }
  ],
  "agent_activity": [
    {
      "agent_id": "agent-1",
      "role": "coder",
      "task": "Implement scoped fallback and test.",
      "status": "done",
      "evidence": [
        "evidence/03-implement-test-output.txt"
      ],
      "token_usage": {
        "source": "tool_reported",
        "model": "gpt-5.4",
        "total_tokens": 18420
      }
    }
  ],
  "token_usage": {
    "source": "derived_from_agent_activity",
    "total_tokens": 18420,
    "notes": "Summed from recorded agent activity."
  },
  "open_risks": [],
  "non_blocking_notes": [],
  "next_recommended_node": "04-verify"
}
```

Use `work_items` and `changed_files` to make the board a task tracker instead of a generic status board. Use `agent_activity` when a subagent, worker, reviewer, or external collaborator actually did work.

Token records must be source-aware. Record exact provider/tool-reported usage when available; otherwise use `manual`, `estimated`, or omit the record. Do not invent Codex Desktop or chat token counts when the environment does not expose them.

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
- Keep token usage source-aware; when usage is unavailable, leave it missing instead of estimating zero.

See [task-graph.md](task-graph.md) for node states and [controller.md](controller.md) for commands.
