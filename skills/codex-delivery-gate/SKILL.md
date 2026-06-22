---
name: codex-delivery-gate
description: Verify and package Codex deliverables before claiming completion. Use before final answers, handoff, export, commit, PR, release, or user-visible completion across app, maintenance, deck, video, design, research, and data projects.
---

# Codex Delivery Gate

Do not claim completion until there is artifact-specific evidence.

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
7. Review whether stable lessons should update `AGENTS.md`, `docs/workflow`, or a skill.

## Do Not

- Do not say "done", "fixed", "passing", or "ready" without verification evidence.
- Do not hide skipped checks.
- Do not run full expensive gates for every tiny intermediate step; reserve full gates for handoff.

Read the relevant reference file for the artifact type.
