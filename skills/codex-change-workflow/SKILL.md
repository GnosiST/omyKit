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
3. Confirm the intake decision from `omykit` or `codex-project-router` before implementation:
   - If deliverable, target project, success criteria, risky/destructive boundary, runtime constraint, workflow mode, controller need, or template choice is unclear, ask 1-3 questions before editing.
   - Before implementation, present 2-3 execution options, mark the recommended option, explain tradeoffs, and get confirmation unless the user explicitly auto-authorized professional judgment.
   - If the decision is clear and already confirmed or auto-authorized, state route, execution shape, and material assumptions briefly, then proceed.
   - Questions may offer choices but must allow custom answers.
4. Invoke the relevant Superpowers discipline:
   - fuzzy idea -> `superpowers:brainstorming`
   - multi-step implementation -> `superpowers:writing-plans`
   - existing plan -> `superpowers:executing-plans`
   - bug -> `superpowers:systematic-debugging`
   - risky logic -> `superpowers:test-driven-development`
5. Decide whether to enable the omyKit workflow controller:
   - Lite: do not enable by default.
   - Standard: enable only for multi-node, compact-prone, parallel, rejected, resumable, or user-requested tracked work.
   - Strict: enable by default.
6. If enabled, use the first available controller script: project `scripts/omykit-workflow.mjs`, then `${CODEX_HOME:-$HOME/.codex}/omykit/scripts/omykit-workflow.mjs`. Keep node handoffs structured; failed gates must reject to a named upstream node with evidence and required fix. For user-authorized multi-agent work, run `dispatch-plan` before spawning workers, keep the main thread as orchestrator-observer, pass model overrides to Codex subagents/threads according to the node recommendation, and record actual model or `model_unavailable_reason` in `agent_activity`. Generate `board` only when the user asks for progress visualization, the task is long enough to need a collaboration map, or before a tracked handoff where board evidence helps review.
7. For app work, invoke `codex-runtime-readiness` before running local checks that depend on databases, caches, object storage, queues, browsers, or emulators.
8. For meaningful code/config/content changes, invoke `codex-version-readiness` to check current git state, branch/commit scope, changelog need, and rollback path.
9. Apply tool-registry patterns inline when signals match: choose one primary same-lane capability, then add a secondary only for a separate high-signal gap such as responsive adaptation, copy, hardening, taste/anti-generic review, advanced UI/UX direction, motion, GSAP implementation, current shadcn/ecosystem discovery, or deck specialist production. Handle accessibility, metadata, icons, and performance with project-native checks and targeted fixes unless the user explicitly requests a trusted specialist.
10. If existing official, bundled, project-native, or installed tools cannot satisfy a needed artifact quality, record `capability_gaps` before adopting a new tool: classify `integration_path` as `local_only`, `project_local`, `omykit_candidate_branch`, `main_after_review`, or `not_integrated`; capture source/license/install/run evidence; prefer local or project-local trial before any omyKit routing change. For deck work, use `deck.proposal`, record `deck_variant` (`create`, `remake`, or `modify`), and pick by direction: `hugohe3/ppt-master` for native editable PPTX gaps, `op7418/guizang-ppt-skill` for HTML deck gaps, `zarazhangrui/beautiful-html-templates` as an external template reference, and `irenerachel/visual-style-ppt-skill` only as a user-approved local style-review candidate because its license is not detected.
11. Load only the current project-type reference.
12. Execute surgically.
13. Run focused verification as soon as something is testable.
14. Before handoff, invoke `codex-delivery-gate`; if repeated workflow evidence or capability-gap trial evidence appears, route it to `codex-workflow-evolution` after delivery.

## App-Code Rules

- Use CodeGraph first for structure and impact when initialized and fresh.
- Confirm critical behavior in source/tests/config before editing.
- Use Context7 only for exact current API/library questions.
- Use browser tools only for user-visible behavior.

Read [modes.md](references/modes.md) and [artifact-routing.md](references/artifact-routing.md) before implementation.
