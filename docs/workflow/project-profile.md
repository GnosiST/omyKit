# omyKit Project Profile

Language: [English](project-profile.md) | [简体中文](project-profile.zh-CN.md)

This profile describes the omyKit repository itself. It is the local source of truth for retrofit health checks, maintenance commands, release readiness, and known workflow-state boundaries.

## Project Type

omyKit is a workflow tooling and documentation repository. It packages:

- global Codex skills under `skills/`
- a prompt alias under `prompts/`
- a local workflow controller under `scripts/omykit-workflow.mjs`
- reusable workflow templates under `workflow-templates/`
- JSON schemas under `schemas/`
- setup, controller, routing, delivery, versioning, and tool-selection docs under `docs/workflow/`
- install, rollback, upstream-watch, validation, and controller test scripts under `scripts/`

This repository is the generic kit. Do not put target-project product rules, ports, credentials, stack assumptions, or business-specific workflow habits here.

## Source Of Truth

| Surface | Purpose |
| --- | --- |
| `AGENTS.md` | Maintainer rules for agents working inside this repository. |
| `README.md` / `README.zh-CN.md` | User-facing quick start, command examples, install/update/release notes. |
| `docs/README.md` / `docs/README.zh-CN.md` | Documentation index. |
| `docs/workflow/` | Durable workflow design, operation, and governance docs. |
| `skills/*/SKILL.md` | Concise procedural routing rules installed into Codex. |
| `workflow-templates/` | Reusable task graphs, agents, model profiles, safety limits, and scorecards. |
| `schemas/` | Machine-readable workflow artifact contracts. |
| `upstream-sources.json` | Reviewed external reference registry and baseline commits. |
| `CHANGELOG.md` | User-visible omyKit changes. |

## Maintenance Gates

Run these before handoff after meaningful skill, controller, schema, template, or docs changes:

```bash
node scripts/omykit-workflow.mjs templates validate
node scripts/test-omykit-workflow.mjs
node ./scripts/validate-docs.mjs
PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/validate-skills.sh
git diff --check
```

Run upstream review before releases or when workflow/spec/code-intelligence/docs/design/motion/ecosystem/context-compression routing depends on current external behavior:

```bash
node ./scripts/check-upstream-refs.mjs --json
```

If local `python3` lacks `PyYAML`, use a disposable Python runtime and pass it with `PYTHON=...`; do not add Python package state to this repository just for local validation.

## Controller Health

Use the controller health commands for this repository and for target projects:

```bash
node scripts/omykit-workflow.mjs doctor --lang zh-CN
node scripts/omykit-workflow.mjs doctor --fix --lang zh-CN
node scripts/omykit-workflow.mjs cleanup --dry-run --lang zh-CN
node scripts/omykit-workflow.mjs cleanup --uninstall-local --apply --lang zh-CN
```

`doctor` writes `.omykit/health/health-report.json`, but `.omykit/` is local ignored runtime state. In Git projects, `init` and `doctor --fix` use `.git/info/exclude` instead of `.gitignore` so teammates and remotes are not affected by default. Do not commit generated health reports, boards, workflow ledgers, context packs, or archives unless the user explicitly chooses to vendor workflow state.

`doctor --fix` may add compatibility metadata and missing runtime directories to local workflow artifacts, but it must not fabricate handoffs, token usage, skill usage, actual model records, or verification evidence.

`cleanup --apply` archives safe candidates into `.omykit/archive/<timestamp>/`; it must not delete workflow evidence directly.

`cleanup --uninstall-local --apply` removes omyKit from the target project workspace by moving `.omykit/` into a local non-project archive, usually `.git/omykit-uninstalled/` for Git projects.

Historical dogfood workflows under `.omykit/workflows/` may predate current handoff requirements. Treat missing intake decisions, missing `knowledge_sync`, missing `evolution_candidates`, or missing agent scopes as audit findings. Either preserve them as historical evidence, repair them from real records, or archive them after review.

## Runtime And Tooling

- Node.js runs controller, docs validation, upstream checks, and workflow tests.
- Python with `PyYAML` is required only for the installed Codex skill validator.
- No app server, database, Docker service, browser session, or middleware is required for normal omyKit validation.
- CodeGraph may index `scripts/*.mjs` and workflow YAML files for controller structure review; source tests remain the final authority.

## Versioning And Rollback

- `VERSION` records the current omyKit version.
- `CHANGELOG.md` records user-visible changes.
- Git commits and tags provide historical lookup.
- `./scripts/install-global.sh` installs the current checkout into `${CODEX_HOME:-$HOME/.codex}`.
- `./scripts/install-ref.sh <ref>` installs a historical branch, tag, or commit.
- `./scripts/rollback-global.sh latest` restores the latest global install backup.
- Release or handoff installs must be run from the final clean commit and the install manifest must show `git_dirty=false`.

## Customization Boundary

Keep target-project customization in the target project:

- `AGENTS.md` or equivalent project rules
- target `docs/workflow/project-profile.md`
- optional repo-local `.codex/skills/` only when intentionally vendored
- target project scripts and runtime docs

omyKit should provide reusable routing and workflow mechanics, not project-specific product policy.
