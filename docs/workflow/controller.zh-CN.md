# Workflow Controller

语言：[English](controller.md) | [简体中文](controller.zh-CN.md)

omyKit workflow controller 是一个本地 C-lite 状态机，用于长任务、可续跑任务和多节点 Codex 工作。它补充 skill 层，不替代 Codex，不自己调用模型，不自动改代码，也不是后台服务。

当任务需要持久状态、结构化交接、重试可见性，或 compact 后续跑时使用它。

## 启用规则

| 模式 | Controller 使用方式 |
| --- | --- |
| Lite | 默认不启用。保持 brief -> execute -> verify。 |
| Standard | 只有任务多节点、容易 compact、需要并行、出现打回、需要续跑，或用户明确要求追踪状态时启用。 |
| Strict | 默认启用。使用任务图、handoff、evidence、blockers 和 delivery gates。 |

适合启用 controller 的信号：

- 多个阶段各自有独立验收条件
- 需要扇出 research、实现、评审或验证
- 测试或门禁失败后需要打回上游节点
- 长任务可能跨 context compact 或多个会话
- 用户希望任务自主推进，同时清楚记录阻塞项

## 运行位置

全局安装后，omyKit 会把 controller 放到：

```text
${CODEX_HOME:-$HOME/.codex}/omykit/scripts/omykit-workflow.mjs
${CODEX_HOME:-$HOME/.codex}/omykit/schemas/*.schema.json
```

在 omyKit 源码仓库内使用：

```bash
node scripts/omykit-workflow.mjs status
```

在目标项目中，优先使用项目本地的 `scripts/omykit-workflow.mjs`。没有项目本地脚本时，使用全局安装路径。

## 命令

```bash
node scripts/omykit-workflow.mjs init "feature title"
node scripts/omykit-workflow.mjs status
node scripts/omykit-workflow.mjs next
node scripts/omykit-workflow.mjs validate
node scripts/omykit-workflow.mjs start 03-implement
node scripts/omykit-workflow.mjs complete 03-implement --handoff handoffs/03-implement-to-04-verify.json
node scripts/omykit-workflow.mjs reject 04-verify --to 03-implement --handoff handoffs/04-verify-to-03-implement.reject.json
node scripts/omykit-workflow.mjs block 02-design --reason "Waiting for user confirmation"
node scripts/omykit-workflow.mjs resume
```

命令作用于当前项目的 `.omykit/workflows/<workflow-id>/`。如果存在多个 workflow，传入 `--workflow <workflow-id>`。

## 文件

```text
.omykit/
  workflows/
    <workflow-id>/
      graph.json
      state.json
      ledger.jsonl
      decisions.md
      blockers.md
      nodes/
      handoffs/
      evidence/
```

`graph.json` 定义 DAG。`state.json` 记录当前节点状态。`ledger.jsonl` 是追加式事件历史。`nodes/` 保存任务卡。`handoffs/` 保存结构化节点结果。`evidence/` 保存命令输出、截图、摘要或导出证据。

## Compact 后续跑

compact 或中断后按这个顺序读取：

1. `state.json`
2. `graph.json`
3. 最新相关 `ledger.jsonl` 事件
4. active、ready、failed 或 blocked 节点卡
5. 相关 handoff 和 evidence 摘要

只有下一步需要精确修改、引用原文、安全/法律/隐私判断，或失败根因分析时，才回到完整源码或完整证据。

## 不做什么

- 不启动 agent。
- 不调用 LLM。
- 不自动运行测试，除非 Codex 或用户显式运行命令。
- 不替代目标项目现有约定。
- 不让 Lite 工作默认变重。

参见 [task-graph.zh-CN.md](task-graph.zh-CN.md) 和 [handoff-protocol.zh-CN.md](handoff-protocol.zh-CN.md)。
