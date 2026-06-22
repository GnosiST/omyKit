---
name: omykit
description: User-facing entry point for Codex Workflow Kit. Use when the user says omyKit, omykit, 初始化项目, 改造旧项目, 开始一个需求, 交付检查, or asks Codex to initialize, retrofit, run, or verify app, deck, video, design, research, data, or mixed projects with a guided workflow.
---

# omyKit

Use this as the front door for Codex Workflow Kit. Keep it short; route to the specific workflow skill after the first decision.

## Control

Use omyKit at task boundaries, not for every action. Route once at intake, when scope/risk changes, or before final delivery. After routing, continue normal execution until new evidence requires a different workflow.

## Start

Apply `codex-context-budget` and stay in `scan`.

Classify the user request:

1. `init`: initialize a new project.
2. `retrofit`: add the kit to an existing project.
3. `change`: start a feature, bug fix, refactor, design pass, deck/video edit, research task, or data analysis.
4. `delivery`: verify, export, hand off, commit, or prepare release.

If the entry is unclear, infer when safe and state the assumption. Ask only when a wrong route would waste work or change risk.

## Project Type

If project type is unclear, infer from the current folder and user request. When asking, offer these options as suggestions and explicitly allow a custom answer:

1. app development
2. maintenance/refactor
3. deck/presentation
4. video/editing
5. design/prototype
6. research/document
7. data/spreadsheet
8. mixed

## Mode

Recommend one mode, but let the user override:

- `Lite`: one-off, low-risk.
- `Standard`: default.
- `Strict`: durable, client-facing, high-risk, architecture, security, migration, or broad blast radius.

When asking about mode, allow the user to answer with `Lite`, `Standard`, `Strict`, or free-form constraints such as "fast pass", "very cautious", or "client-ready".

## Route

- `init` -> `codex-project-init`
- `retrofit` -> `codex-project-retrofit`
- `change` -> `codex-change-workflow`
- `delivery` -> `codex-delivery-gate`

For app work that needs middleware, include `codex-runtime-readiness`.
For durable, release, migration, rollback, history, or customization concerns, include `codex-version-readiness`.

Read [commands.md](references/commands.md) for supported natural-language entry phrases.
