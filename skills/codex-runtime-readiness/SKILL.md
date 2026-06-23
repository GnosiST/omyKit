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
   - existing stopped container with compatible local data/config
   - project `docker compose` or documented container command
   - testcontainers/in-memory alternative already used by tests
   - minimal temporary Docker command only when no project path exists
5. Before pulling or building images, inspect local images and containers. Reuse local images when the service family matches and the version difference is not material for the current verification; record the actual local version in the summary.
6. Pull or build new images only when the required image is missing, project docs require an exact version, a known incompatibility matters, or the user explicitly asks for a fresh image.
7. Start only required services.
8. Run health checks before app/test commands.
9. If service startup fails, summarize the missing dependency, command tried, local image/container state, and impact on verification.
10. Stop temporary containers only if this skill created them and the project does not expect them to remain running.

## Guardrails

- Do not invent credentials if project docs define them.
- Do not run destructive database resets unless the user or project docs explicitly allow it.
- Do not expose secrets in final output.
- Do not pull fresh Docker images when a compatible local image/container is already available and the task does not require exact-version parity.
- Do not block all progress if middleware is unavailable; run checks that do not require it and state residual risk.

Read [docker-middleware.md](references/docker-middleware.md) for service patterns and health checks.
