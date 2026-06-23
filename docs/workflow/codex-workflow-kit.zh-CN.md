# Codex Workflow Kit

语言：[English](codex-workflow-kit.md) | [简体中文](codex-workflow-kit.zh-CN.md)

Codex Workflow Kit 是一个以 Codex 为控制面的操作层，用于初始化或改造任何项目：应用开发、维护、演示文稿、视频、设计、研究和数据工作。

该套件让 Codex 保持控制面地位。其他工具只作为上下文来源、执行辅助、视觉画布、运行时辅助或交付门禁。

## 目标

- 在不膨胀上下文的前提下交付高质量结果。
- 在使用工具前先按项目类型路由。
- 渐进式上下文加载：`scan -> focus -> deep`。
- 压缩感知的上下文管理：先避免和缩小范围，再摘要，只有可取回原文时才使用可选本地压缩。
- 长任务、可续跑任务和多节点任务可按需启用 C-lite workflow controller。
- 用 Codex repo skills 编码可重复工作流。
- 本地验证前准备运行时依赖，包括 Docker 支持的中间件。
- 为历史追踪、回滚、发布和项目特定定制检查版本准备度。
- 可见推理摘要、问题、进度和 handoff 跟随用户语言。
- 在声明完成前提供交付物类型对应的证据。
- 基于证据改进 workflow，同时避免把目标项目事实导入通用 kit。
- 定期检查影响 workflow、spec、代码智能、文档、设计、动效、生态和上下文压缩的官方参考来源。

## 核心流程

```text
intake -> route -> context budget -> spec/brief -> runtime readiness -> execute -> verify -> review -> deliver -> learn
```

在任务边界和有意义的阶段变化时应用流程。当当前路由仍然适用时，不要因为常规文件读取、编辑、shell 命令或中间检查而重启工作流。

## 可用性控制

- 入口路由确定后保持稳定；只有范围、风险、交付物类型或用户意图变化时才重新判断。
- 只有安全假设会带来风险时才提问。提问时可以给建议选项，但必须允许用户自定义答案。
- 默认不堆叠同类 skill；先选一个主能力，只有覆盖独立缺口时才加更窄的 specialist。
- 把外部项目当作带链接和审查记录的参考信号，不把它们当作 vendored skill 内容。
- 可见推理摘要、状态更新、问题和 handoff 跟随用户最新提示词语言。

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
| `codex-workflow-evolution` | 在证据和抽象测试通过后，把反复出现的 workflow 经验提升进 omyKit。 |

职责边界和防冲突规则见 [skill-coordination.zh-CN.md](skill-coordination.zh-CN.md)。

## 模式选择

| 模式 | 适用场景 | 形态 |
| --- | --- | --- |
| Lite | 小型、可逆、一次性工作 | brief -> execute -> minimum verification |
| Standard | 默认项目工作 | brief/spec -> plan -> execute -> focused gates；只有多节点、可续跑、被打回或容易 compact 的任务才启用 controller |
| Strict | 持久、高风险、客户、架构、安全、迁移 | constitution/spec -> task graph -> impact -> TDD/debug/plan -> full gates |

## Workflow Controller

长任务或需要高可观测性的工作可以使用本地 controller：

```text
skill route -> task graph -> node execution -> structured handoff -> verify/reject/block -> delivery
```

Controller 把状态保存到 `.omykit/workflows/<workflow-id>/`，校验 handoff 文件，推荐 ready 节点，并降低 compact 后续跑成本。它不调用模型，不替代 Codex，也不会让 Lite 任务默认变重。

参见 [controller.zh-CN.md](controller.zh-CN.md)、[task-graph.zh-CN.md](task-graph.zh-CN.md) 和 [handoff-protocol.zh-CN.md](handoff-protocol.zh-CN.md)。

## 工具哲学

优先使用最具体且可靠的工具：

1. 项目原生命令、API 和文件。
2. 语义化或索引化上下文，例如 CodeGraph。
3. 通过 Context7、Figma 或其他选中的设计来源获取聚焦文档或选中交付物上下文。
4. 原生缩小范围仍不够时，对大型可取回输出使用可选本地压缩。
5. 当 Canva、GitHub、Sentry、可选本地压缩或 artifact 工具能实质改变下一步决策时，才调用专用 MCP/plugins。
6. 浏览器自动化，例如 Chrome Extension 或 Playwright。
7. 只有在本地 GUI 工作流没有更好接口时才使用 Computer Use。

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
- 稳定经验是否应触发 `codex-workflow-evolution`

## 新建或改造

新项目使用 `$omykit 初始化项目`。现有项目使用 `$omykit 改造旧项目`。在项目 profile 提供具体工具、命令和门禁之前，生成的规则应保持通用。

安装和首次使用见 [setup.zh-CN.md](setup.zh-CN.md)，语言策略见 [language-policy.zh-CN.md](language-policy.zh-CN.md)，回滚与历史准备度见 [versioning.zh-CN.md](versioning.zh-CN.md)，workflow、spec、代码智能、文档、设计、动效、生态资源发现和上下文压缩的按需选择规则见 [tool-registry.zh-CN.md](tool-registry.zh-CN.md)，外部参考检查见 [upstream-watch.zh-CN.md](upstream-watch.zh-CN.md)，持久任务图见 [controller.zh-CN.md](controller.zh-CN.md)，证据驱动的 workflow 改进见 [evolution.zh-CN.md](evolution.zh-CN.md)。
