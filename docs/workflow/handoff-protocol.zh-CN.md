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

## 知识同步审查

通过的 delivery 节点还必须记录 `knowledge_sync`。它表示交付时是否已经同步项目知识库，不表示每个节点都要运行重型清理。

当 README、docs、AGENTS/CLAUDE 规则、workflow handoff 或 agent 记忆已经审查并更新时，用 `completed`。没有持久知识变化时，用 `not_needed`。确实无法当场处理时，用 `deferred` 并写明原因。

```json
{
  "knowledge_sync": {
    "status": "completed",
    "skill": "neat-freak",
    "performed_by": "main-codex",
    "reason": "本次变更更新了 workflow 文档和 handoff contract。",
    "files_reviewed": [
      "README.md",
      "docs/workflow/handoff-protocol.zh-CN.md",
      "AGENTS.md"
    ],
    "files_updated": [
      "README.md",
      "docs/workflow/handoff-protocol.zh-CN.md"
    ],
    "memory_updated": [],
    "evidence": [
      "evidence/06-delivery-summary.txt"
    ]
  }
}
```

如果本地安装了 `neat-freak`，在阶段收口、文档过期或 clean handoff 请求时使用它。没有该 skill 时，执行等价的 docs/AGENTS 定向审查，并在 `skill` 里记录实际方法。

## 下游交接上下文

当下游节点或子智能体需要继承当前节点的事实时，handoff 应记录 `downstream_context`。它不是长篇复述，而是给下游的低 token 事实包。

```json
{
  "downstream_context": {
    "target_nodes": [
      "04-implement",
      "05-verify"
    ],
    "summary": "方案已确定：保持现有 API，只修改 UI 空状态分支。",
    "required_inputs": [
      "nodes/03-plan.json",
      "evidence/03-plan-summary.txt"
    ],
    "evidence": [
      "evidence/03-plan-summary.txt"
    ],
    "carry_forward_risks": [
      "视觉验收仍需要浏览器截图。"
    ],
    "context_budget": {
      "level": "focus",
      "max_source_files": 6,
      "notes": "实现节点只读取计划摘要和相关 UI 文件。"
    },
    "handoff_contract": "下游实现必须保留既有 API，并在 verification 中记录截图或跳过理由。"
  }
}
```

