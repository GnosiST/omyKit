---
name: codex-version-readiness
description: Assess and improve a target project's version management, rollback, historical traceability, release notes, and customization boundaries. Use during project init, retrofit, meaningful code/config/data changes, migrations, deployment/release preparation, or delivery checks when the user needs safe rollback, history lookup, or project-specific customization.
---

# Codex Version Readiness

Check whether the target project can be changed, reviewed, customized, and rolled back safely.

## Control

Use this at task boundaries: init, retrofit, risky change planning, migration/deploy work, release preparation, or final delivery. Do not run it after every command or small edit.

## Workflow

1. Apply `codex-context-budget`; start in `scan`.
2. Inspect current version state:
   - git repo, branch, remotes, dirty files
   - tags/releases/changelog/version files
   - release/deploy scripts and CI gates
   - migration, backup, and restore paths
   - project-local customization points
3. Classify readiness by mode:
   - `Lite`: current state visible; no destructive edits.
   - `Standard`: branch/commit scope clear; changelog or release note need known.
   - `Strict`: explicit rollback plan before risky changes; version/release evidence traceable.
4. Add or update only missing workflow guidance. Preserve existing conventions.
5. Before handoff, state rollback path or the missing rollback gap.

## Output

Return:

```text
Version state:
History lookup:
Rollback path:
Customization path:
Required before change:
Required before delivery:
Gaps:
```

Read [readiness-checks.md](references/readiness-checks.md) for detailed checks.
