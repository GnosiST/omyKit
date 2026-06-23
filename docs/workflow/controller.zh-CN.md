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

## Codex-first 使用

优先通过 Codex 对话操作 controller：

```text
$omykit 创建工作流：重构登录模块
$omykit 查看工作流状态
$omykit 继续工作流
$omykit 下一步
$omykit 生成看板并打开
$omykit 校验工作流
```

Codex 应该优先选择项目本地 controller 脚本；没有本地脚本时，使用全局安装脚本。然后运行命令，并把状态、下一步、生成的看板路径、任务追踪摘要、token/上下文覆盖率、耗时或 ETA 信号、failed/blocked 节点、生成的整改建议和剩余风险报告给用户。

只有在自动化、CI、排障，或 Codex 无法操作本地 shell 时，才需要直接手动运行 shell 命令。

## 运行位置

全局安装后，omyKit 会把 controller 放到：

```text
${CODEX_HOME:-$HOME/.codex}/omykit/scripts/omykit-workflow.mjs
${CODEX_HOME:-$HOME/.codex}/omykit/schemas/*.schema.json
${CODEX_HOME:-$HOME/.codex}/omykit/workflow-templates/
```

在 omyKit 源码仓库内使用：

```bash
node scripts/omykit-workflow.mjs status
```

在目标项目中，优先使用项目本地的 `scripts/omykit-workflow.mjs`。没有项目本地脚本时，使用全局安装路径。

## 命令

```bash
node scripts/omykit-workflow.mjs init "feature title"
node scripts/omykit-workflow.mjs init "bug title" --template bugfix.standard
node scripts/omykit-workflow.mjs init "UI redesign" --template frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs templates list --lang zh-CN
node scripts/omykit-workflow.mjs templates show frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs templates validate
node scripts/omykit-workflow.mjs status
node scripts/omykit-workflow.mjs next
node scripts/omykit-workflow.mjs validate
node scripts/omykit-workflow.mjs scorecard
node scripts/omykit-workflow.mjs start 03-implement
node scripts/omykit-workflow.mjs complete 03-implement --handoff handoffs/03-implement-to-04-verify.json
node scripts/omykit-workflow.mjs reject 04-verify --to 03-implement --handoff handoffs/04-verify-to-03-implement.reject.json
node scripts/omykit-workflow.mjs block 02-design --reason "Waiting for user confirmation"
node scripts/omykit-workflow.mjs board
node scripts/omykit-workflow.mjs board --open --lang zh-CN
node scripts/omykit-workflow.mjs resume
```

命令作用于当前项目的 `.omykit/workflows/<workflow-id>/`。如果存在多个 workflow，传入 `--workflow <workflow-id>`。

## Workflow 模板

`init` 会把可复用 YAML workflow 模板编译成项目本地运行文件，放在 `.omykit/workflows/<workflow-id>/` 下。YAML 是面向人维护的来源；`graph.json`、节点卡、`state.json`、handoff 和看板投影仍然是运行时合同。

内置模板：

| 模板 | 使用场景 |
| --- | --- |
| `change.standard` | 默认的有边界功能、重构、文档或维护工作。 |
| `bugfix.standard` | 缺陷修复的复现、诊断、修复、验证、评审和交付。 |
| `frontend-ui.strict` | 设计敏感前端工作，包含 UI 方向、实现、浏览器/视觉验收、评审和交付。 |

模板是分层的：

| 层 | 作用 |
| --- | --- |
| 图拓扑 | 节点 id、节点类型、依赖、重试上限、汇聚、handoff 目标。 |
| Agent 配置 | 节点卡和 handoff 使用的角色名与范围边界。 |
| 模型配置 | 推荐的模型档位策略；具体供应商和模型仍由 Codex 执行时选择。 |
| 运行配置 | 预期本地验证上下文，例如项目默认、浏览器验收或纯文档工作。 |
| 安全限位 | 重试、并行、权限和停止条件指导。 |
| Scorecard | 审计 handoff、验证、用量记录、语言和模型档位策略的证据检查。 |

