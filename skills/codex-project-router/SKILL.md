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
5. Infer missing values when safe and state assumptions. If user input is required, offer suggested choices but allow free-form/custom answers.
6. Route:
   - `init` -> `codex-project-init`.
   - `retrofit` -> `codex-project-retrofit`.
   - `change` -> `codex-change-workflow`.
   - `delivery` -> `codex-delivery-gate`.
   - app change requiring middleware -> include `codex-runtime-readiness`.
   - durable, release, migration, rollback, or customization concern -> include `codex-version-readiness`.
   - PM-method, UI-design, design-taste, or ecosystem-discovery signal -> apply the matching tool-registry pattern inside the active route; use a specialist skill or current source only when available and useful.

## Output

Return:

```text
Entry:
Project type:
Mode:
Context level now:
Next skill:
Tools to use:
Tools to avoid:
```

Read [project-types.md](references/project-types.md) for routing details.
