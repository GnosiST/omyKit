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

## Intake Decision

Passed intake nodes must record `intake_decision`. This makes the route, workflow choice, assumptions, and question policy auditable instead of relying on a narrative claim.

```json
{
  "intake_decision": {
    "goal": "Implement the tracked settings-page change.",
    "route": {
      "entry": "change",
      "project_type": "app",
      "mode": "Standard",
      "next_skill": "codex-change-workflow"
    },
    "workflow": {
      "shape": "tracked controller workflow",
      "controller_enabled": true,
      "template_id": "change.standard",
      "reason": "The task is multi-node and should survive compact."
    },
    "assumptions": [
      {
        "text": "Use the existing project test command.",
        "impact": "Verification stays project-native."
      }
    ],
    "questions": [
      {
        "question": "Which delivery mode should be used?",
        "options": [
          "Standard",
          "Strict"
        ],
        "answer": "Standard with a custom visual QA note.",
        "custom_answer_allowed": true,
        "resolved": true
      }
    ],
    "custom_answers_allowed": true
  }
}
```

Use an empty `questions` array when no question was needed. If questions are asked, keep them to 1-3 and record that custom answers were allowed.

## Workflow Evolution Review

Passed delivery nodes must record `evolution_candidates`. Use an empty array when the delivery was reviewed and no durable workflow lesson should be promoted. When a real candidate exists, include scope, evidence, owner, update surface, next action, and promotion status so `codex-workflow-evolution` can close the loop.

```json
{
  "evolution_candidates": [
    {
      "lesson": "Delivery nodes should record workflow evolution candidates.",
      "scope": "generic_omykit",
      "promotion_status": "candidate",
      "owner": "codex-workflow-evolution",
      "update_surface": "workflow template / scorecard",
      "rationale": "Applies to all tracked workflow delivery reviews.",
      "next_action": "Run the abstraction test before changing omyKit.",
      "evidence": [
        "evidence/06-delivery-summary.txt"
      ]
    }
  ]
}
```

Allowed `scope` values are `generic_omykit`, `project_local`, `one_off`, and `volatile_ecosystem`. Allowed `promotion_status` values are `candidate`, `promoted`, `not_promoted`, and `needs_review`. Real candidates require at least one evidence path.

## Knowledge Sync Review

Passed delivery nodes must also record `knowledge_sync`. This records whether project knowledge was reconciled at handoff time. It is not a requirement to run a heavy cleanup after every node.

Use `completed` when README, docs, AGENTS/CLAUDE rules, workflow handoffs, or agent memory were reviewed and updated. Use `not_needed` when no durable knowledge changed. Use `deferred` only with a concrete reason.

```json
{
  "knowledge_sync": {
    "status": "completed",
    "skill": "neat-freak",
    "performed_by": "main-codex",
    "reason": "The change updated workflow docs and handoff contracts.",
    "files_reviewed": [
      "README.md",
      "docs/workflow/handoff-protocol.md",
      "AGENTS.md"
    ],
    "files_updated": [
      "README.md",
      "docs/workflow/handoff-protocol.md"
    ],
    "memory_updated": [],
    "evidence": [
      "evidence/06-delivery-summary.txt"
    ]
  }
}
```

When the installed `neat-freak` skill is available, use it for milestone cleanup, stale docs, or clean handoff requests. If it is unavailable, perform an equivalent targeted docs/AGENTS review and record `skill` as the method used.

## Downstream Context

When a downstream node or subagent needs facts from the current node, the handoff should record `downstream_context`. This is not a long recap; it is a low-token fact packet for the next node.

```json
{
  "downstream_context": {
    "target_nodes": [
      "04-implement",
      "05-verify"
    ],
    "summary": "The approach is decided: keep the existing API and only change the UI empty-state branch.",
    "required_inputs": [
      "nodes/03-plan.json",
      "evidence/03-plan-summary.txt"
    ],
    "evidence": [
      "evidence/03-plan-summary.txt"
    ],
    "carry_forward_risks": [
      "Visual acceptance still needs a browser screenshot."
    ],
    "context_budget": {
      "level": "focus",
      "max_source_files": 6,
      "notes": "Implementation should read only the plan summary and related UI files first."
    },
    "handoff_contract": "Downstream implementation must preserve the existing API and record screenshot evidence or a skip reason during verification."
  }
}
```

`downstream_context` must include at least one `target_nodes` entry and a `summary`. `context-pack <node-id>` reads dependency handoffs and these `downstream_context` records to generate the smallest context packet for a downstream node or subagent.

## Passed

