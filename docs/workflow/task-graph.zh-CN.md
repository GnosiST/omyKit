# Task Graph

语言：[English](task-graph.md) | [简体中文](task-graph.zh-CN.md)

Controller 使用有向无环图。每个节点只负责一类事情，并声明依赖、验收条件和 handoff 要求。

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

这些字段避免同类能力“打架”：graph 负责依赖顺序，节点卡负责局部验收，handoff 负责证据，看板只负责把这些状态可视化。

多 agent 工作要分两层理解：

- `parallel_group`、`worker_profile`、`claimed_by` 和 `join_policy` 描述逻辑协作地图。
- handoff 里的 `agent_activity` 和相关 ledger event 描述真实 worker 活动，包括任务、状态、证据，以及可用时的 token 消耗。

不要把逻辑并行组当成真实物理并发证明；除非时间戳或 agent activity 记录能证明。

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

命令见 [controller.zh-CN.md](controller.zh-CN.md)，节点输出见 [handoff-protocol.zh-CN.md](handoff-protocol.zh-CN.md)。
