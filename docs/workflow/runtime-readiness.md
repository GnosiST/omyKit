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
6. Existing stopped containers and local images.

## Startup Order

```text
existing service -> compatible stopped container/local image -> project compose/script -> testcontainer/in-memory path -> temporary Docker container
```

Before pulling or building Docker images, inspect local images and containers. Reuse local images when the service family matches and the version difference is not material for the current verification. Prefer the actual local version for smoke tests and record it in the summary. Pull or build only when the image is missing, the project requires an exact version, a compatibility issue matters, or the user asks for a fresh image.

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
- Do not pull fresh Docker images when a compatible local image/container is already available.
- Do not reset or seed destructively without explicit permission.
- Continue with partial checks when middleware is unavailable, and state residual risk.
