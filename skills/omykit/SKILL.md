---
name: omykit
description: User-facing entry point for Codex Workflow Kit. Use when the user says omyKit, omykit, 初始化项目, 改造旧项目, 开始一个需求, 交付检查, 安装 omyKit, 更新 omyKit, 生成看板, 查看进度, 继续工作流, or asks Codex to initialize, retrofit, run, verify, install, update, inspect, resume, or visualize app, deck, video, design, research, data, or mixed projects with a guided workflow.
---

# omyKit

Use this as the front door for Codex Workflow Kit. Keep it short; route to the specific workflow skill after the first decision.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

## Control

Use omyKit at task boundaries, not for every action. Route once at intake, when scope/risk changes, or before final delivery. After routing, continue normal execution until new evidence requires a different workflow.

## Codex-First Operations

Treat terminal commands as internal implementation details. When the user asks in Codex chat to install, update, inspect, resume, validate, or visualize omyKit workflow state, run the needed local command for them and report the result.

For omyKit maintenance:

- first-time install from Codex can only start from a plain user request because `$omykit` is not available yet; after install, tell the user to open a fresh Codex thread
- update/reinstall omyKit with the current trusted checkout when available; otherwise use the official repository URL the user supplied or `https://github.com/GnosiST/omyKit`
- run `./scripts/install-global.sh` from the omyKit checkout, then confirm `${CODEX_HOME:-$HOME/.codex}/omykit/install-manifest`

For controller and board requests, use the first available script:

1. project `scripts/omykit-workflow.mjs`
2. `${CODEX_HOME:-$HOME/.codex}/omykit/scripts/omykit-workflow.mjs`

Map user intent to commands:

- create tracked workflow -> `init`
- progress/status -> `status`
- next work -> `next`
- continue after interruption -> `resume`
- validate workflow files -> `validate`
- generate or open board -> `board --open --lang <user-language>`; use `zh-CN` for Simplified Chinese prompts and `en` otherwise

If there are multiple workflows and no active/latest workflow is safe to infer, ask which workflow to use. If the controller script is missing, tell the user omyKit must be installed or reinstalled first.

## Start

Apply `codex-context-budget` and stay in `scan`.

Classify the user request:

1. `maintenance`: install, update, reinstall, rollback, or inspect omyKit itself.
2. `controller`: create, inspect, resume, validate, or visualize a tracked workflow.
3. `init`: initialize a new project.
4. `retrofit`: add the kit to an existing project.
5. `change`: start a feature, bug fix, refactor, design pass, deck/video edit, research task, or data analysis.
6. `delivery`: verify, export, hand off, commit, or prepare release.

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

- `maintenance` -> handle directly with the omyKit repository scripts; then report install/update evidence
- `controller` -> handle directly with `omykit-workflow.mjs`; then report status, next action, board paths, task-tracker highlights, token coverage, failed/blocked nodes, or validation evidence
- `init` -> `codex-project-init`
- `retrofit` -> `codex-project-retrofit`
- `change` -> `codex-change-workflow`
- `delivery` -> `codex-delivery-gate`

For app work that needs middleware, include `codex-runtime-readiness`.
For durable, release, migration, rollback, history, or customization concerns, include `codex-version-readiness`.

Read [commands.md](references/commands.md) for supported natural-language entry phrases.
