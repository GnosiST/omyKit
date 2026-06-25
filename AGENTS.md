# AGENTS.md

This repository packages omyKit as project-local Codex workflow entry points plus human-readable workflow docs. Global installation remains available only as a compatibility fallback.

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
- Prefer project-local enablement with `./scripts/project-local.sh enable <target-project>`. Use `./scripts/install-global.sh` only when the user explicitly asks for a global install or a Codex client cannot load project-local skills.
- For release/handoff installs, run the chosen install from the final clean commit and confirm the install manifest points to that commit with `git_dirty=false`.
- Keep installed skills, prompts, controller, schemas, and workflow templates as real files/directories, not symlinks.
- Validate all skills before handoff:

```bash
./scripts/validate-skills.sh
node scripts/test-omykit-workflow.mjs
node ./scripts/validate-docs.mjs
git diff --check
```

If local Python lacks `PyYAML`, run the validator with a disposable virtual environment or another Python runtime that has it installed.
