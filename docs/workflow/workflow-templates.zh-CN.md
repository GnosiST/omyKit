# Workflow 模板

语言：[English](workflow-templates.md) | [简体中文](workflow-templates.zh-CN.md)

omyKit workflow 模板为 controller 定义可复用任务地图。它们是配置，不是另一套实现路径：`init` 会把模板 YAML 编译成 controller 一直使用的 `.omykit/workflows/<workflow-id>/graph.json`、节点卡、state、handoff 和看板投影。

## 内置模板

| 模板 | 模式 | 使用场景 |
| --- | --- | --- |
| `change.standard` | Standard | 有边界的功能、重构、文档或维护任务。 |
| `bugfix.standard` | Standard | 缺陷修复的复现、诊断、修复、验证、评审和交付。 |
| `frontend-ui.strict` | Strict | 需要 UI 方向、实现、浏览器/视觉验收、评审和交付的设计敏感前端任务。 |
| `deck.proposal` | Strict | 需要方向选项、来源安全 specialist 选择、产物生产、导出验证和交付证据的提案或演示文稿任务。 |
| `mission.orchestration` | Strict | 需要需求洞察、任务拆解、工作流路由、执行监听、集成验票和学习沉淀的复杂需求。 |

先选择最接近的模板。`init --template auto` 会根据任务 brief 自动选择；显式 `--template <id>` 会覆盖自动选择。不要让所有任务都使用最严格的图；只有确实需要状态、交接、重试、并行或 compact 恢复时，controller 才有价值。

## 分层

模板位于 `workflow-templates/`：

```text
workflow-templates/
  common/
    agents.yaml
    model-profiles.yaml
    runtime-profiles.yaml
    safety-limits.yaml
    scorecards/
  templates/
    change.standard.yaml
    bugfix.standard.yaml
    frontend-ui.strict.yaml
    deck.proposal.yaml
    mission.orchestration.yaml
```

这些层要分开维护：

| 层 | 什么时候改 |
| --- | --- |
| 模板图 | 节点顺序、依赖、重试上限、汇聚或 handoff 目标变化。 |
| agent 集合 | 角色名、边界或预期 scope 变化。 |
| 模型配置 | 模型档位选择、档位到具体模型的推荐映射，或节点级模型覆盖变化。 |
| 运行配置 | 验证需要不同本地环境或工具链。 |
| 安全限位 | 重试、权限、并行或停止条件变化。 |
| scorecard | 证据门禁需要新增、删除或收紧。 |

这种分层让你可以新增节点而不重写模型策略，调整 agent 而不改拓扑，收紧证据检查而不改变执行流。

## 命令

```bash
node scripts/omykit-workflow.mjs templates list --lang zh-CN
node scripts/omykit-workflow.mjs templates show frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs templates validate
node scripts/omykit-workflow.mjs init "Coordinate a complex release" --template auto
node scripts/omykit-workflow.mjs init "Fix checkout bug" --template bugfix.standard
node scripts/omykit-workflow.mjs init "Redesign settings page" --template frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs init "制作融资路演 PPT" --template deck.proposal --lang zh-CN
node scripts/omykit-workflow.mjs scorecard --workflow <workflow-id>
```

Codex-first 使用仍然应该通过 `$omykit`。Codex 可以在内部运行这些命令，然后把所选模板、生成的 workflow 路径、下一步、看板链接、scorecard 结果和剩余风险返回给用户。

## Scorecard

Scorecard 检查已记录的 workflow 证据。它不能取代判断，但能避免薄弱的“已完成”声明悄悄通过。

当前证据检查覆盖：

- 终态节点 handoff 摘要
- 入口执行方案、推荐方案、已选方案和实现前确认状态
- 实际工作项记录
- 通过且交给下游节点时的下游上下文记录
- 变更文件摘要
- 验证记录和证据路径
- 实际使用过 skill 时的 skill 使用记录
- 推荐模型、worker 创建时的模型 override 意图，以及运行环境暴露时的实际模型记录
- 来源感知 token 和上下文用量记录
- `usage_observation` 记录 token/模型运行时不可观测原因，避免把不可观测和未记录混在一起
- 必需节点没有失败或阻塞
- 子智能体 role/scope/task/status 记录
- expert 复杂度必须使用 frontier 模型档位
- 看板语言与 workflow 语言一致，除非显式覆盖

失败的必需检查会投影为看板整改建议。推荐检查会变成 warning。

## 语言

模板为名称、目标和验收条件保存英文与简体中文。看板语言按以下顺序确定：

1. 显式 `--lang`
2. workflow metadata 语言
3. 最新 handoff 语言
4. 标题语言推断

对于中文用户提示，`$omykit` 应使用 `--lang zh-CN` 初始化追踪 workflow，或依靠中文标题推断。模板包含中文时，节点详情不应回退成英文。

## 定制规则

- 模板保持通用。不要把目标项目端口、凭据、产品规则或特定技术栈假设写进 omyKit 模板。
- 当图拓扑确实不同，新增模板。
- 交付物是 PPT、presentation、slide deck、pitch deck 或提案 deck 时使用 `deck.proposal`。该模板把故事线、方向、生产、美化、验证和交付拆开，让 bundled presentation 工具、Canva、PPT Master、Guizang 和外部模板参考按能力协作，而不是抢同一份工作。
- 当证据期望不同但流程相同，新增或修改 scorecard。通用追踪型交付 scorecard 要求 `evolution_candidates` 和 `knowledge_sync`，并在使用 specialist skill 时推荐记录 `skill_decisions`，确保 workflow 进化、docs/记忆收尾和同类 skill 选择都能审查。
- 当验证环境不同但图拓扑不变，新增 runtime profile。
- 当成本/质量策略或具体模型推荐不同但节点职责不变，新增 model profile。
- 第三方 skill 只能作为有边界参考；不要把第三方 skill 正文、模板、badge、图片或 branding 复制进 omyKit。
