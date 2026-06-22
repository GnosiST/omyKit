# Codex Workflow Kit

Codex Workflow Kit is a Codex-centered operating layer for initializing or retrofitting any project: app development, maintenance, presentations, video, design, research, and data work.

The kit keeps Codex as the control plane. Other tools are context sources, execution helpers, visual canvases, runtime aids, or delivery gates.

## Goals

- High-quality delivery without bloated context.
- Project-type routing before tool use.
- Progressive context loading: `scan -> focus -> deep`.
- Repeatable workflows encoded as Codex repo skills.
- Runtime readiness, including Docker-backed middleware, before local verification.
- Artifact-specific delivery evidence before claiming completion.

## Core Flow

```text
intake -> route -> context budget -> spec/brief -> runtime readiness -> execute -> verify -> review -> deliver -> learn
```

## Skill Layer

| Skill | Purpose |
| --- | --- |
| `omykit` | User-facing entry point for initialization, retrofit, change work, and delivery checks. |
| `codex-project-router` | Classify entry type, project type, mode, and next skill. |
| `codex-context-budget` | Keep context and token use minimal. |
| `codex-project-init` | Initialize a new project with a Codex workflow layer. |
| `codex-project-retrofit` | Add the kit to an existing project without disrupting it. |
| `codex-change-workflow` | Run a concrete change from brief/spec to verification. |
| `codex-runtime-readiness` | Prepare databases, caches, object storage, queues, emulators, Docker, or GUI runtime dependencies. |
| `codex-delivery-gate` | Verify app, deck, video, design, research, or data deliverables before handoff. |

## Mode Selection

| Mode | Use when | Shape |
| --- | --- | --- |
| Lite | Small, reversible, one-off work | brief -> execute -> minimum verification |
| Standard | Default project work | brief/spec -> plan -> execute -> focused gates |
| Strict | Durable, high-risk, client, architecture, security, migration | constitution/spec -> impact -> TDD/debug/plan -> full gates |

## Tool Philosophy

Use the most specific reliable tool first:

1. Project-native commands, APIs, and files.
2. Semantic/indexed context such as CodeGraph.
3. Dedicated MCP/plugins such as Context7, Cowart, Figma, Canva, GitHub, or Sentry.
4. Browser automation such as Chrome Extension or Playwright.
5. Computer Use only for local GUI workflows without a better interface.

## Runtime Philosophy

For app projects, local verification often needs middleware. Do not assume it exists.

Use this order:

```text
already running service -> project compose/script -> testcontainer/in-memory path -> minimal temporary Docker command
```

Never run destructive resets or migrations unless project docs or the user explicitly allow them.

## Delivery Evidence

Every completion should state:

- what changed or was produced
- where the artifact lives
- which checks ran
- which checks were skipped
- residual risk
- whether stable lessons should update docs, skills, hooks, or project rules

## Build Or Retrofit

Use `$omykit 初始化项目` for new projects. Use `$omykit 改造旧项目` for existing projects. Keep all generated rules generic until a project profile supplies concrete tools, commands, and gates.

See [setup.md](setup.md) for installation and first-use prompts.
