# omyKit 文档

本目录保存 omyKit skill 层背后的可读工作流说明。Skill 文件保持简短，较长的背景、清单和维护说明放在这里。

语言：[English](README.md) | [简体中文](README.zh-CN.md)

## 从这里开始

| 文档 | 作用 |
| --- | --- |
| [工作流套件](workflow/codex-workflow-kit.zh-CN.md) | 端到端模型、skill 映射、模式选择和工具哲学。 |
| [Skill 协调机制](workflow/skill-coordination.zh-CN.md) | 集成 skill 的职责、交接方式和防冲突规则。 |
| [语言策略](workflow/language-policy.zh-CN.md) | 可见推理摘要、问题、状态和 handoff 如何跟随用户语言。 |
| [安装与使用](workflow/setup.zh-CN.md) | 全局安装、首次使用 prompt、可选 repo-local 副本和校验说明。 |
| [上下文预算](workflow/context-budget.zh-CN.md) | 如何让 Codex 以小而渐进、并具备压缩感知的方式加载上下文。 |
| [运行时准备](workflow/runtime-readiness.zh-CN.md) | 在验证前准备本地中间件和服务。 |
| [版本管理准备度](workflow/versioning.zh-CN.md) | 检查分支、发布、回滚、历史追踪和定制化边界。 |
| [交付门禁](workflow/delivery-gates.zh-CN.md) | handoff 或 release 前按交付物类型运行检查。 |
| [工具注册表](workflow/tool-registry.zh-CN.md) | 如何选择工具，并在不默认启用所有工具的前提下按需使用 workflow、spec、代码智能、文档、设计、动效、生态和上下文压缩模式。 |
| [上游参考监控](workflow/upstream-watch.zh-CN.md) | 如何检查被引用的外部来源变化，并只吸收可复用 workflow 经验。 |
| [Workflow 进化](workflow/evolution.zh-CN.md) | 如何把反复出现的 workflow 经验提升进 omyKit，同时避免导入目标项目事实。 |

## 文档维护原则

- 可复用工作流指导放在 `docs/workflow/`。
- Skill 文件保持简洁、程序化。
- 不要把项目特定技术栈、端口、凭据或产品规则写入通用套件。
- 稳定且影响本仓库 agent 行为的规则写入 `AGENTS.md`。
- 使用说明、发布流程和面向用户的解释放在 README 或 docs。
