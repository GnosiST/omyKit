# AGENTS.md

This repository packages omyKit as global Codex skills plus human-readable workflow docs.

## Maintenance Rules

- Keep each `skills/*/SKILL.md` concise and procedural.
- Put user-facing setup, release, and publishing notes in `README.md` or `docs/`, not inside skill folders.
- Keep skill references one level deep under `references/`.
- Do not add project-specific assumptions, stack choices, ports, credentials, or product rules to the generic kit.
- Keep detailed target-project versioning checks in `codex-version-readiness`; reference it from other skills instead of duplicating the checklist.
- When adding, removing, or changing skills, update `README.md`, `CHANGELOG.md`, and relevant `docs/workflow/` files.
- Update the global install by running `./scripts/install-global.sh` after changing skill files.
- Validate all skills before handoff:

```bash
./scripts/validate-skills.sh
```

If local Python lacks `PyYAML`, run the validator with a disposable virtual environment or another Python runtime that has it installed.
