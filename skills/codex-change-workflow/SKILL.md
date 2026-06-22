---
name: codex-change-workflow
description: Run a concrete Codex change from brief or spec through plan, execution, and focused verification. Use for feature work, bug fixes, refactors, design iterations, deck/video edits, research deliverables, or data analysis after project routing.
---

# Codex Change Workflow

Execute a scoped change with the smallest spec and context that can still produce a reviewable deliverable.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

## Control

Run this workflow once to frame the change, then execute directly. Re-enter the workflow only when the request changes, the blast radius grows, verification exposes a new problem class, or the user asks to re-plan.

## Workflow

1. Apply `codex-context-budget`; begin with `scan`, then move to `focus` for implementation.
2. Confirm source of truth:
   - Lite: brief in conversation or `docs/workflow`.
   - Standard: OpenSpec-style change, issue, or project spec.
   - Strict: Spec-Kit constitution plus change spec/tasks.
3. Invoke the relevant Superpowers discipline:
   - fuzzy idea -> `superpowers:brainstorming`
   - multi-step implementation -> `superpowers:writing-plans`
   - existing plan -> `superpowers:executing-plans`
   - bug -> `superpowers:systematic-debugging`
   - risky logic -> `superpowers:test-driven-development`
4. For app work, invoke `codex-runtime-readiness` before running local checks that depend on databases, caches, object storage, queues, browsers, or emulators.
5. For meaningful code/config/content changes, invoke `codex-version-readiness` to check current git state, branch/commit scope, changelog need, and rollback path.
6. Apply tool-registry patterns inline when signals match: choose one primary same-lane capability, then add a narrower secondary only for a separate gap such as responsive adaptation, accessibility, copy, hardening, metadata, icons, motion, performance, or current shadcn/ecosystem discovery.
7. Load only the current project-type reference.
8. Execute surgically.
9. Run focused verification as soon as something is testable.
10. Before handoff, invoke `codex-delivery-gate`; if repeated workflow evidence appears, route it to `codex-workflow-evolution` after delivery.

## App-Code Rules

- Use CodeGraph first for structure and impact when initialized and fresh.
- Confirm critical behavior in source/tests/config before editing.
- Use Context7 only for exact current API/library questions.
- Use browser tools only for user-visible behavior.

Read [modes.md](references/modes.md) and [artifact-routing.md](references/artifact-routing.md) before implementation.
