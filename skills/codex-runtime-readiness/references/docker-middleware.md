# Docker And Middleware Readiness

Use Docker as a project runtime aid, not as an assumption.

## Detection Order

1. Read project profile/README/env examples/package scripts for required services.
2. Look for `compose.yaml`, `docker-compose.yml`, Dockerfiles, devcontainer, Makefile, task runner, or documented container names.
3. Check whether services are already running.
4. Use project scripts before ad hoc Docker commands.

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
project compose/script -> existing testcontainer/in-memory path -> minimal temporary Docker command
```

Avoid creating new persistent volumes unless the project docs expect them.

## Safety

- Never run destructive resets, migrations, or seed wipes unless the project docs or user explicitly allow it.
- Never invent credentials; use documented local defaults or ask.
- Do not expose secrets in summaries.
- If Docker is unavailable, continue with checks that do not require middleware and report residual risk.

## Temporary Containers

If no project runtime path exists and the user/project allows temporary containers:

- name containers clearly
- use local-only ports
- document credentials in the task note only if they are disposable local defaults
- stop/remove only containers created for this task
