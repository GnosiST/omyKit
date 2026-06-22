---
name: codex-delivery-gate
description: Verify and package Codex deliverables before claiming completion. Use before final answers, handoff, export, commit, PR, release, or user-visible completion across app, maintenance, deck, video, design, research, and data projects.
---

# Codex Delivery Gate

Do not claim completion until there is artifact-specific evidence.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

Use this gate at handoff, export, commit, PR, release, or when making a completion claim. Do not invoke it after every intermediate check.

## Workflow

1. Apply `codex-context-budget`; use `focus` for expected gates, `deep` only for failures.
2. Identify project type and deliverable.
3. For app projects, confirm runtime readiness or explicitly state which middleware was unavailable.
4. For meaningful code/config/data releases, invoke `codex-version-readiness` if rollback/version status is unknown.
5. Run the smallest relevant gate first, then the full gate required for handoff.
6. Capture evidence:
   - command names and pass/fail
   - rendered/exported artifact path, if any
   - browser or visual check used, if any
   - skipped checks and residual risk
   - version/changelog/tag status, if applicable
   - rollback path or missing rollback gap
7. Review whether stable lessons should trigger `codex-workflow-evolution`; do not promote one-off project facts into omyKit.

## Do Not

- Do not say "done", "fixed", "passing", or "ready" without verification evidence.
- Do not hide skipped checks.
- Do not run full expensive gates for every tiny intermediate step; reserve full gates for handoff.

Read the relevant reference file for the artifact type.
