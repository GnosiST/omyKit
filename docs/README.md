# omyKit Documentation

This directory contains the human-readable operating notes behind the omyKit skill layer. The skills stay concise; longer guidance lives here.

Languages: [English](README.md) | [简体中文](README.zh-CN.md)

## Start Here

| Document | Purpose |
| --- | --- |
| [Workflow kit](workflow/codex-workflow-kit.md) | End-to-end model, skill map, mode selection, and tool philosophy. |
| [Skill coordination](workflow/skill-coordination.md) | Integrated skill responsibilities, handoffs, and conflict-prevention rules. |
| [Language policy](workflow/language-policy.md) | How visible reasoning summaries, questions, status, and handoff match the user's language. |
| [Setup](workflow/setup.md) | Global install, first-use prompts, optional repo-local copy, and validation notes. |
| [Context budget](workflow/context-budget.md) | How to keep Codex context loading small and progressive. |
| [Runtime readiness](workflow/runtime-readiness.md) | How to prepare local middleware before verification. |
| [Versioning readiness](workflow/versioning.md) | How to assess branch, release, rollback, history, and customization readiness. |
| [Delivery gates](workflow/delivery-gates.md) | Artifact-specific checks before handoff or release. |
| [Tool registry](workflow/tool-registry.md) | How Codex selects tools and optional PM, UI design, design-taste, and ecosystem patterns without using all tools by default. |

## Documentation Policy

- Keep reusable workflow guidance in `docs/workflow/`.
- Keep skill files concise and procedural.
- Do not put project-specific stack choices, ports, credentials, or product rules in the generic kit.
- When a rule is stable and affects agents in this repository, record it in `AGENTS.md`.
- When a rule only explains usage or release flow, keep it in README or docs.
