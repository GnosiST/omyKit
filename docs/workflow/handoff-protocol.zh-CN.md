# Handoff Protocol

语言：[English](handoff-protocol.md) | [简体中文](handoff-protocol.zh-CN.md)

每个 controller 节点结束时都必须输出结构化 handoff。handoff 是节点之间的契约，让 controller 判断继续、打回、阻塞或暴露风险。

## 必需基础字段

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "03-implement",
  "status": "passed",
  "summary": "已完成限定范围内的实现。"
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
  "summary": "已完成限定范围内的实现，并更新聚焦测试。",
  "work_items": [
    {
      "title": "补齐空状态文案兜底",
      "status": "done",
      "detail": "保留既有 API 契约，只修改 UI 兜底分支。",
      "files": [
        "src/foo.ts"
      ],
      "evidence": [
        "evidence/03-implement-test-output.txt"
      ]
    }
  ],
  "outputs": [
    "src/foo.ts",
    "tests/foo.test.ts"
  ],
  "changed_files": [
    {
      "path": "src/foo.ts",
      "status": "modified",
      "summary": "增加空状态兜底。"
    }
  ],
  "verification": [
    {
      "command": "npm test -- foo",
      "result": "passed",
      "evidence": "evidence/03-implement-test-output.txt"
    }
  ],
  "agent_activity": [
    {
      "agent_id": "agent-1",
      "role": "coder",
      "task": "实现限定范围内的兜底逻辑并补测试。",
      "status": "done",
      "evidence": [
        "evidence/03-implement-test-output.txt"
      ],
      "token_usage": {
        "source": "tool_reported",
        "model": "gpt-5.4",
        "total_tokens": 18420
      }
    }
  ],
  "token_usage": {
    "source": "derived_from_agent_activity",
    "total_tokens": 18420,
    "notes": "由已记录的 agent activity 汇总。"
  },
  "open_risks": [],
  "non_blocking_notes": [],
  "next_recommended_node": "04-verify"
}
```

使用 `work_items` 和 `changed_files`，让看板成为任务追踪表，而不是通用状态板。实际使用了子智能体、worker、reviewer 或外部协作者时，用 `agent_activity` 记录。

token 记录必须有来源。能拿到 provider/tool 报告的精确用量时记录精确值；否则使用 `manual`、`estimated`，或者不记录。不要在环境没有暴露 Codex Desktop 或聊天 token 时编造数字。

## Failed And Reject

节点无法接受上游输出时使用 `failed`。必须声明打回给谁。

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "04-verify",
  "status": "failed",
  "summary": "聚焦回归测试失败。",
  "reject_to": "03-implement",
  "reason": "空状态行为发生回归。",
  "evidence": [
    "evidence/04-verify-test-output.txt"
  ],
  "required_fix": "保留原空状态行为，并重新运行聚焦测试。"
}
```

## Blocked

需要用户决策、凭据、访问权限、外部状态或缺失工具时使用 `blocked`。

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "02-design",
  "status": "blocked",
  "summary": "交付策略需要确认。",
  "blocker_type": "user_confirmation",
  "question": "是否自动创建 release tag？",
  "blocked_scope": "仅交付阶段",
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
  "summary": "没有渲染 UI 变化。",
  "reason": "本次只修改非视觉类 markdown 文档。"
}
```

## 规则

- 没有证据不要把节点标成 `passed`。
- 不要用自由文本“完成了”替代 handoff JSON。
- 打回必须有 `reject_to`、`reason`、`evidence` 和 `required_fix`。
- blocked 节点不要阻塞无依赖关系的 ready 节点。
- evidence 路径必须能从 workflow 目录或目标项目找回。
- 用户可见 summary 使用用户当前语言。
- token 用量必须带来源；无法取得真实用量时标记未记录，不要估成 0。

节点状态见 [task-graph.zh-CN.md](task-graph.zh-CN.md)，命令见 [controller.zh-CN.md](controller.zh-CN.md)。
