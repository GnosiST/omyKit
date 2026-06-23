# Docker And Middleware Readiness

Use Docker as a project runtime aid, not as an assumption.

## Detection Order

1. Read project profile/README/env examples/package scripts for required services.
2. Look for `compose.yaml`, `docker-compose.yml`, Dockerfiles, devcontainer, Makefile, task runner, or documented container names.
3. Check whether services are already running.
4. Check existing stopped containers and local images before pulling or building.
5. Use project scripts before ad hoc Docker commands.

## Service Checks

Use non-destructive checks:

- Database: TCP port, simple connection/query when credentials are documented.
- Redis/cache: ping.
- Object storage: health endpoint or bucket list only when credentials are documented.
- Queue/search: health endpoint or CLI ping.
- Browser/emulator/devtools: process or UI availability.

## Start Strategy

Prefer:

```text
running service -> compatible stopped container/local image -> project compose/script -> existing testcontainer/in-memory path -> minimal temporary Docker command
```

Avoid creating new persistent volumes unless the project docs expect them.

## Local Image Reuse

- Prefer an existing local image over `docker pull` when the service family matches and the version gap is not material for the current checks.
- Prefer an existing stopped container when its data/config belongs to the current project and restarting it is non-destructive.
- Treat patch-level or nearby minor-version differences as acceptable for local smoke tests unless project docs, migrations, protocol compatibility, or failing health checks require exact parity.
- Pull or build only when the required image is absent, the project pins an exact version, the local image is known incompatible, or the user requests a fresh image.
- Record the actual image/container/version used in the task summary so failures are traceable.

## Safety

- Never run destructive resets, migrations, or seed wipes unless the project docs or user explicitly allow it.
- Never invent credentials; use documented local defaults or ask.
- Do not expose secrets in summaries.
- Do not replace a working local container with a fresh image just to match documentation when the version difference is irrelevant to the current verification.
- If Docker is unavailable, continue with checks that do not require middleware and report residual risk.

## Temporary Containers

If no project runtime path exists and the user/project allows temporary containers:

- name containers clearly
- use local-only ports
- document credentials in the task note only if they are disposable local defaults
- stop/remove only containers created for this task
