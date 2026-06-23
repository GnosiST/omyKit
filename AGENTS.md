# AGENTS.md

This repository packages omyKit as global Codex skills plus human-readable workflow docs.

## Maintenance Rules

- Keep each `skills/*/SKILL.md` concise and procedural.
- Put user-facing setup, release, and publishing notes in `README.md` or `docs/`, not inside skill folders.
- Keep skill references one level deep under `references/`.
- During omyKit maintenance, keep scope to this generic kit; do not inspect or edit sibling projects unless the user explicitly requests cross-project synchronization.
- Do not add project-specific assumptions, stack choices, ports, credentials, or product rules to the generic kit.
- Keep detailed target-project versioning checks in `codex-version-readiness`; reference it from other skills instead of duplicating the checklist.
- When adding, removing, or changing skills, update `README.md`, `CHANGELOG.md`, and relevant `docs/workflow/` files.
- Review referenced upstream sources with `node ./scripts/check-upstream-refs.mjs` before releases or when changing workflow/spec/code-intelligence/docs/design/motion/ecosystem/context-compression routing.
- For tracked delivery handoffs, record `knowledge_sync` as `completed`, `not_needed`, or `deferred` with a reason; use `neat-freak` only for milestone/stale-doc cleanup, not every node.
- Update the global install by running `./scripts/install-global.sh` after changing skill files. For release/handoff, run it from the final clean commit and confirm `${CODEX_HOME:-$HOME/.codex}/omykit/install-manifest` points to that commit with `git_dirty=false`.
- Validate all skills before handoff:

```bash
./scripts/validate-skills.sh
node scripts/test-omykit-workflow.mjs
node ./scripts/validate-docs.mjs
git diff --check
```

If local Python lacks `PyYAML`, run the validator with a disposable virtual environment or another Python runtime that has it installed.