想新增节点，优先编辑对应模板 YAML。想调整谁负责某一步，编辑 agent 层或节点的 `agent` 字段。想调整模型策略，编辑模型配置或节点档位。这样图拓扑、agent、模型、运行环境、安全限位和评分可以分别审查、分别演进。

## 可视化看板

`board` 命令会为当前 workflow 生成本地协作地图：

```bash
node scripts/omykit-workflow.mjs board --workflow <workflow-id>
node scripts/omykit-workflow.mjs board --workflow <workflow-id> --lang zh-CN --open
```

它写入：

```text
.omykit/workflows/<workflow-id>/board.json
.omykit/workflows/<workflow-id>/board.html
```

`board.json` 是稳定的投影数据，可供测试或未来工具复用。`board.html` 是可直接用浏览器打开的单文件 dashboard。它展示可点击总控指标、任务追踪表、每个节点实际完成的工作项、变更文件摘要、验证结果、证据是否存在、子智能体活动、模型档位策略、token/上下文覆盖率、耗时与 ETA 估算、项目快照、Git 分支/提交/状态、依赖边、打回边、并行组、worker profile 分道、blocker、decision、重试告警、最近 ledger 事件和自动生成的整改建议。

token 和上下文总量是来源感知的。只有 handoff 或 ledger event 提供了用量来源时才聚合；缺失节点会显示为未记录，不会被当成 0 成本。

看板语言按这个顺序确定：显式 `--lang`、workflow metadata 语言、最新 handoff 语言、标题语言推断。只有需要覆盖 workflow 语言时才手动传 `--lang zh-CN`。在 Codex Desktop 中，Codex 应返回生成的 `board.html` 本地链接，并在可用时用内置浏览器打开。CLI 的 `--open` fallback 会让操作系统尝试用系统默认浏览器打开 HTML；如果自动打开失败，文件仍会保留，命令会打印 HTML 路径。

看板还会展示所选 workflow 模板和 Scorecard 审计结果。Scorecard 检查已记录证据，不单独相信自然语言完成声明。失败的 scorecard 检查会转成整改建议，并在可定位时链接到对应节点。

这个看板是静态视图，不自动启动 agent，不强制 claim 节点，不替用户选择具体供应商模型，不自动运行测试，不轮询文件，不同步远程状态，也不替代 `validate`、`resume`、handoff 或 delivery gate。它可以在 Codex 或其他 worker 写入记录后，展示多个 agent、worker 分道、逻辑并行组、模型档位建议、耗时、用量和 handoff 证据。

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
      board.json
      board.html
```

`graph.json` 定义 DAG。`state.json` 记录当前节点状态，并可用 `active_nodes` 记录并行工作中的多个活动节点。`ledger.jsonl` 是追加式事件历史。`nodes/` 保存任务卡。`handoffs/` 保存结构化节点结果。`evidence/` 保存命令输出、截图、摘要或导出证据。`board.json` 和 `board.html` 是生成出来的只读视图，可随时重新生成。

## Compact 后续跑

compact 或中断后按这个顺序读取：

1. `state.json`
2. `graph.json`
3. 最新相关 `ledger.jsonl` 事件
4. active、ready、failed 或 blocked 节点卡
5. 相关 handoff 和 evidence 摘要

只有下一步需要精确修改、引用原文、安全/法律/隐私判断，或失败根因分析时，才回到完整源码或完整证据。

## 不做什么

- 不自动启动 agent。
- 不把 `parallel_group` 当成真实物理并发证明；真实 worker 活动应写入 handoff 或 ledger event。
- 不调用 LLM。
- 不自动运行测试，除非 Codex 或用户显式运行命令。
- 不替代目标项目现有约定。
- 不让 Lite 工作默认变重。

参见 [task-graph.zh-CN.md](task-graph.zh-CN.md) 和 [handoff-protocol.zh-CN.md](handoff-protocol.zh-CN.md)。
