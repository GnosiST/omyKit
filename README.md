# omyKit

omyKit is a Codex-centered workflow kit for starting, retrofitting, executing, and shipping projects with less context waste.

It is designed as a global Codex skill layer. Use it for app development, maintenance, presentations, video, design, research, data work, or mixed projects. Codex stays the control plane; tools such as CodeGraph, Superpowers, Docker, imagegen, Computer Use, Chrome, Canva, Remotion, and GitHub are routed in only when they help the current project type.

## Install

```bash
./scripts/install-global.sh
```

The installer copies:

- `skills/*` to `${CODEX_HOME:-$HOME/.codex}/skills/`
- `prompts/omykit.md` to `${CODEX_HOME:-$HOME/.codex}/prompts/`

Restart Codex or open a fresh thread after installation so the skill list refreshes.

## Use

Preferred direct skill prompts:

```text
$omykit 初始化项目
$omykit 初始化旧项目
$omykit 开始一个需求
$omykit 交付检查
```

If your Codex client supports prompt files, this repository also provides:

```text
/prompts:omykit 初始化项目
```

Do not rely on `/omykit` unless your local Codex client explicitly maps custom prompt files that way.

## Skills

| Skill | Purpose |
| --- | --- |
| `omykit` | User-facing entry point and router. |
| `codex-project-router` | Classify project type, entry type, mode, and tool path. |
| `codex-context-budget` | Keep context loading small and progressive. |
| `codex-project-init` | Initialize a new project workflow layer. |
| `codex-project-retrofit` | Retrofit an existing project safely. |
| `codex-change-workflow` | Run a feature, fix, refactor, or artifact task from brief to verification. |
| `codex-runtime-readiness` | Prepare local runtime services, including Docker-backed middleware. |
| `codex-delivery-gate` | Verify and package deliverables before handoff. |

## Repository Layout

```text
AGENTS.md        Maintenance rules for Codex agents
skills/          Codex skills to install globally
prompts/         Optional Codex prompt alias
docs/workflow/   Human-readable workflow documentation
scripts/         Local install helpers
```

## Validate

```bash
./scripts/validate-skills.sh
```

If your Python does not have `PyYAML`, run it with a disposable environment:

```bash
PYTHON=/path/to/venv/bin/python ./scripts/validate-skills.sh
```

## Publish to GitHub

After reviewing the files:

```bash
git add .
git commit -m "Initial omyKit workflow kit"
gh repo create omykit --public --source=. --remote=origin --push
```

## Workflow Shape

```text
intake -> route -> context budget -> spec/brief -> runtime readiness -> execute -> verify -> review -> deliver -> learn
```

The kit is intentionally conservative with context:

- Start in `scan`.
- Load only the files, docs, MCP results, and browser state needed for the current decision.
- Escalate to `focus` or `deep` only when risk or uncertainty justifies it.
- Treat generated project rules as local project assets, not global defaults.

## License

MIT. Change `LICENSE` before publishing if you want a different open-source license.
