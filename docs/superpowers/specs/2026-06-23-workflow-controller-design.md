# omyKit Workflow Controller Design

日期：2026-06-23

## 背景

omyKit 当前已经具备入口路由、上下文预算、运行时准备、版本管理检查、交付门禁、工具注册表、语言自适应和 workflow 进化能力。它适合指导 Codex 如何工作，但长任务仍主要依赖对话上下文和人工监督。

用户希望 omyKit 进一步成为一套完整工作流：任务确认后能按计划自主推进；遇到非阻塞问题先记录并继续；遇到阻塞问题明确请求人工确认；长任务能拆成小节点，节点之间用固定格式交接；测试、评审或门禁失败能打回上游节点；并行、扇出、汇聚和续跑要有可执行状态，而不是自由聊天。

## 目标

1. 保留现有 omyKit skill 能力，不把所有任务都变成重型流程。
2. 为 Standard/Strict 长任务增加轻量 Controller，用结构化任务图管理节点状态。
3. 用固定 handoff 协议传递节点输出、证据、风险、阻塞和下一步建议。
4. 让 compact 或中断后的新会话能通过少量文件恢复任务状态。
5. 支持串行、并行、扇出、汇聚、打回、跳过、阻塞和人工确认。
6. 先实现本地文件和 CLI 级别的控制器，不引入后台服务、数据库、桌面 UI 或远程调度平台。

## 非目标

- 不让 Controller 自己调用模型、修改代码或替代 Codex 执行。
- 不把 omyKit 变成通用 CI/CD、issue tracker、project management SaaS 或多 agent 平台。
- 不默认为 Lite 任务启用 Controller。
- 不把第三方 skill 内容、模板、资源列表或品牌复制进 omyKit。
- 不强制目标项目采用特定技术栈、包管理器、测试框架或目录结构。

## 推荐实现形态

采用 **Skill + 轻量 Controller + 项目内状态框架**：

| 层 | 责任 | 主要产物 |
| --- | --- | --- |
| Skill | 判断是否启用 Controller、如何拆节点、何时问用户、何时交付。 | `skills/*/SKILL.md` 和 references。 |
| Controller CLI | 创建任务图、更新状态、校验 handoff、判断 ready/blocked/failed/done。 | `scripts/omykit-workflow.mjs`。 |
| Schema | 固定任务图、节点、交接和状态文件格式。 | `schemas/*.schema.json`。 |
| 项目状态目录 | 保存当前目标项目的 workflow 状态、证据和决策。 | `.omykit/workflows/<workflow-id>/...`。 |
| 文档 | 解释运行方式、节点协议和故障处理。 | `docs/workflow/*.md` 和 `.zh-CN.md`。 |

## 启用规则

omyKit 保持轻重分层：

| 模式 | Controller 策略 |
| --- | --- |
| Lite | 默认不启用。brief -> execute -> verify。 |
| Standard | 默认不启用；当任务多节点、长上下文、需要并行调查、存在打回风险或用户要求可恢复时启用。 |
| Strict | 默认启用。使用任务图、handoff、evidence、blockers 和 delivery gate。 |

无论模式如何，以下信号应触发 Controller：

- 任务需要跨多个阶段并且每阶段有独立验收条件。
- 任务可能跨 compact、长时间运行或多会话恢复。
- 任务需要并行调查、并行实现、并行评审或多来源汇聚。
- 测试、审查、交付门禁失败后需要明确打回上游节点。
- 用户要求减少人工介入、提高可观测性、记录阻塞项或保留决策历史。

## 任务状态目录

目标项目中每个受控 workflow 使用一个独立目录：

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
        01-intake.json
        02-plan.json
        03-implement.json
        04-test.json
        05-review.json
        06-delivery.json
      handoffs/
        03-implement-to-04-test.json
        04-test-to-03-implement.reject.json
      evidence/
        test-output.txt
        screenshots/
