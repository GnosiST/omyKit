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
  "language": "en",
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
  "skills_used": [
    {
      "name": "omykit",
      "source": "local_skill",
      "path": "/Users/example/.codex/skills/omykit/SKILL.md",
      "purpose": "Routed and operated the tracked workflow.",
      "triggered_by": "$omykit",
      "evidence": [
        "evidence/03-implement-test-output.txt"
      ]
    }
  ],
  "agent_activity": [
    {
      "agent_id": "agent-1",
      "role": "coder",
      "scope": "src/foo.ts and tests/foo.test.ts",
      "task": "Implement scoped fallback and test.",
      "status": "done",
      "model_tier": "standard",
      "model_selection_reason": "Scoped implementation with tests; no architecture decision needed.",
      "started_at": "2026-06-23T10:00:00.000Z",
      "completed_at": "2026-06-23T10:24:00.000Z",
      "evidence": [
        "evidence/03-implement-test-output.txt"
      ],
      "skills_used": [
        {
          "name": "codex-change-workflow",
          "source": "local_skill",
          "purpose": "Kept implementation and verification scoped.",
          "evidence": [
            "evidence/03-implement-test-output.txt"
          ]
        }
      ],
      "token_usage": {
        "source": "tool_reported",
        "model": "gpt-5.4",
        "total_tokens": 18420
      },
      "context_usage": {
        "source": "estimated_from_files",
        "context_level": "focus",
        "estimated_tokens": 6200,
        "input_files": 4
      }
    }
  ],
  "token_usage": {
    "source": "derived_from_agent_activity",
    "total_tokens": 18420,
    "notes": "Summed from recorded agent activity."
  },
  "context_usage": {
    "source": "estimated_from_files",
    "context_level": "focus",
    "source_bytes": 24000,
    "estimated_tokens": 6200,
    "input_files": 4
  },
  "timing": {
    "started_at": "2026-06-23T10:00:00.000Z",
    "completed_at": "2026-06-23T10:24:00.000Z",
    "duration_ms": 1440000,
    "estimated_minutes": 30,
    "source": "manual"
  },
  "open_risks": [],
  "non_blocking_notes": [],
  "next_recommended_node": "04-verify"
}
```

Use `language`, `work_items`, `changed_files`, `skills_used`, `context_usage`, and `timing` to make the board a task tracker instead of a generic status board. Use node-level `skills_used` for skills that shaped the node as a whole, and `agent_activity[].skills_used` for skills used by a specific worker. Use `agent_activity` when a subagent, worker, reviewer, or external collaborator actually did work. Each agent entry should have a stable lowercase `agent_id`, role, scope, task, status, optional `model_tier`, and evidence.

Token and context records must be source-aware. If a `token_usage` or `context_usage` object is present, `source` is required. Record exact provider/tool-reported usage when available; otherwise use `manual`, `estimated`, or omit the record. Do not invent Codex Desktop or chat token counts when the environment does not expose them. Use `model_tier` as a supplier-independent policy (`fast`, `standard`, `frontier`); record the actual provider/model only as observed execution metadata.

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
- Record only skills that were actually used; include purpose and evidence when available.
- Keep token usage source-aware; when usage is unavailable, leave it missing instead of estimating zero.

See [task-graph.md](task-graph.md) for node states and [controller.md](controller.md) for commands.
