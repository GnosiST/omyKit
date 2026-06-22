---
name: codex-project-init
description: Initialize a new project with a Codex-centered workflow layer. Use when starting an app, deck, video, design, research, data, or mixed project and the repository lacks durable Codex rules, project profile, delivery gates, runtime readiness rules, or workflow skills.
---

# Codex Project Init

Create the minimum durable workflow layer for a new project.

## Workflow

1. Apply `codex-context-budget`; start in `scan`.
2. Identify project type and mode from `codex-project-router`.
3. Create or update only missing workflow files:
   - `AGENTS.md`: stable repo rules, commands, boundaries, definition of done.
   - `docs/workflow/project-profile.md`: project type, artifacts, tools, gates.
   - `docs/workflow/tool-registry.md`: tool roles and when not to use them.
   - `docs/workflow/delivery-gates.md`: evidence required before handoff.
   - `docs/workflow/versioning.md`: branch, release, history, customization, and rollback expectations.
   - `.agents/skills/`: repo skills only when the workflow will repeat.
4. Choose spec source:
   - Lite: one-page brief.
   - Standard: OpenSpec-style change or `docs/specs`.
   - Strict: Spec-Kit constitution plus change specs.
5. Invoke `codex-version-readiness` for durable projects to define git state, branch convention, version source, changelog/release notes, rollback expectations, and customization boundary.
6. For app projects, define runtime readiness: required middleware, Docker/Compose path, health checks, reset/seed commands, and fallback if Docker is unavailable.
7. Add hooks only after the workflow is accepted; begin with reminders before hard blocking.

## Guardrails

- Do not overwrite existing project conventions.
- Do not add all possible tools; add only tools needed by this project type.
- Do not write historical notes into `AGENTS.md`.
- Do not create a plugin until the repo version works across real tasks.

Read [templates.md](references/templates.md) for minimal templates.