```

含义：

- `graph.json`：DAG 任务图，声明节点、依赖、owner 类型、验收标准和重试策略。
- `state.json`：当前状态快照，记录每个节点状态、活动节点、阻塞项和最后事件。
- `ledger.jsonl`：append-only 事件流水，用于审计、恢复和定位循环。
- `decisions.md`：人工确认、关键取舍和不可逆决策。
- `blockers.md`：阻塞与非阻塞问题清单。
- `nodes/*.json`：每个节点的任务卡。
- `handoffs/*.json`：节点完成、失败、打回或跳过时的结构化交接。
- `evidence/`：命令输出、截图、导出文件摘要或其他验证证据。

## 节点模型

每个节点只做一类工作，避免一个节点背完整历史：

| 节点类型 | 责任 |
| --- | --- |
| `intake` | 固化用户目标、约束、语言、交付物和成功标准。 |
| `research` | 调查外部事实、项目结构、上游变化或可选方案。 |
| `design` | 形成方案、边界、接口、风险和验收标准。 |
| `plan` | 把设计拆成可执行任务和验证步骤。 |
| `implement` | 修改代码、文档、配置或交付物。 |
| `verify` | 运行测试、lint、build、视觉检查或文档校验。 |
| `review` | 做质量审查、风险审查、同类能力选择或交付前复核。 |
| `delivery` | 汇总证据、运行最终门禁、提交/发布/交付。 |
| `evolution` | 只在有通用证据时更新 omyKit 规则或 docs。 |

节点状态：

```text
pending -> ready -> running -> passed
                         |-> failed
                         |-> blocked
                         |-> skipped
```

状态含义：

- `pending`：依赖尚未满足。
- `ready`：依赖满足，可执行。
- `running`：当前执行中。
- `passed`：完成并通过 handoff 校验。
- `failed`：执行失败，需要打回或人工处理。
- `blocked`：缺少人工确认、凭据、访问权限或外部状态。
- `skipped`：根据规则或人工决定跳过，并记录理由。

## Handoff 协议

每个节点结束时必须输出 handoff。不能只写“完成了”。

通过示例：

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "03-implement",
  "status": "passed",
  "summary": "Implemented the scoped change and updated focused tests.",
  "inputs_used": [
    "graph.json",
    "nodes/03-implement.json"
  ],
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
  "next_recommended_node": "04-test"
}
```

打回示例：

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "04-test",
  "status": "failed",
  "reject_to": "03-implement",
  "reason": "Regression test failed for the empty-state path.",
  "evidence": [
    "evidence/04-test-output.txt"
  ],
  "required_fix": "Preserve the previous empty-state behavior and rerun the focused test."
}
```

阻塞示例：

```json
{
  "workflow_id": "2026-06-23-feature-x",
  "node_id": "02-design",
  "status": "blocked",
  "blocker_type": "user_confirmation",
  "question": "Should this workflow create a release tag automatically?",
  "blocked_scope": "delivery only",
  "can_continue_nodes": [
    "03-research-current-docs"
  ]
}
```

## Controller CLI

第一版 CLI 只做本地确定性操作：

```bash
node scripts/omykit-workflow.mjs init "feature-x"
node scripts/omykit-workflow.mjs status
node scripts/omykit-workflow.mjs next
node scripts/omykit-workflow.mjs validate
node scripts/omykit-workflow.mjs start 03-implement
node scripts/omykit-workflow.mjs complete 03-implement --handoff handoffs/03-implement-to-04-test.json
node scripts/omykit-workflow.mjs reject 04-test --to 03-implement --handoff handoffs/04-test-to-03-implement.reject.json
node scripts/omykit-workflow.mjs block 02-design --reason "Waiting for user confirmation"
node scripts/omykit-workflow.mjs resume
```

CLI 输出应保持紧凑，优先返回：

```text
Workflow:
Ready nodes:
Blocked nodes:
Failed nodes:
Next recommended action:
Required evidence:
```

## 调度规则

Controller 不是 agent 群聊，而是任务图状态机：

- 串行：节点只有在依赖 `passed` 后才 ready。
- 并行：多个互不依赖节点可同时 ready，Codex 可按上下文预算选择逐个或并发执行。
- 扇出：一个 brief 可生成多个同类 research/review 节点。
- 汇聚：synthesis、verify 或 delivery 节点必须等 required dependencies 全部 `passed`。
- 打回：failed 节点必须声明 `reject_to`、原因、证据和 required fix。
- 阻塞：blocked 节点不得阻塞无依赖关系的 ready 节点。
- 防循环：同一边 `A -> B -> A` 打回超过阈值后升级为人工决策或 design review。
- 跳过：skipped 必须有理由和影响范围，不得静默跳过 required gate。

## Compact 和续跑

当上下文过大或会话中断时，新会话只需先读：

1. `state.json`
2. `graph.json`
3. 最近 3 条 `ledger.jsonl` 事件
4. 当前 ready/failed/blocked 节点的 task card
5. 相关 handoff 和 evidence 摘要

只有当下一步需要精确修改、法律/安全判断、引用出处或失败复盘时，才回到原始文件或完整证据。

## 与现有 omyKit 的关系

现有能力保持不变：

- `omykit` 仍是入口和路由。
- `codex-project-router` 仍判断 entry、project type、mode 和工具路径。
- `codex-context-budget` 决定 scan/focus/deep，并约束 Controller 读取量。
- `codex-change-workflow` 在复杂任务中启用 Controller，并把节点执行保持在当前 route 内。
- `codex-runtime-readiness` 仍只处理本地服务和验证依赖。
- `codex-version-readiness` 仍处理历史、回滚、release notes 和定制化。
- `codex-delivery-gate` 仍在完成、提交、PR、导出或发布前运行。
- `codex-workflow-evolution` 仍只在通用证据成立时改进 omyKit。

新增 Controller 后的职责分配：

```text
omykit skill -> route and decide whether controller is needed
codex-change-workflow -> execute the active route
controller CLI -> persist state, validate handoffs, recommend next nodes
delivery gate -> verify final evidence before completion claims
```

## 错误处理

- Handoff 缺字段：Controller 拒绝完成节点，并要求补齐。
- Evidence 缺失：节点可保持 `failed` 或 `blocked`，不得标记 `passed`。
- 依赖环：`validate` 报错，要求修改 graph。
- 打回循环：超过 retry limit 后转 `blocked`，要求人工决策或设计复核。
- 非阻塞风险：记录在 handoff 和 blockers 中，允许无依赖节点继续。
- 工具不可用：记录缺失工具、影响范围和替代验证；交付时由 delivery gate 暴露残余风险。

## 验证策略

实现后需要验证：

- JSON schema 能校验 graph、node、state 和 handoff。
- CLI 能创建 workflow、列出 next、完成节点、打回节点、阻塞节点和恢复状态。
- 示例 graph 覆盖串行、并行、汇聚和打回。
- `validate-skills.sh`、`validate-docs.mjs` 和 `git diff --check` 通过。
- skill 文档仍保持简短，细节放在 references 或 docs。
- Lite 任务不会默认启用 Controller。

## 分阶段落地

### Phase 1: C-lite

交付可用的本地协议和 CLI：

- 新增 `docs/workflow/task-graph.md` 和中文版本。
- 新增 `docs/workflow/handoff-protocol.md` 和中文版本。
- 新增 `docs/workflow/controller.md` 和中文版本。
- 新增 schema 文件。
- 新增 `scripts/omykit-workflow.mjs`。
- 更新 `codex-change-workflow`、`codex-context-budget`、`codex-delivery-gate` 和 `codex-workflow-evolution` 的触发和交接规则。
- 更新 README、tool registry、skill coordination、CHANGELOG。

### Phase 2: Better automation

在 C-lite 稳定后再考虑：

- 生成 HTML 状态页。
- 提供 graph 模板库。
- 和 GitHub issues/PR comments 建立可选同步。
- 支持更丰富的 evidence adapters。

这些不进入第一版，避免把 omyKit 变成重型平台。

## 关键取舍

推荐先做 C-lite，而不是纯 skill 或完整平台：

- 纯 skill 太依赖对话上下文，无法稳定处理 compact、打回和汇聚。
- 完整平台成本过高，会降低 omyKit 的轻量性和适配性。
- C-lite 把关键状态落盘，用 CLI 做确定性校验，同时仍让 Codex 负责判断、编辑和验证。

## 设计确认

该设计以用户确认的方向为准：保留原有 omyKit 能力；复杂任务启用轻量 Controller；先做本地文件协议、schema 和 CLI validator；不做后台服务、数据库或桌面 UI。
