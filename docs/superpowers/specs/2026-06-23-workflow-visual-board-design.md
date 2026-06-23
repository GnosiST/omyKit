# omyKit Workflow Visual Board Design

日期：2026-06-23

## 背景

omyKit 已经具备 C-lite workflow controller：任务图、节点状态、handoff、evidence、blockers、ledger 和本地 CLI。它能表达并行 ready 节点、失败打回、阻塞和 compact 后续跑，但当前可视化仍停留在 `status` 文本输出和文件目录。

用户明确提出看板应是“多人协作地图”，不仅要看整体任务进度，还要理解任务流程、并行关系、协作者、交接证据、风险、决策和失败回流。普通 Kanban 只能展示状态，不足以支撑多 agent 或多人协作。

## 目标

1. 在 controller 中增加静态可视化看板，不引入后台服务、数据库或实时平台。
2. 让用户一眼看到 workflow 进度、当前可执行节点、阻塞/失败节点和下一步建议。
3. 同时展示任务流程信息：DAG 依赖、并行分支、汇聚、打回和关键路径。
4. 为后续多 agent 协作预留协作字段：`worker_profile`、`claimed_by`、`parallel_group`、`join_policy`、`lease_expires_at` 和 `handoff_target`。
5. 生成机器可读 `board.json` 和人类可读 `board.html`，让其他工具或未来 UI 能复用同一份 board projection。
6. 保持 omyKit 轻量：看板只读取 `.omykit/workflows/<id>/` 本地文件，不访问网络，不自动调度 worker。

## 非目标

- 不做 WebSocket、实时刷新、后台服务或数据库。
- 不做登录、权限、评论系统或多人在线编辑。
- 不做拖拽修改任务图。
- 不自动启动 subagent，不自动 claim 节点。
- 不替代 `status`、`next`、`validate`、handoff 或 delivery gate。
- 不把看板变成项目管理 SaaS。

## 推荐实现

在现有 CLI 中增加：

```bash
node scripts/omykit-workflow.mjs board
node scripts/omykit-workflow.mjs board --workflow <workflow-id>
node scripts/omykit-workflow.mjs board --open
```

命令生成：

```text
.omykit/workflows/<workflow-id>/board.json
.omykit/workflows/<workflow-id>/board.html
```

`board.json` 是稳定 projection，用于测试、未来工具集成和可视化数据源。`board.html` 是静态 dashboard，可直接用浏览器打开。

## 信息架构

看板采用六区结构。

### 1. Command Center

顶部总览，回答“现在整体怎样”：

- workflow id、title、mode、updated_at
- completion percentage
- total / ready / running / blocked / failed / passed / skipped counts
- next recommended action
- critical path summary
- latest ledger event

### 2. Flow Map

流程地图，回答“任务怎么流动”：

- DAG 依赖边
- parallel groups
- join nodes
- reject edges
- blocked nodes
- current active path
- critical path

第一版可以用纯 HTML/CSS/SVG 或 Mermaid 文本渲染，不要求交互式图编辑。

### 3. Work Board

状态列，回答“哪些任务在哪”：

```text
Pending | Ready | Running | Blocked | Failed | Passed | Skipped
```

每张卡显示：

- node id
- title
- type
- status
- owner
- worker_profile
- claimed_by
- retry count
- last handoff
- evidence status

### 4. Collaboration Lanes

协作层，回答“谁能并行、谁在负责、谁等谁”：

- worker_profile：planner、researcher、coder、tester、reviewer、delivery、custom
- claimed_by
- parallel_group
- join_policy：`all_required`、`any_passed`、`manual_review`
- lease_expires_at
- handoff_target
- unclaimed ready nodes
- overloaded worker profiles

### 5. Node Detail

节点合同，回答“这个节点具体要交付什么”：

- objective
- depends_on
- inputs / inputs_used
- allowed scope
- acceptance
- required checks
- outputs
- last handoff path
- evidence paths
- open risks
- non-blocking notes

第一版可展示所有节点的详情卡，或在 HTML 中以 `<details>` 折叠。

### 6. Risk And Decision Panel

风险和决策，回答“为什么不能继续或需要人工”：

- blockers.md 摘要
- failed handoffs and reject_to
- skipped required gates
- retry loops
- decisions.md 摘要
- non-blocking risks

## 数据模型增强

当前 graph node 已有 `owner`、`context_level`、`retry_limit` 等字段。看板和未来多 agent 协作需要扩展可选字段：

```json
{
  "owner": "codex",
  "worker_profile": "coder",
  "claimed_by": null,
  "parallel_group": "implementation",
  "join_policy": "all_required",
  "lease_expires_at": null,
  "handoff_target": "05-verify"
}
```

字段含义：

| Field | Purpose |
| --- | --- |
| `worker_profile` | 节点适合哪类 worker：planner、researcher、coder、tester、reviewer、delivery 或 custom。 |
| `claimed_by` | 当前负责者。第一版只展示，不自动分配。 |
| `parallel_group` | 标记可并行的一组节点。 |
| `join_policy` | 汇聚策略：全部必需、任一通过、或人工复核。 |
| `lease_expires_at` | 未来用于 worker 超时和接管。第一版只展示。 |
| `handoff_target` | 默认交接目标，辅助看板显示流向。 |