`downstream_context` 必须包含至少一个 `target_nodes` 和一个 `summary`。`context-pack <node-id>` 会读取依赖 handoff 和这些 `downstream_context`，生成给下游或子智能体的最小上下文包。

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
  "downstream_context": {
    "target_nodes": [
      "04-verify"
    ],
    "summary": "实现保持既有 API，只改变空状态兜底分支；验证节点应重点检查旧行为和空状态文案。",
    "required_inputs": [
      "src/foo.ts",
      "tests/foo.test.ts",
      "evidence/03-implement-test-output.txt"
    ],
    "evidence": [
      "evidence/03-implement-test-output.txt"
    ],
    "carry_forward_risks": [
      "还需要浏览器或聚焦测试确认 UI 文案。"
    ],
    "context_budget": {
      "level": "focus",
      "max_source_files": 4,
      "notes": "验证节点优先读取变更文件和测试输出。"
    },
    "handoff_contract": "下游验证必须确认旧空状态行为没有回归。"
  },
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
  "skill_decisions": [
    {
      "capability": "UI 创建",
      "selected": "frontend-design",
      "rationale": "当前节点要产出具体页面，主缺口是高质量 UI 创建，而不是单纯审美评审或技术审计。",
      "selection_basis": [
        "交付物是可运行前端界面",
        "用户对视觉质量有明确要求",
        "项目已有组件体系需要落地实现"
      ],
      "alternatives": [
        {
          "name": "design-taste-frontend",
          "decision": "next_retry",
          "reason": "如果用户认为结果太普通，下一轮用它做审美和反通用修改。",
          "strength": "视觉判断"
        },
        {
          "name": "audit",
          "decision": "backup",
          "reason": "实现后用于技术 UI 审查，不作为第一创作 skill。",
          "strength": "技术审计"
        }
      ],
      "fallback_policy": {
        "when": "用户不满意视觉方向、品牌表达或精致度",
        "next_skill": "design-taste-frontend",
        "action": "保留已验证功能，重做视觉层级、布局节奏和品牌表达。"
      },
      "user_feedback": {
        "status": "not_reviewed",
        "summary": "尚未收到用户对产物的质量反馈。"
      },
      "outcome": "not_evaluated",
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

使用 `language`、`intake_decision`、`work_items`、`changed_files`、`skills_used`、`skill_decisions`、`knowledge_sync`、`context_usage` 和 `timing`，让看板成为任务追踪表，而不是通用状态板。入口 handoff 在实现开始前应包含 `execution_options`、`selected_option` 和 `confirmation`：给出 2-3 个可执行方案，标记推荐方案，记录用户纠偏或确认，并保持允许自定义答案。节点级 `skills_used` 记录影响整个节点的 skill，`skill_decisions` 记录同类能力选择依据、候选替代、fallback 和用户反馈；没有同类竞争或没有使用 specialist skill 时可以省略。`agent_activity[].skills_used` 记录具体 worker 使用的 skill。实际使用了子智能体、worker、reviewer 或外部协作者时，用 `agent_activity` 记录。每个 agent 条目应有稳定的小写 `agent_id`、角色、范围、任务、状态、`mode`、可选 `model_tier`、可选实际 `model` 和 `model_provider`，以及证据。

如果用户对产物不满意，不要盲目叠加所有同类 skill。先查看对应节点的 `skill_decisions[].fallback_policy`；若已有 `next_skill`，保留已验证事实和功能，只把不满意的质量维度交给下一个更擅长的 skill 重做或修改。重做后把 `user_feedback.status`、`outcome` 和新证据写回 handoff。反复有效或反复失败的选择经验，作为 delivery `evolution_candidates` 交给 `codex-workflow-evolution` 判断是否进入通用 omyKit 规则。

token、上下文和模型记录必须有来源。只要出现 `token_usage` 或 `context_usage` 对象，`source` 就是必填字段。能拿到 provider/tool 报告的精确用量时记录精确值；否则使用 `manual`、`estimated`，或者不记录。不要在环境没有暴露 Codex Desktop 或聊天 token 时编造数字。`model_tier` 是不绑定供应商的策略字段（`fast`、`standard`、`frontier`）；实际 provider/model 只通过 `model`、`model_provider`、`token_usage.model`、`agent_activity[].model`、`agent_activity[].model_provider` 或 `agent_activity[].token_usage.model` 记录为执行事实。Codex Desktop 创建 worker 支持模型 override，所以节点 handoff 应记录推荐模型，并在执行环境暴露时记录实际模型。若运行时策略或 metadata 隐藏实际模型或 token 计数，增加节点级 `usage_observation`，将 `model_status` 或 `token_status` 设为 `unavailable`，并写明对应不可观测原因。看板会把运行时不可观测和未记录分开展示。

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
- 下游需要继承的事实写入 `downstream_context`，不要只留在聊天摘要里。
- `downstream_context` 应优先引用摘要和证据路径，不要复制大段日志、源码或完整对话。
- 只记录实际使用过的 skill；可取得时写清用途和证据。
- 执行环境暴露实际模型时记录模型名；否则在 worker activity 写 `model_unavailable_reason`，并在节点级 `usage_observation.model_status=unavailable` 写明原因。
- token 用量必须带来源；无法取得精确用量时记录 `usage_observation.token_status=unavailable` 和原因，不要估成 0。

节点状态见 [task-graph.zh-CN.md](task-graph.zh-CN.md)，命令见 [controller.zh-CN.md](controller.zh-CN.md)。
