# omyKit

[![Version](https://img.shields.io/badge/version-0.1.0-111827)](VERSION)
[![License: MIT](https://img.shields.io/badge/license-MIT-0f766e)](LICENSE)
[![Codex Skills](https://img.shields.io/badge/Codex-skills-2563eb)](skills)
[![Docs](https://img.shields.io/badge/docs-English%20%7C%20Chinese-7c3aed)](docs/README.md)

**A lightweight Codex workflow kit for context-aware project routing, low-waste execution, verification gates, runtime readiness, and rollback-aware delivery.**

omyKit packages a small, procedural operating layer for Codex. It helps agents decide when to initialize project rules, retrofit an existing repository, execute a scoped change, prepare local runtime dependencies, check version readiness, and run delivery gates before handoff.

The kit is designed to stay out of the way after routing. Once a task is classified, normal execution continues without re-running the workflow for every file read, edit, command, or intermediate check.

Languages: [English](README.md) | [简体中文](README.zh-CN.md)

## Why omyKit

- **Clear routing:** classify work by entry type, project type, risk, and artifact.
- **Low context waste:** load context progressively with `scan -> focus -> deep`.
- **Delivery evidence:** finish with targeted checks instead of unverified completion claims.
- **Runtime readiness:** prepare middleware only when tests or app checks need it.
- **Version awareness:** surface branch, changelog, rollback, history, and customization gaps.
- **Original workflow docs:** collaborate with external skills without copying third-party content.

## Quick Start

Install the global Codex skills and prompt:

```bash
./scripts/install-global.sh
```

Open a fresh Codex thread so the skill list refreshes, then use one of:

```text
$omykit 初始化项目
$omykit 初始化旧项目
$omykit 开始一个需求
$omykit 交付检查
```

If your Codex client supports prompt files:

```text
/prompts:omykit 初始化项目
```

Do not assume `/omykit` is available unless your local Codex client explicitly maps custom prompt files to that command form.

## What It Includes

| Path | Purpose |
| --- | --- |
| `skills/` | Codex skills installed into `${CODEX_HOME:-$HOME/.codex}/skills/`. |
| `prompts/` | Optional prompt alias for starting omyKit from clients that support prompt files. |
| `docs/workflow/` | Workflow notes for setup, routing, context budgeting, runtime readiness, versioning, external collaboration, and delivery gates. |
| `scripts/` | Validation, global installation, install-from-ref, and rollback helpers. |
| `AGENTS.md` | Maintenance rules for agents working in this repository. |

## Skill Layer

| Skill | Role |
| --- | --- |
| `omykit` | Entry point for initialization, retrofit, change work, and delivery checks. |
| `codex-project-router` | Classifies entry type, project type, workflow mode, and tool path. |
| `codex-context-budget` | Keeps context loading progressive: `scan -> focus -> deep`. |
| `codex-project-init` | Creates the minimum Codex workflow layer for a new project. |
| `codex-project-retrofit` | Adds workflow structure to an existing project without disrupting it. |
| `codex-change-workflow` | Runs scoped feature, fix, refactor, or artifact work through focused verification. |
| `codex-runtime-readiness` | Prepares local services such as databases, caches, object storage, queues, browsers, or emulators when verification needs them. |
| `codex-version-readiness` | Checks target-project branch, release, rollback, history lookup, and customization readiness. |
| `codex-delivery-gate` | Checks artifact-specific evidence before handoff, export, commit, PR, or release. |

See [Skill coordination](docs/workflow/skill-coordination.md) for what each integrated skill owns, when it hands off, and why the skills do not conflict.

## Workflow Model

```text
intake -> route -> context budget -> spec/brief -> runtime readiness -> execute -> verify -> deliver -> learn
```

Operational rules:

- Route once at task intake, when scope or risk changes, or before delivery.
- Use workflow skills at task boundaries and meaningful phase changes, not for every individual action.
- Start with `scan`, move to `focus` for implementation, and use `deep` only when risk or blockage justifies it.
- Prefer project-native commands and existing repository conventions before adding new tools.
- Check versioning readiness for durable changes: branch state, history lookup, rollback path, release notes, and customization boundary.
- Treat generated project rules as local project assets, not global defaults.
- Ask for user input only when a safe assumption is not possible; when asking, allow custom answers instead of limiting the user to fixed options.

## Documentation

- [Documentation index](docs/README.md)
- [中文文档索引](docs/README.zh-CN.md)
- [Setup guide](docs/workflow/setup.md)
- [Workflow overview](docs/workflow/codex-workflow-kit.md)
- [Skill coordination](docs/workflow/skill-coordination.md)
- [Versioning readiness](docs/workflow/versioning.md)
- [External skill collaboration](docs/workflow/external-collaboration.md)
- [Delivery gates](docs/workflow/delivery-gates.md)

## Validation

```bash
./scripts/validate-skills.sh
```

The validator uses Codex's `skill-creator` validation script. If the selected Python runtime does not include `PyYAML`, the script prints disposable virtual environment commands. You can also provide a Python executable explicitly:

```bash
PYTHON=/path/to/venv/bin/python ./scripts/validate-skills.sh
```

Recommended pre-handoff checks:

```bash
./scripts/validate-skills.sh
git diff --check
```

## Version And Rollback Readiness

omyKit includes `codex-version-readiness` for target projects. Use it when initializing or retrofitting a repository, preparing a release, handling migrations, changing dependencies, or making any change where rollback or historical lookup matters.

It checks whether the target project has an appropriate version source, changelog or release notes, git branch state, tags/releases, rollback plan, and customization path. It reports gaps instead of forcing heavyweight release machinery onto small or temporary work.

For this repository itself:

```bash
./scripts/install-global.sh
./scripts/install-ref.sh v0.1.0
./scripts/rollback-global.sh latest
```

## Maintenance

After changing skill files:

1. Run `./scripts/validate-skills.sh`.
2. Run `./scripts/install-global.sh` to update the global Codex skill copy.
3. Review `${CODEX_HOME:-$HOME/.codex}/omykit/install-manifest`.
4. Review `git diff --check`.
5. Commit and push only after the local and global copies are verified.

## Copyright And Third-Party References

This repository is intended to contain original workflow instructions, scripts, and documentation for omyKit. It does not intentionally bundle third-party proprietary assets, private documentation, or copied product manuals.

Names such as Codex, GitHub, Docker, Canva, Remotion, and other referenced tools are used descriptively to identify integrations or workflow contexts. Those names may be trademarks of their respective owners. This project is not endorsed by, sponsored by, or affiliated with those owners unless explicitly stated.

When adding new content, keep examples, prose, and templates original or clearly licensed for reuse. Do not copy third-party documentation, brand assets, screenshots, icons, or proprietary workflow text into this repository without confirming the applicable license and attribution requirements.

## License

MIT. See [LICENSE](LICENSE).