这些字段应是可选字段，保持旧 workflow 文件兼容。

## board.json 结构

`board.json` 不直接复制所有原始文件，而是生成面向展示的 projection：

```json
{
  "schema_version": "1",
  "workflow_id": "2026-06-23-feature-x",
  "title": "Feature X",
  "mode": "Standard",
  "generated_at": "2026-06-23T00:00:00.000Z",
  "summary": {
    "total": 6,
    "completion_percent": 33,
    "ready": 1,
    "running": 0,
    "blocked": 0,
    "failed": 1,
    "passed": 2,
    "skipped": 0,
    "next_recommended_action": "Resolve 04-verify or reject to 03-implement"
  },
  "columns": {
    "pending": [],
    "ready": [],
    "running": [],
    "blocked": [],
    "failed": [],
    "passed": [],
    "skipped": []
  },
  "flow": {
    "nodes": [],
    "dependency_edges": [],
    "reject_edges": [],
    "parallel_groups": [],
    "critical_path": []
  },
  "collaboration": {
    "worker_profiles": [],
    "unclaimed_ready": [],
    "claimed_running": [],
    "leases": []
  },
  "risks": {
    "blockers": [],
    "failed_handoffs": [],
    "skipped_required": [],
    "retry_alerts": [],
    "decisions": []
  },
  "recent_events": []
}
```

## board.html 设计

HTML 采用单文件静态输出，内联 CSS 和内联 JSON，不依赖外部 CDN。

视觉风格：

- 工作台式 dashboard，不做营销页。
- 信息密度适中，优先扫描效率。
- 使用中性色和有限状态色：ready、running、blocked、failed、passed。
- 卡片圆角保持克制，避免装饰性渐变和无意义图形。
- 支持窄屏：Command Center 在顶部，Flow 和 Board 垂直堆叠。

页面结构：

```text
Header / Command Center
Flow Map
Work Board
Collaboration Lanes
Node Details
Risk And Decision Panel
Recent Events
```

## CLI 行为

`board` 命令应该：

1. 解析 active workflow。
2. 调用现有 validate 逻辑，发现严重错误时失败并提示先修复。
3. 读取 graph、state、node cards、handoffs、ledger、blockers、decisions。
4. 生成 `board.json`。
5. 生成 `board.html`。
6. 输出生成路径和下一步建议。
7. `--open` 在本机用系统默认浏览器打开 HTML；失败时只打印路径，不阻塞。

## 错误处理

- 没有 workflow：提示先运行 `init`。
- graph/state 无效：不生成 HTML，提示运行 `validate`。
- handoff 缺失：在 board 中显示 evidence missing，而不是崩溃。
- blockers/decisions 文件不存在：显示 empty。
- 新协作字段缺失：使用默认值 `unassigned` 或 `none`。
- HTML 打开失败：保留文件并打印路径。

## 测试策略

新增或扩展 controller smoke test：

- `board` 在临时 workflow 中生成 `board.json` 和 `board.html`。
- `board.json` 包含 summary、columns、flow、collaboration、risks、recent_events。
- passed / failed / blocked 节点出现在正确列。
- failed handoff 生成 reject edge。
- optional collaboration fields 能进入 board projection。
- 缺失 optional collaboration fields 不影响旧 workflow。
- `node --check`、docs validation、skill validation 和 `git diff --check` 通过。

## 文档更新

需要更新：

- `docs/workflow/controller.md`
- `docs/workflow/controller.zh-CN.md`
- `docs/workflow/task-graph.md`
- `docs/workflow/task-graph.zh-CN.md`
- `README.md`
- `README.zh-CN.md`
- `CHANGELOG.md`

如果实现新增 schema 字段，也要更新：

- `schemas/workflow-graph.schema.json`
- `schemas/workflow-node.schema.json`

## 分阶段落地

### Phase 1: Static Board

- `board` 命令。
- `board.json`。
- `board.html`。
- optional collaboration fields in schema.
- tests and docs.

### Phase 2: Better Collaboration

只在 Phase 1 稳定后考虑：

- `claim` / `release` 命令。
- lease expiry enforcement。
- explicit parallel group templates。
- richer graph layout.
- optional browser auto-refresh.

### Phase 3: Multi-Agent Scheduler

不进入当前 scope：

- 自动启动 subagents。
- worker pool。
- remote status sync。
- live dispatch and join orchestration.

## 关键取舍

推荐先做静态 board，而不是实时协作平台：

- 静态 board 能立即解决“整体进度不可视”和“流程关系不清楚”。
- `board.json` 为未来 UI 和自动调度提供稳定中间层。
- 不引入服务端、权限和实时通信，保持 omyKit 的轻量与低消耗。
- 协作字段先进入模型，避免未来多 agent 并行时返工。

## 设计确认

该设计以用户确认的方向为准：看板不是普通 Kanban，而是多人协作地图；第一版实现静态 HTML 和 JSON projection；同时展示状态、流程、协作、节点合同、风险决策和事件历史；不做后台服务或自动调度。
