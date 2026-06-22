# omyKit

omyKit is a lightweight workflow kit for Codex. It provides a small set of global skills and a prompt alias for routing project work by task type, risk, context needs, runtime requirements, and delivery evidence.

The kit is intentionally procedural rather than framework-heavy. It helps Codex decide when to initialize project rules, retrofit an existing repository, execute a scoped change, prepare local runtime dependencies, or run a delivery gate. Once a task is routed, normal execution continues without re-running the workflow for every file read, edit, command, or intermediate check.

## What It Includes

| Path | Purpose |
| --- | --- |
| `skills/` | Codex skills installed into `${CODEX_HOME:-$HOME/.codex}/skills/`. |
| `prompts/` | Optional prompt alias for starting omyKit from clients that support prompt files. |
| `docs/workflow/` | Human-readable workflow notes for setup, routing, context budgeting, runtime readiness, versioning, external collaboration, and delivery gates. |
| `scripts/` | Local validation, installation, install-from-ref, and rollback helpers. |
| `AGENTS.md` | Maintenance rules for agents working in this repository. |

## Skills

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

## Install

```bash
./scripts/install-global.sh
```

The installer validates all skills before replacing the global copies. It then installs:

- `skills/*` into `${CODEX_HOME:-$HOME/.codex}/skills/`
- `prompts/omykit.md` into `${CODEX_HOME:-$HOME/.codex}/prompts/`

Open a fresh Codex thread after installation so the skill list refreshes.

## Usage

Recommended direct skill prompts:

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

## Validate

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
