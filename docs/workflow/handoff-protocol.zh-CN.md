# Handoff Protocol

语言：[English](handoff-protocol.md) | [简体中文](handoff-protocol.zh-CN.md)

每个 controller 节点结束时都必须输出结构化 handoff。handoff 是节点之间的契约，让 controller 判断继续、打回、阻塞或暴露风险。

## 必需基础字段

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "03-implement",
  "status": "passed",
  "summary": "Implemented the scoped change."
}
```

`status` 必须是 `passed`、`failed`、`blocked` 或 `skipped`。

## Passed

节点完成并有证据时使用 `passed`。

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "03-implement",
  "status": "passed",
  "summary": "Implemented the scoped change.",
  "outputs": [
    "src/foo.ts",
    "tests/foo.test.ts"
  ],
  "verification": [
    {
      "command": "npm test -- foo",
      "result": "passed",
      "evidence": "evidence/03-implement-test-output.txt"
    }
  ],
  "open_risks": [],
  "non_blocking_notes": [],
  "next_recommended_node": "04-verify"
}
```

## Failed And Reject

节点无法接受上游输出时使用 `failed`。必须声明打回给谁。

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "04-verify",
  "status": "failed",
  "summary": "Focused regression test failed.",
  "reject_to": "03-implement",
  "reason": "Empty-state behavior regressed.",
  "evidence": [
    "evidence/04-verify-test-output.txt"
  ],
  "required_fix": "Preserve the previous empty-state behavior and rerun the focused test."
}
```

## Blocked

需要用户决策、凭据、访问权限、外部状态或缺失工具时使用 `blocked`。

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "02-design",
  "status": "blocked",
  "summary": "Delivery policy needs confirmation.",
  "blocker_type": "user_confirmation",
  "question": "Should release tagging be automatic?",
  "blocked_scope": "delivery only",
  "can_continue_nodes": [
    "03-research-current-docs"
  ]
}
```

## Skipped

只有明确跳过且剩余风险清楚时，才使用 `skipped`。

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "05-visual-review",
  "status": "skipped",
  "summary": "No rendered UI changed.",
  "reason": "The change only touched non-visual markdown docs."
}
```

## 规则

- 没有证据不要把节点标成 `passed`。
- 不要用自由文本“完成了”替代 handoff JSON。
- 打回必须有 `reject_to`、`reason`、`evidence` 和 `required_fix`。
- blocked 节点不要阻塞无依赖关系的 ready 节点。
- evidence 路径必须能从 workflow 目录或目标项目找回。
- 用户可见 summary 使用用户当前语言。

节点状态见 [task-graph.zh-CN.md](task-graph.zh-CN.md)，命令见 [controller.zh-CN.md](controller.zh-CN.md)。
