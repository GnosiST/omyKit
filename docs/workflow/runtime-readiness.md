# Runtime Readiness

Language: [English](runtime-readiness.md) | [简体中文](runtime-readiness.zh-CN.md)

Runtime readiness prepares local services before app verification.

## Dependency Classes

- SQL databases
- Redis/cache
- object storage such as S3-compatible services
- queues/search engines
- browsers and browser profiles
- mobile emulators or platform devtools
- desktop GUI apps required for export or preview

## Discovery Order

1. Project profile and README.
2. Env examples and package scripts.
3. Docker/Compose/devcontainer files.
4. Tests that use in-memory services or testcontainers.
5. Existing running services.

## Startup Order

```text
existing service -> project compose/script -> testcontainer/in-memory path -> temporary Docker container
```

## Health Checks

Use non-destructive checks:
- TCP port or health endpoint.
- Lightweight connection/query.
- Ping command.
- Browser page load.
- GUI app availability.

## Safety

- Do not invent credentials.
- Do not expose secrets.
- Do not reset or seed destructively without explicit permission.
- Continue with partial checks when middleware is unavailable, and state residual risk.