Use `passed` when the node completed and evidence is available.

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "03-implement",
  "status": "passed",
  "language": "en",
  "model": "GPT-5.4",
  "model_provider": "openai",
  "model_tier": "standard",
  "model_selection_reason": "Scoped implementation with tests; no architecture decision needed.",
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
  "downstream_context": {
    "target_nodes": [
      "04-verify"
    ],
    "summary": "The implementation kept the existing API and only changed the empty-state fallback branch; verification should focus on previous behavior and empty-state copy.",
    "required_inputs": [
      "src/foo.ts",
      "tests/foo.test.ts",
      "evidence/03-implement-test-output.txt"
    ],
    "evidence": [
      "evidence/03-implement-test-output.txt"
    ],
    "carry_forward_risks": [
      "Browser or focused tests still need to confirm the UI copy."
    ],
    "context_budget": {
      "level": "focus",
      "max_source_files": 4,
      "notes": "Verification should read the changed files and test output first."
    },
    "handoff_contract": "Downstream verification must confirm the previous empty-state behavior did not regress."
  },
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
  "skill_decisions": [
    {
      "capability": "UI creation",
      "selected": "frontend-design",
      "rationale": "The node needs to produce concrete screens, so the primary gap is high-quality UI creation rather than taste critique or technical audit alone.",
      "selection_basis": [
        "deliverable is a runnable frontend interface",
        "user has explicit visual-quality expectations",
        "the existing component system must be implemented"
      ],
      "alternatives": [
        {
          "name": "design-taste-frontend",
          "decision": "next_retry",
          "reason": "Use it in the next pass if the user says the result is too generic.",
          "strength": "visual judgment"
        },
        {
          "name": "audit",
          "decision": "backup",
          "reason": "Use after implementation for technical UI review, not as the first creation skill.",
          "strength": "technical audit"
        }
      ],
      "fallback_policy": {
        "when": "the user is dissatisfied with visual direction, brand expression, or polish",
        "next_skill": "design-taste-frontend",
        "action": "Keep verified functionality and rework hierarchy, layout rhythm, and brand expression."
      },
      "user_feedback": {
        "status": "not_reviewed",
        "summary": "No user quality feedback has been recorded yet."
      },
      "outcome": "not_evaluated",
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
      "model": "GPT-5.4",
      "model_provider": "openai",
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
        "provider": "openai",
        "model": "GPT-5.4",
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
    "provider": "openai",
    "model": "GPT-5.4",
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

Use `language`, `intake_decision`, `work_items`, `changed_files`, `skills_used`, `skill_decisions`, `knowledge_sync`, `context_usage`, and `timing` to make the board a task tracker instead of a generic status board. Intake handoffs should include `execution_options`, `selected_option`, and `confirmation` before implementation starts: provide 2-3 viable approaches, mark the recommended one, record the user's correction or confirmation, and keep custom answers allowed. Use node-level `skills_used` for skills that shaped the node as a whole, and `skill_decisions` for same-lane selection rationale, alternatives, fallback, and user feedback. Omit it when there was no same-lane choice or no specialist skill use. Use `agent_activity[].skills_used` for skills used by a specific worker. Use `agent_activity` when a subagent, worker, reviewer, or external collaborator actually did work. Each agent entry should have a stable lowercase `agent_id`, role, scope, task, status, `mode`, optional `model_tier`, optional actual `model` and `model_provider`, and evidence.

When the user is dissatisfied with an output, do not blindly stack every same-lane skill. Inspect `skill_decisions[].fallback_policy` for the node. If it names a `next_skill`, keep verified facts and functionality, then route the dissatisfied quality dimension to the next skill for rework. After the rework, update `user_feedback.status`, `outcome`, and evidence in the handoff. Repeatedly effective or ineffective selection lessons should become delivery `evolution_candidates` for `codex-workflow-evolution` to decide whether the generic omyKit rules should change.

Token, context, and model records must be source-aware. If a `token_usage` or `context_usage` object is present, `source` is required. Record exact provider/tool-reported usage when available; otherwise use `manual`, `estimated`, or omit the record. Do not invent Codex Desktop or chat token counts when the environment does not expose them. Use `model_tier` as a supplier-independent policy (`fast`, `standard`, `frontier`); record the actual provider/model only as observed execution metadata through `model`, `model_provider`, `token_usage.model`, `agent_activity[].model`, `agent_activity[].model_provider`, or `agent_activity[].token_usage.model`. Codex Desktop worker creation supports model overrides, so a node handoff should record the recommended model and actual model when execution exposes it. If runtime policy or metadata hides the actual model or token counts, add node-level `usage_observation` with `model_status` or `token_status` set to `unavailable` and include the corresponding unavailable reason. The board treats unavailable runtime data separately from missing records.

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
- Put facts needed by downstream nodes in `downstream_context`; do not leave them only in the chat recap.
- Prefer summaries and evidence paths in `downstream_context`; do not copy large logs, source files, or full conversations.
- Record only skills that were actually used; include purpose and evidence when available.
- Record actual model names when execution exposes them; otherwise write `model_unavailable_reason` for worker activity and node-level `usage_observation.model_status=unavailable`.
- Keep token usage source-aware; when exact usage is unavailable, record `usage_observation.token_status=unavailable` with a reason instead of estimating zero.

See [task-graph.md](task-graph.md) for node states and [controller.md](controller.md) for commands.
