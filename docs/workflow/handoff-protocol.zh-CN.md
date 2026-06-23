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

## 入口决策

通过的 intake 节点必须记录 `intake_decision`。这样路由、workflow 选择、关键假设和提问策略可以被审计，而不是只靠自然语言声明。

```json
{
  "intake_decision": {
    "goal": "实现可追踪的设置页变更。",
    "route": {
      "entry": "change",
      "project_type": "app",
      "mode": "Standard",
      "next_skill": "codex-change-workflow"
    },
    "workflow": {
      "shape": "tracked controller workflow",
      "controller_enabled": true,
      "template_id": "change.standard",
      "reason": "任务是多节点工作，并且需要 compact 后续跑。"
    },
    "assumptions": [
      {
        "text": "使用项目已有测试命令。",
        "impact": "验证保持项目原生。"
      }
    ],
    "questions": [
      {
        "question": "使用哪种交付模式？",
        "options": [
          "Standard",
          "Strict"
        ],
        "answer": "Standard，并补充自定义视觉验收说明。",
        "custom_answer_allowed": true,
        "resolved": true
      }
    ],
    "custom_answers_allowed": true
  }
}
```

没有需要提问时，使用空的 `questions` 数组。确实需要提问时，限制在 1-3 个问题，并记录已允许自定义答案。

## Workflow 进化复盘

通过的 delivery 节点必须记录 `evolution_candidates`。交付时已经复盘但没有可沉淀的 workflow 经验时，使用空数组。确实存在候选时，记录适用范围、证据、负责人、更新位置、下一步动作和提升状态，便于 `codex-workflow-evolution` 关闭闭环。

```json
{
  "evolution_candidates": [
    {
      "lesson": "交付节点应记录 workflow 进化候选。",
      "scope": "generic_omykit",
      "promotion_status": "candidate",
      "owner": "codex-workflow-evolution",
      "update_surface": "workflow template / scorecard",
      "rationale": "适用于所有 tracked workflow 的交付复盘。",
      "next_action": "修改 omyKit 前先运行抽象测试。",
      "evidence": [
        "evidence/06-delivery-summary.txt"
      ]
    }
  ]
}
```

`scope` 允许 `generic_omykit`、`project_local`、`one_off` 和 `volatile_ecosystem`。`promotion_status` 允许 `candidate`、`promoted`、`not_promoted` 和 `needs_review`。真实候选至少需要一个证据路径。

## Passed

节点完成并有证据时使用 `passed`。

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "03-implement",
  "status": "passed",
  "language": "zh-CN",
  "model": "GPT-5.4",
  "model_provider": "openai",
  "model_tier": "standard",
  "model_selection_reason": "限定范围实现并补测试，不涉及架构决策。",
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
  "skills_used": [
    {
      "name": "omykit",
      "source": "local_skill",
      "path": "/Users/example/.codex/skills/omykit/SKILL.md",
      "purpose": "路由并操作可追踪 workflow。",
      "triggered_by": "$omykit",
      "evidence": [
        "evidence/03-implement-test-output.txt"
      ]
    }
  ],
  "agent_activity": [
    {
      "agent_id": "agent-1",
      "role": "coder",
      "scope": "src/foo.ts 和 tests/foo.test.ts",
      "task": "实现限定范围内的兜底逻辑并补测试。",
      "status": "done",
      "model_tier": "standard",
      "model": "GPT-5.4",
      "model_provider": "openai",
      "model_selection_reason": "限定范围实现并补测试，不涉及架构决策。",
      "started_at": "2026-06-23T10:00:00.000Z",
      "completed_at": "2026-06-23T10:24:00.000Z",
      "evidence": [
        "evidence/03-implement-test-output.txt"
      ],
      "skills_used": [
        {
          "name": "codex-change-workflow",
          "source": "local_skill",
          "purpose": "约束实现和验证范围。",
          "evidence": [
            "evidence/03-implement-test-output.txt"
          ]
        }
      ],
      "token_usage": {
        "source": "tool_reported",
        "provider": "openai",
        "model": "GPT-5.4",
        "total_tokens": 18420
      },
      "context_usage": {
        "source": "estimated_from_files",
        "context_level": "focus",
        "estimated_tokens": 6200,
        "input_files": 4
      }
    }
  ],
  "token_usage": {
    "source": "derived_from_agent_activity",
    "provider": "openai",
    "model": "GPT-5.4",
    "total_tokens": 18420,
    "notes": "由已记录的 agent activity 汇总。"
  },
  "context_usage": {
    "source": "estimated_from_files",
    "context_level": "focus",
    "source_bytes": 24000,
    "estimated_tokens": 6200,
    "input_files": 4
  },
  "timing": {
    "started_at": "2026-06-23T10:00:00.000Z",
    "completed_at": "2026-06-23T10:24:00.000Z",
    "duration_ms": 1440000,
    "estimated_minutes": 30,
    "source": "manual"
  },
  "open_risks": [],
  "non_blocking_notes": [],
  "next_recommended_node": "04-verify"
}
```

使用 `language`、`intake_decision`、`work_items`、`changed_files`、`skills_used`、`context_usage` 和 `timing`，让看板成为任务追踪表，而不是通用状态板。节点级 `skills_used` 记录影响整个节点的 skill，`agent_activity[].skills_used` 记录具体 worker 使用的 skill。实际使用了子智能体、worker、reviewer 或外部协作者时，用 `agent_activity` 记录。每个 agent 条目应有稳定的小写 `agent_id`、角色、范围、任务、状态、`mode`、可选 `model_tier`、可选实际 `model` 和 `model_provider`，以及证据。

token、上下文和模型记录必须有来源。只要出现 `token_usage` 或 `context_usage` 对象，`source` 就是必填字段。能拿到 provider/tool 报告的精确用量时记录精确值；否则使用 `manual`、`estimated`，或者不记录。不要在环境没有暴露 Codex Desktop 或聊天 token 时编造数字。`model_tier` 是不绑定供应商的策略字段（`fast`、`standard`、`frontier`）；实际 provider/model 只通过 `model`、`model_provider`、`token_usage.model`、`agent_activity[].model`、`agent_activity[].model_provider` 或 `agent_activity[].token_usage.model` 记录为执行事实。若子智能体运行时隐藏实际模型，记录 `agent_activity[].model_unavailable_reason`。

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
- 只记录实际使用过的 skill；可取得时写清用途和证据。
- 只有运行环境暴露实际模型时才记录模型名；子智能体拿不到模型时写 `model_unavailable_reason`，节点级模型记录可保持缺失。
- token 用量必须带来源；无法取得真实用量时标记未记录，不要估成 0。

节点状态见 [task-graph.zh-CN.md](task-graph.zh-CN.md)，命令见 [controller.zh-CN.md](controller.zh-CN.md)。
