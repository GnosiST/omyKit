---
name: codex-runtime-readiness
description: Prepare local runtime dependencies for Codex app development and verification. Use when tests, dev servers, migrations, browser checks, or app smoke tests need databases, Redis, object storage, queues, emulators, Docker containers, Docker Compose, seed data, or health checks.
---

# Codex Runtime Readiness

Prepare middleware before running local verification. Prefer project-defined runtime paths over ad hoc containers.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

## Workflow

1. Apply `codex-context-budget`; start in `scan`.
2. Detect required services from project profile, README, env examples, compose files, package scripts, or tests.
3. Check current availability with non-destructive commands.
4. Choose runtime path in order:
   - existing running service
   - project `docker compose` or documented container command
   - testcontainers/in-memory alternative already used by tests
   - minimal temporary Docker command only when no project path exists
5. Start only required services.
6. Run health checks before app/test commands.
7. If service startup fails, summarize the missing dependency, command tried, and impact on verification.
8. Stop temporary containers only if this skill created them and the project does not expect them to remain running.

## Guardrails

- Do not invent credentials if project docs define them.
- Do not run destructive database resets unless the user or project docs explicitly allow it.
- Do not expose secrets in final output.
- Do not block all progress if middleware is unavailable; run checks that do not require it and state residual risk.

Read [docker-middleware.md](references/docker-middleware.md) for service patterns and health checks.
