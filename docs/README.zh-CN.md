# omyKit 文档

本目录保存 omyKit skill 层背后的可读工作流说明。Skill 文件保持简短，较长的背景、清单和维护说明放在这里。

语言：[English](README.md) | [简体中文](README.zh-CN.md)

## 从这里开始

| 文档 | 作用 |
| --- | --- |
| [工作流套件](workflow/codex-workflow-kit.zh-CN.md) | 端到端模型、skill 映射、模式选择和工具哲学。 |
| [Skill 协调机制](workflow/skill-coordination.zh-CN.md) | 集成 skill 的职责、交接方式和防冲突规则。 |
| [Workflow controller](workflow/controller.zh-CN.md) | 用于持久任务图、状态和续跑的本地 C-lite controller。 |
| [Workflow 模板](workflow/workflow-templates.zh-CN.md) | 用于可复用 controller 运行的分层 YAML workflow 模板、profiles 和 scorecards。 |
| [Task graph](workflow/task-graph.zh-CN.md) | 节点类型、状态、依赖、扇出、汇聚、打回、阻塞和重试限制。 |
| [Handoff protocol](workflow/handoff-protocol.zh-CN.md) | passed、failed、blocked 和 skipped 状态的结构化节点输出。 |
| [多 Agent 协作](workflow/multi-agent-coordination.zh-CN.md) | 工作流意图、参考对象、实现评估和 Codex thread-native 多 agent 路线。 |
| [语言策略](workflow/language-policy.zh-CN.md) | 可见推理摘要、问题、状态和 handoff 如何跟随用户语言。 |
| [安装与使用](workflow/setup.zh-CN.md) | Codex-first 安装、首次使用 prompt、可选 repo-local 副本和校验说明。 |
| [上下文预算](workflow/context-budget.zh-CN.md) | 如何让 Codex 以小而渐进、并具备压缩感知的方式加载上下文。 |
| [运行时准备](workflow/runtime-readiness.zh-CN.md) | 在验证前准备本地中间件和服务。 |
| [版本管理准备度](workflow/versioning.zh-CN.md) | 检查分支、发布、回滚、历史追踪和定制化边界。 |
| [交付门禁](workflow/delivery-gates.zh-CN.md) | handoff 或 release 前按交付物类型运行检查。 |
| [工具注册表](workflow/tool-registry.zh-CN.md) | 如何选择工具，并标记每个条目的来源类型和已验证来源，避免默认启用所有工具。 |
| [上游参考监控](workflow/upstream-watch.zh-CN.md) | 如何验证外部来源身份、跟踪上游变化，并只吸收范围明确的 workflow 经验。 |
| [Workflow 进化](workflow/evolution.zh-CN.md) | 如何把反复出现的 workflow 经验提升进 omyKit，同时避免导入目标项目事实。 |

## 文档维护原则

- 可复用工作流指导放在 `docs/workflow/`。
- Skill 文件保持简洁、程序化。
- 不要把项目特定技术栈、端口、凭据或产品规则写入通用套件。
- 稳定且影响本仓库 agent 行为的规则写入 `AGENTS.md`。
- 使用说明、发布流程和面向用户的解释放在 README 或 docs。
