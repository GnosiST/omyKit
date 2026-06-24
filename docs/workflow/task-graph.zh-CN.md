# Task Graph

语言：[English](task-graph.md) | [简体中文](task-graph.zh-CN.md)

Controller 使用有向无环图。每个节点只负责一类事情，并声明依赖、验收条件和 handoff 要求。

Graph 通常由 `change.standard`、`bugfix.standard`、`frontend-ui.strict` 或 `mission.orchestration` 等 workflow 模板编译而来。你仍然可以查看和编辑生成后的 `graph.json`，但持久改动通常应进入 template/profile YAML，让流程保持可复用。

## 节点类型

| Type | 职责 |
| --- | --- |
| `intake` | 固化目标、约束、交付物、语言和成功标准。 |
| `research` | 做有边界的证据调查，不修改交付物。 |
| `design` | 确定方案、边界、风险和验证策略。 |
| `plan` | 把已接受的设计拆成可执行步骤。 |
| `implement` | 修改代码、文档、配置或交付物。 |
| `verify` | 运行检查并记录通过、失败或跳过证据。 |
| `review` | 审查质量、风险、遗漏或 specialist 选择。 |
| `delivery` | 汇总最终证据和完成状态。 |
| `evolution` | 只有证据充分时，才把可复用 workflow 经验提升进 omyKit。 |

## 状态

```text
pending -> ready -> running -> passed
                         |-> failed
                         |-> blocked
                         |-> skipped
```

| Status | 含义 |
| --- | --- |
| `pending` | 依赖尚未满足。 |
| `ready` | 依赖已满足，节点可执行。 |
| `running` | 正在执行。 |
| `passed` | 节点完成，并有有效 handoff。 |
| `failed` | 节点发现问题，必须打回上游节点或被处理。 |
| `blocked` | 需要用户确认、访问权限、凭据、外部状态或缺失工具。 |
| `skipped` | 节点被明确跳过，并记录理由和影响。 |

## 模式

- **串行：**依赖通过或明确跳过后，下游节点变为 ready。
- **并行：**互不依赖的 ready 节点可以独立推进。
- **扇出：**一个 brief 可以分发给多个 research、implement 或 review 节点。
- **汇聚：**synthesis、verify 或 delivery 节点等待所有 required 依赖。
- **打回：**failed 节点必须声明 `reject_to`、证据和 required fix。
- **阻塞：**blocked 节点不应阻止无依赖关系的 ready 节点。
- **跳过：**跳过 required 工作必须说明理由和剩余风险。

## 协作元数据

节点可以包含可选协作字段。它们用于路由和看板展示，不会自动派发 worker。

| Field | 含义 |
| --- | --- |
| `worker_profile` | 建议 worker 分道，例如 `planner`、`researcher`、`coder`、`tester`、`reviewer`、`delivery` 或项目自定义 profile。 |
| `claimed_by` | 当前负责者。controller 只展示，不强制所有权。 |
| `parallel_group` | 命名并行组，方便扫描并行分支或工作泳道。 |
| `join_policy` | 下游汇聚如何处理该组：`all_required`、`any_passed` 或 `manual_review`。 |
| `lease_expires_at` | 未来用于超时或接管的元数据。当前 controller 只展示。 |
| `handoff_target` | 默认下游交接目标，方便看板显示流向。存在时必须指向已有节点。 |
| `task_complexity` | 不绑定供应商的任务难度信号：`simple`、`standard`、`complex` 或 `expert`。 |
| `model_tier` | 推荐模型档位：`fast`、`standard` 或 `frontier`；controller 只记录策略，不调用模型。 |
| `model_selection_reason` | 为什么使用该档位的简短说明。 |
| `recommended_model` | 可选的具体模型推荐；缺省时 controller 会根据当前 `model_profile` 和节点策略推导。 |
| `recommended_model_reason` | 为什么推荐该具体模型的简短说明。 |
| `estimated_minutes` | 用于看板 ETA 和剩余时间计算的计划估算。 |
| `agent` | 模板层期望执行或负责该节点的角色 id。 |
| `model_profile` | 模板层模型策略引用。 |
| `runtime_profile` | 模板层运行或验证环境引用。 |
| `safety_profile` | 模板层安全限位引用。 |
| `scorecard` | 用于审计该节点证据的 scorecard id。 |

这些字段避免同类能力“打架”：graph 负责依赖顺序，节点卡负责局部验收，handoff 负责证据，看板只负责把这些状态可视化。

多 agent 工作要分两层理解：

- `parallel_group`、`worker_profile`、`claimed_by` 和 `join_policy` 描述逻辑协作地图。
- handoff 里的 `agent_activity` 和相关 ledger event 描述真实 worker 活动，包括范围、任务、状态、证据、skill 使用记录，以及可用时的 token 消耗、上下文用量和时间戳。
- `orchestrate` 是面向用户的桥：它读取就绪节点和模型策略，写入 `orchestration-plan.json`，并返回 Codex 应在主线程、同 turn 子智能体、后台线程还是 worktree 中执行。`dispatch-plan` 保留为诊断和 controller 内部使用的低层原子命令。
- `downstream_context` 是节点交给下游的压缩事实包：保留目标、输入、证据、风险和上下文预算，避免下游重新加载整段对话。
- `context-pack` 是 controller 生成给单个节点或 worker 的最小可执行上下文，来源于 state、graph、节点卡、依赖 handoff、`downstream_context`、最近事件和后台命令记录。通常由 Codex 在 `orchestrate` 建议派发或需要 compact-safe 续接时内部生成。
- `commands/commands.jsonl` 只记录长命令运行事实，例如 dev server、测试 watcher、长构建和截图服务；它不代表节点通过，也不替代 handoff。

不要把逻辑并行组当成真实物理并发证明；除非时间戳或 agent activity 记录能证明。

用 `model_tier` 避免简单工作过度消耗：`fast` 用于清晰低风险任务，`standard` 用于常规实现和验证，`frontier` 用于架构、设计判断、高风险审查或未解决歧义。当前 `model_profile` 会把档位映射到推荐的具体模型，也可以按节点覆盖。只有当前 Codex worker 工具和策略允许模型 override 时，主控才应把编排计划里的推荐模型传给子智能体或新线程，同时保持主线程模型稳定。实际 provider/model 名称只记录在 handoff 执行元数据中，因为 controller 只推荐模型，不调用模型。若运行时无法 override 或无法暴露模型 metadata，记录推荐/实际差异和 `model_unavailable_reason`。

## 重试限制

每个 graph 节点都有 `retry_limit`。同一条打回边超过目标节点限制时，controller 会把目标节点标成 blocked，要求人工决策或设计复核，避免静默循环。

## 校验

`node scripts/omykit-workflow.mjs validate` 检查：

- 必需 workflow 文件存在
- graph 没有重复节点 id
- 依赖指向已有节点
- 依赖图没有环
- state 条目和 graph 节点一致
- 节点状态有效
- 协作元数据类型和 join policy 有效
- 节点卡存在
- handoff 文件字段完整

命令见 [controller.zh-CN.md](controller.zh-CN.md)、[workflow-templates.zh-CN.md](workflow-templates.zh-CN.md) 和 [handoff-protocol.zh-CN.md](handoff-protocol.zh-CN.md)。
