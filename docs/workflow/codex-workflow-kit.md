# Codex Workflow Kit

Language: [English](codex-workflow-kit.md) | [简体中文](codex-workflow-kit.zh-CN.md)

Codex Workflow Kit is a Codex-centered operating layer for initializing or retrofitting any project: app development, maintenance, presentations, video, design, research, and data work.

The kit keeps Codex as the control plane. Other tools are context sources, execution helpers, visual canvases, runtime aids, or delivery gates.

## Goals

- High-quality delivery without bloated context.
- Project-type routing before tool use.
- Progressive context loading: `scan -> focus -> deep`.
- Compression-aware context management: avoid and narrow first, summarize next, then use optional local compression only when originals can be retrieved.
- Optional C-lite workflow controller for long, resumable, multi-node tasks.
- Repeatable workflows encoded as Codex repo skills.
- Runtime readiness, including Docker-backed middleware, before local verification.
- Versioning readiness for history lookup, rollback, releases, and project-specific customization.
- Language-aware visible output for rationale summaries, questions, progress, and handoff.
- Artifact-specific delivery evidence before claiming completion.
- Evidence-based workflow evolution without importing target-project facts into the generic kit.
- Periodic upstream reference checks for official workflow, spec, code-intelligence, documentation, design, motion, ecosystem, and context-compression sources.

## Core Flow

```text
intake -> task inbox/merge gate -> route -> context budget -> spec/brief -> runtime readiness -> execute -> verify -> review -> deliver -> learn
```

Apply the flow at task boundaries and meaningful phase changes. Do not restart the workflow for routine file reads, edits, shell commands, or intermediate checks when the current route still fits.

## Usability Controls

- Keep the route stable after intake; revisit it only when scope, risk, artifact type, or user intent changes.
- At intake, show the goal, selected route, execution shape or controller template, and material assumptions before implementation.
- Ask 1-3 questions only when a safe assumption would be risky and the answer would change the deliverable, target project, success criteria, risk boundary, runtime constraint, workflow mode, controller need, or template choice. When asking, suggest likely choices while allowing a custom answer.
- Do not stack same-lane skills by default; pick one primary capability and add a narrower specialist only for a separate gap.
- Treat external projects as reference signals with links and review notes, not as vendored skill content.
- Keep visible rationale summaries, status updates, questions, and handoff in the user's latest prompt language.

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
| `codex-version-readiness` | Check target-project branch, release, rollback, history, and customization readiness. |
| `codex-delivery-gate` | Verify app, deck, video, design, research, or data deliverables before handoff. |
| `codex-workflow-evolution` | Promote repeated workflow lessons into omyKit after evidence and abstraction checks. |

For ownership boundaries and conflict-prevention rules, see [skill-coordination.md](skill-coordination.md).

## Mode Selection

| Mode | Use when | Shape |
| --- | --- | --- |
| Lite | Small, reversible, one-off work | brief -> execute -> minimum verification |
| Standard | Default project work | brief/spec -> plan -> execute -> focused gates; enable controller only for multi-node, resumable, rejected, or compact-prone work |
| Strict | Durable, high-risk, client, architecture, security, migration | constitution/spec -> task graph -> impact -> TDD/debug/plan -> full gates |

## Workflow Controller

For long or high-observability work, omyKit can use a local controller:

```text
skill route -> task graph -> node execution -> structured handoff -> verify/reject/block -> delivery
```

The controller stores state under `.omykit/workflows/<workflow-id>/`, records repeated briefs in `.omykit/tasks/tasks.jsonl`, uses a merge gate to decide `merge_current`, `linked_follow_up`, or `new_workflow`, validates handoff files, audits intake decisions, generates automatic orchestration plans, creates compact node context packs when needed, records command-run recovery metadata, projects task inbox, skill, agent, model, and usage evidence to the board, recommends ready work surfaces and right-sized models, diagnoses project workflow health, reports Git-tracked runtime or legacy workflow artifacts, archives safe residue cleanup candidates, upgrades old workflow artifacts, and keeps compact recovery cheap. It does not call models, replace Codex, fabricate missing evidence, commit, push, rewrite Git history, or make Lite tasks heavy by default.

See [controller.md](controller.md), [task-graph.md](task-graph.md), and [handoff-protocol.md](handoff-protocol.md).

## Tool Philosophy

Use the most specific reliable tool first:

1. Project-native commands, APIs, and files.
2. Platform official CLIs or automation APIs discovered from project evidence and current official docs, such as WeChat DevTools CLI for Mini Programs.
3. Semantic/indexed context such as CodeGraph.
4. Focused documentation or selected artifact context through tools such as Context7, Figma, or another selected design source.
5. Optional local compression for large retrievable outputs after native narrowing is insufficient.
6. Dedicated MCP/plugins such as Canva, GitHub, Sentry, optional local compression, or artifact tools when they materially change the next decision.
7. Browser automation such as Chrome Extension or Playwright.
8. Computer Use only for local GUI workflows when no official/dedicated connector, MCP/plugin, browser automation, shell/API path, project script, or platform official CLI can do the job.

## Runtime Philosophy

For app projects, local verification often needs middleware. Do not assume it exists.

Use this order:

```text
already running service -> compatible stopped container/local image -> project compose/script -> testcontainer/in-memory path -> minimal temporary Docker command
```

Before pulling or building Docker images, reuse compatible local images or containers when the version difference is not material to the current verification.

Never run destructive resets or migrations unless project docs or the user explicitly allow them.

## Delivery Evidence

Every completion should state:

- what changed or was produced
- where the artifact lives
- which checks ran
- which checks were skipped
- residual risk
- whether stable lessons should trigger `codex-workflow-evolution`

## Build Or Retrofit

Use `$omykit 初始化项目` for new projects. Use `$omykit 改造旧项目` for existing projects. Keep all generated rules generic until a project profile supplies concrete tools, commands, and gates.

See [setup.md](setup.md) for installation and first-use prompts, [project-profile.md](project-profile.md) for the omyKit repository profile, [versioning.md](versioning.md) for rollback and history readiness, [tool-registry.md](tool-registry.md) for optional workflow, spec, code-intelligence, docs, design, motion, ecosystem-discovery, and context-compression selection rules, [upstream-watch.md](upstream-watch.md) for external reference checks, [controller.md](controller.md) for durable task graphs, and [evolution.md](evolution.md) for evidence-based workflow improvement.
