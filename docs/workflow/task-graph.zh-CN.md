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
- 节点卡存在
- handoff 文件字段完整

命令见 [controller.zh-CN.md](controller.zh-CN.md)，节点输出见 [handoff-protocol.zh-CN.md](handoff-protocol.zh-CN.md)。
