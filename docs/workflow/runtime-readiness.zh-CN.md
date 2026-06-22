# 运行时准备

语言：[English](runtime-readiness.md) | [简体中文](runtime-readiness.zh-CN.md)

Runtime readiness 在应用验证前准备本地服务。

## 依赖类型

- SQL databases
- Redis/cache
- S3-compatible object storage
- queues/search engines
- browsers and browser profiles
- mobile emulators or platform devtools
- export 或 preview 所需的 desktop GUI apps

## 发现顺序

1. Project profile 和 README。
2. Env examples 和 package scripts。
3. Docker/Compose/devcontainer 文件。
4. 使用 in-memory services 或 testcontainers 的测试。
5. 已运行的服务。

## 启动顺序

```text
existing service -> project compose/script -> testcontainer/in-memory path -> temporary Docker container
```

## 健康检查

使用非破坏性检查：

- TCP port 或 health endpoint。
- 轻量连接/query。
- Ping command。
- Browser page load。
- GUI app availability。

## 安全

- 不要编造 credentials。
- 不要暴露 secrets。
- 未经明确许可，不要 destructive reset 或 seed。
- 当 middleware 不可用时继续做 partial checks，并说明剩余风险。
