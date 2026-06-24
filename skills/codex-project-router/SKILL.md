---
name: codex-project-router
description: Route Codex work by project type, mode, risk, and context budget. Use when starting or receiving any project/task across app development, maintenance, decks, video, design, research, data, or mixed deliverables; use before choosing other Codex Workflow Kit skills.
---

# Codex Project Router

Route work before loading heavy context or invoking implementation tools.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

## Control

Route once per task or meaningful phase. Do not re-run routing for routine file reads, edits, shell commands, or verification steps unless scope, risk, artifact type, or user intent changes.

## Workflow

1. Apply `codex-context-budget`; start in `scan`.
2. Determine entry type:
   - `init`: new project or empty working folder.
   - `retrofit`: existing project needs Codex Workflow Kit added.
   - `change`: concrete work inside a project.
   - `delivery`: finish, verify, export, ship, or hand off.
3. Determine project type: app, maintenance, deck, video, design, research, data, or mixed.
4. Determine workflow strength:
   - `Lite`: one-off or low-risk artifact.
   - `Standard`: default project work.
   - `Strict`: long-lived, core, security-sensitive, paid/client, or high-blast-radius work.
5. Run the intake question gate:
   - Infer missing values when safe and state assumptions.
   - Ask 1-3 questions before execution only when the deliverable, target project, success criteria, destructive/risky boundary, runtime/deployment constraint, workflow mode, controller need, or template choice is unclear and a wrong guess would change the work.
   - Suggested choices are allowed, but every question must allow a free-form/custom answer.
   - Before real execution, provide 2-3 execution options, mark one recommendation, explain tradeoffs, and get user confirmation unless the user explicitly auto-authorized professional judgment.
   - If the route is clear and auto-authorized, provide a concise routing summary and continue.
6. Select execution shape:
   - direct Lite/Standard workflow for small or straightforward work.
   - tracked controller workflow for multi-node, compact-prone, parallel, rejected, resumable, user-requested tracked, or Strict work.
   - nearest controller template when tracked: `change.standard`, `bugfix.standard`, `frontend-ui.strict`, or `mission.orchestration`.
7. Route:
   - `init` -> `codex-project-init`.
   - `retrofit` -> `codex-project-retrofit`.
   - `change` -> `codex-change-workflow`.
   - `delivery` -> `codex-delivery-gate`.
   - app change requiring middleware -> include `codex-runtime-readiness`.
   - durable, release, migration, rollback, or customization concern -> include `codex-version-readiness`.
   - PM-method, UI-design, visual-quality, or ecosystem-discovery signal -> choose one primary tool-registry pattern inside the active route; add a narrower specialist skill or current source only when it covers a separate gap.

## Output

Return:

```text
Entry:
Project type:
Mode:
Context level now:
Workflow shape:
Execution options:
Recommended option:
Confirmation:
Next skill:
Assumptions:
Questions:
Tools to use:
Tools to avoid:
```

Read [project-types.md](references/project-types.md) for routing details.
