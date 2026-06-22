# Codex Workflow Kit

语言：[English](codex-workflow-kit.md) | [简体中文](codex-workflow-kit.zh-CN.md)

Codex Workflow Kit 是一个以 Codex 为控制面的操作层，用于初始化或改造任何项目：应用开发、维护、演示文稿、视频、设计、研究和数据工作。

该套件让 Codex 保持控制面地位。其他工具只作为上下文来源、执行辅助、视觉画布、运行时辅助或交付门禁。

## 目标

- 在不膨胀上下文的前提下交付高质量结果。
- 在使用工具前先按项目类型路由。
- 渐进式上下文加载：`scan -> focus -> deep`。
- 用 Codex repo skills 编码可重复工作流。
- 本地验证前准备运行时依赖，包括 Docker 支持的中间件。
- 为历史追踪、回滚、发布和项目特定定制检查版本准备度。
- 在声明完成前提供交付物类型对应的证据。

## 核心流程

```text
intake -> route -> context budget -> spec/brief -> runtime readiness -> execute -> verify -> review -> deliver -> learn
```

在任务边界和有意义的阶段变化时应用流程。当当前路由仍然适用时，不要因为常规文件读取、编辑、shell 命令或中间检查而重启工作流。

## Skill 层

| Skill | 作用 |
| --- | --- |
| `omykit` | 初始化、改造、需求执行和交付检查的用户入口。 |
| `codex-project-router` | 判断入口类型、项目类型、模式和下一个 skill。 |
| `codex-context-budget` | 保持上下文和 token 使用最小化。 |
| `codex-project-init` | 用 Codex 工作流层初始化新项目。 |
| `codex-project-retrofit` | 在不破坏现有项目的前提下接入套件。 |
| `codex-change-workflow` | 从 brief/spec 到验证，执行具体变更。 |
| `codex-runtime-readiness` | 准备数据库、缓存、对象存储、队列、模拟器、Docker 或 GUI 运行时依赖。 |
| `codex-version-readiness` | 检查目标项目分支、发布、回滚、历史和定制化准备度。 |
| `codex-delivery-gate` | 在 handoff 前验证应用、deck、视频、设计、研究或数据交付物。 |

职责边界和防冲突规则见 [skill-coordination.zh-CN.md](skill-coordination.zh-CN.md)。

## 模式选择

| 模式 | 适用场景 | 形态 |
| --- | --- | --- |
| Lite | 小型、可逆、一次性工作 | brief -> execute -> minimum verification |
| Standard | 默认项目工作 | brief/spec -> plan -> execute -> focused gates |
| Strict | 持久、高风险、客户、架构、安全、迁移 | constitution/spec -> impact -> TDD/debug/plan -> full gates |

## 工具哲学

优先使用最具体且可靠的工具：

1. 项目原生命令、API 和文件。
2. 语义化或索引化上下文，例如 CodeGraph。
3. 专用 MCP/plugins，例如 Context7、Cowart、Figma、Canva、GitHub 或 Sentry。
4. 浏览器自动化，例如 Chrome Extension 或 Playwright。
5. 只有在本地 GUI 工作流没有更好接口时才使用 Computer Use。

## 运行时哲学

应用项目的本地验证经常需要中间件。不要假设它已经存在。

按这个顺序处理：

```text
already running service -> project compose/script -> testcontainer/in-memory path -> minimal temporary Docker command
```

除非项目文档或用户明确允许，不要运行破坏性 reset 或 migration。

## 交付证据

每次完成都应该说明：

- 改了什么或产出了什么
- 交付物在哪里
- 运行了哪些检查
- 跳过了哪些检查
- 剩余风险
- 稳定经验是否应更新到 docs、skills、hooks 或项目规则

## 新建或改造

新项目使用 `$omykit 初始化项目`。现有项目使用 `$omykit 改造旧项目`。在项目 profile 提供具体工具、命令和门禁之前，生成的规则应保持通用。

安装和首次使用见 [setup.zh-CN.md](setup.zh-CN.md)，回滚与历史准备度见 [versioning.zh-CN.md](versioning.zh-CN.md)，第三方 skill 协作见 [external-collaboration.zh-CN.md](external-collaboration.zh-CN.md)。
