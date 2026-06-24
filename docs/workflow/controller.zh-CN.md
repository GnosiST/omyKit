# Workflow Controller

语言：[English](controller.md) | [简体中文](controller.zh-CN.md)

omyKit workflow controller 是一个本地 C-lite 状态机，用于长任务、可续跑任务和多节点 Codex 工作。它补充 skill 层，不替代 Codex，不自己调用模型，不自动改代码，也不是后台服务。

当任务需要持久状态、结构化交接、重试可见性，或 compact 后续跑时使用它。

## 执行界面

| 界面 | 职责 | 默认是否需要 |
| --- | --- | --- |
| 主 Codex 对话 | 编排、观察、派发、集成 handoff、验票和升级人工阻塞。 | 需要 |
| 看板/观察窗口 | 查看进度、证据、日志、交接包、模型/skill/用量和整改建议。 | 长任务建议打开 |
| 子智能体 | 只处理一个有边界节点或子任务，产出结构化 handoff。 | 只有可并行或需要隔离上下文时使用 |
| 第二个 Codex 主窗口 | 作为纯观察者或人工介入面。 | 不强制；只有团队协作或用户想分离观察/执行时使用 |

默认可以只在一个 Codex 对话里完成：主对话读取 controller 状态，必要时打开看板作为观察面，并通过子智能体工具派发 worker。不要为了每个任务强制新建两个窗口；真正重要的是每个 worker 只拿到当前节点的 `context-pack`，并把结果写回 handoff。

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
$omykit 开始执行：重构登录模块
$omykit 只创建工作流：重构登录模块
$omykit 查看工作流状态
$omykit 继续工作流
$omykit 下一步
$omykit 查看工作流列表
$omykit 切换工作流：<workflow-id>
$omykit 解除阻塞
$omykit 生成看板并打开
$omykit 校验工作流
$omykit 升级旧工作流
$omykit 诊断工作流健康
$omykit 清理旧工作流残留
```

Codex 应该优先选择项目本地 controller 脚本；没有本地脚本时，使用全局安装脚本。然后运行命令，并把状态、下一步、生成的看板路径、任务追踪摘要、skill 使用记录、推荐模型和实际模型记录、token/上下文覆盖率、耗时或 ETA 信号、failed/blocked 节点、生成的整改建议和剩余风险报告给用户。

只有在自动化、CI、排障，或 Codex 无法操作本地 shell 时，才需要直接手动运行 shell 命令。

## 任务收件箱与合并门禁

用户多次说 `$omykit 修 bug：...`、`$omykit 做 UI：...` 或补充同类问题时，不应该让用户手动选择“并行、合并、冲突处理”。Codex 先把任务 brief 追加到项目级 `.omykit/tasks/tasks.jsonl`，再由 controller 判定：

- `merge_current`：当前 workflow 仍在推进，且任务属于同一目标或同类问题，合并到当前工作流视野。
- `linked_follow_up`：关联 workflow 已终态，新 brief 是同源后续问题，应链接历史 workflow 并按需要创建后续工作。
- `new_workflow`：没有合适 active workflow，或任务目标/模板明显不同，应新建独立 workflow。

Task Inbox 会记录语言、模板建议、关系、标签、建议写入范围、冲突风险和关联 workflow。看板会投影任务收件箱、工作流组和冲突仲裁项；`doctor` 会检查任务收件箱是否存在坏 JSONL；`orchestrate` 会把任务入口摘要带入编排计划。

底层命令是 controller 原语，不是日常用户命令：

```bash
node scripts/omykit-workflow.mjs tasks add "修 bug：二级页面也有同类 UI 问题" --lang zh-CN
node scripts/omykit-workflow.mjs tasks list --json
```

用户通常只说自然语言意图。只有排障“为什么这个任务被合并/拆分/链接”时，才需要查看 `tasks list`。

## 项目健康检查

当旧项目或历史 workflow 出现“改造不彻底、状态混乱、旧产物残留、看板过期、下一步不清楚”时，用 `doctor`。它会写入 `.omykit/health/health-report.json`，并检查项目级工作流层：

- `.omykit/` 命名空间是否存在，以及是否和用户自己的同名文件冲突。
- `.git/info/exclude` 是否已经本地忽略 `.omykit/`。
- `.omykit/` 和 workflow 目录是否存在。
- active workflow 指针是否有效。
- 任务收件箱是否可解析，以及当前是否存在同源任务或写入范围冲突。
- workflow 校验错误和兼容升级缺口。
- 已终态节点是否缺少可读 handoff 证据。
- board projection 是否缺失或过期。
- 后台命令是否有可续接记录。
- 根目录是否存在看起来像旧 workflow 产物的通用文件名，例如 `graph.json`、`state.json`、`board.html`、`nodes/` 或 `handoffs/`。
- repo-local skill 副本是否可能陈旧。
- `docs/workflow/project-profile.md` 旧项目 profile 是否存在。
- 清理候选和下一步建议。

`doctor --fix` 只做安全兼容修复：把 `.omykit/` 写入本地 `.git/info/exclude`、当只有一个有效 workflow 时修正坏 active 指针，并运行和 `upgrade` 一致的不伪造证据的 artifact 修复。它默认不会修改项目 `.gitignore`，也不会编造 handoff、token 用量、skill 使用、模型记录或验证证据。

查看 doctor 报告后再使用 `cleanup`。它默认 dry-run；`cleanup --apply` 也只是把安全候选归档到 `.omykit/archive/<timestamp>/`，不会直接删除，方便回滚或追溯。

如果历史 workflow 的所有节点都已经是终态、没有 active command run，但旧 handoff 不符合当前证据 schema，`cleanup` 会把整个 workflow 目录作为候选。处理方式是归档，不补造 `intake_decision`、`knowledge_sync`、`evolution_candidates`、agent scope、token、skill、model 或验证记录。

只有当项目本地不再需要 omyKit 时，才使用 `cleanup --uninstall-local --apply`。它会把整个 `.omykit/` runtime 目录移动到本地非项目归档位置；Git 项目通常放在 `.git/omykit-uninstalled/`。这样可以移除工作区里的运行状态，不触碰项目源码，也不影响以后重新初始化 omyKit 时的工作质量。

## 长任务执行方式

创建 workflow 不等于任务完成。`init` 只是在项目里创建可持久化状态。对于长任务，除非用户明确说 `只创建`、`只初始化`、`先建骨架` 或 `不要执行`，Codex 应该在创建后继续推进。

执行循环：

1. `resume` 和 `orchestrate` 找到 running、failed、blocked、ready、可并行和外部认领节点。
2. 检查任务收件箱，把同源 brief 作为当前 workflow 输入，把冲突写入冲突仲裁视野，避免重复开无关 workflow。
3. 编排计划决定下一步用主线程、同 turn 子智能体、后台线程还是 worktree；用户不应该手动选择这个底层执行面。
4. 如果节点要派给 worker 或 compact 后续跑，Codex 内部先生成 `context-pack <node-id>`。
5. Codex 在当前项目里执行该节点的真实工作，或把有边界的 context pack 交给 worker。
6. 真实 worker/thread/worktree 存在后，Codex 用 `assign` 记录分工。
7. 对 dev server、测试 watcher、长构建或截图服务等后台命令，用 `record-run` 记录命令、日志、pid 和续接命令。
8. Codex 写结构化 handoff，记录工作项、证据、`downstream_context`、可用的 skill/model/用量记录，以及 delivery 节点的 `evolution_candidates` 和 `knowledge_sync`。
9. Codex 运行 `complete`、`reject`、`block`，或在已记录的阻塞解决后运行 `unblock`。
10. 重复循环，直到 delivery 通过、真实阻塞需要用户处理，或用户明确要求停止。

想让 Codex 创建/续跑并继续推进，用 `$omykit 开始执行：<任务>` 或 `$omykit 创建并执行工作流：<任务>`。只有想先拿到骨架和手动续跑命令时，才用 `$omykit 只创建工作流：<任务>`。

## 自动编排

对于追踪型长任务，主 Codex 对话应作为 orchestrator-observer：保留持久 workflow state，运行 `orchestrate`，只在任务范围独立时启动有边界的 worker，集成 handoff，运行 scorecard，只把真实人工阻塞升级给用户。不要为了某个 worker 子任务切换主对话模型；这样会增加主控上下文丢失或断裂的风险。

用户侧的下一步请求应使用：

```bash
node scripts/omykit-workflow.mjs orchestrate --workflow <workflow-id>
node scripts/omykit-workflow.mjs orchestrate --workflow <workflow-id> --json
```

编排计划会列出执行模式、Codex 是否应自动继续、是否需要人工介入、当前协作拓扑、下一批动作、建议 worker profile、推荐模型档位、推荐具体模型、已知 Codex model override 名称、执行面、上下文包和 handoff 合同。它会在 workflow 目录下写入 `orchestration-plan.json`，方便中断后续接。

`collaboration_topology` 会明确多 agent 协作形态：

- `one_to_one`：只有 1 个独立、可派发、无需接管确认的 worker 节点就绪。
- `one_to_many`：2 个或以上独立 worker 节点同时就绪，并且没有超过并行安全上限。
- `many_to_one`：下游节点依赖多个上游节点，或多个上游节点共享同一个 `handoff_target`；下游按 `join_policy` 等待所需 handoff。

低层原子命令仍保留给 Codex 内部、CI 和排障：

```bash
node scripts/omykit-workflow.mjs dispatch-plan --workflow <workflow-id> --surface auto --json
node scripts/omykit-workflow.mjs context-pack <node-id> --workflow <workflow-id>
node scripts/omykit-workflow.mjs assign <node-id> --agent <agent-id> --surface background_thread --status running --context-pack context-packs/<node-id>.json --handoff handoffs/<node-id>.json
```

controller 仍然不会自己启动 agent 或调用模型。但 `action=dispatch_worker` 对 Codex 主控是执行契约，不是给用户看的建议：如果当前运行时暴露匹配的子智能体、线程或 worktree 工具，Codex 应使用节点 context pack 创建真实 worker，并且只有 worker 存在后才运行 `assign`。在 `one_to_many` 中，带同一 `dispatch_batch_id` 的 action 属于同一扇出批次；在 `many_to_one` 中，下游节点应等到 `collaboration_topology.join_targets[].waiting_on` 清空，或 `join_policy` 允许后再启动。如果运行时无法创建指定 worker，要记录 unavailable 原因；只有范围安全时才降级为主线程执行，否则 block 节点并明确缺少的能力。

Codex Desktop 的新线程和子智能体工具可能暴露模型 override，但当前工具策略决定本次调用是否能设置模型。节点有任务级推荐模型时，Codex 只有在当前运行时工具和策略允许，或用户明确授权具体模型时，才应在创建 worker 时传入该模型，同时让主线程保持当前模型作为 orchestrator-observer。若非 Codex 客户端、权限边界或工具策略不允许 override，worker 继承默认模型，并在 handoff 里记录推荐模型与实际模型的差距。若运行时隐藏实际模型元数据，写 `agent_activity[].model_unavailable_reason` 和节点级 `usage_observation.model_status=unavailable`，不要编造模型名。

`assign` 会把实际分工追加到 `assignments.jsonl`：节点、agent id、角色、执行面、thread id、worktree、模型档位、写入范围、context pack、handoff 路径和状态。它是运行时通讯录，不写入模板。看板会投影 Agent 通讯录，Scorecard 会提醒 assignment 缺少可读取 handoff 或多个活跃 agent 写入范围重叠。

## Thread-native 多 Agent 协作

Codex app 还可以在独立 thread 或 worktree 中运行后台任务。omyKit controller 现在能在编排计划中要求 worker 派发、记录 thread/worktree assignment、生成对应 context pack、在看板显示 Agent 通讯录，并用 scorecard 审计 handoff 回流和写入范围冲突；但它仍不会自动创建 Codex thread、自动创建 worktree 或跨线程发送消息。线程创建和交接仍由 Codex 主控按当前运行时工具能力执行。

| 执行面 | 适合 | 约束 |
| --- | --- | --- |
| `subagent` | 同一 turn 内的并行探索、审查、测试分析和短任务。 | 消耗更多 token；不适合长时间后台写代码。 |
| `background_thread` | 长任务、独立研究、后续可单独查看或继续的工作。 | 需要记录 thread id、handoff 和摘要回流。 |
| `thread_worktree` | 写操作较重、需要隔离分支或避免污染本地 checkout 的任务。 | 默认禁止多个 worker 改同一文件集；需要 worktree handoff 策略。 |

可行性和设计细节见 [multi-agent-coordination.zh-CN.md](multi-agent-coordination.zh-CN.md)。使用独立 thread 时要保持三个约束：每个 thread 有明确职责和写入范围、只接收当前节点 `context-pack`、完成后把结构化 handoff 写回当前 workflow。

## 交接包与低上下文续接

`context-pack` 会为单个节点生成最小可执行上下文：

```bash
node scripts/omykit-workflow.mjs context-pack 03-plan --workflow <workflow-id> --lang zh-CN
```

它写入：

```text
.omykit/workflows/<workflow-id>/context-packs/<node-id>.json
```

交接包只包含 `workflow_id`、目标节点合同、依赖 handoff 摘要、来自上游 `downstream_context` 的携带信息、最近相关事件、活跃后台命令、恢复指针、确定性的 `context_usage` 测量和 `context_loss_guard`。它不会复制整段对话或整个项目源码。子智能体或恢复后的 Codex 应优先读取交接包；只有当前节点需要精确修改、引用原文、排查失败根因或安全判断时，才加载完整文件。要把对话压缩视为有损过程：续接时以 context-pack 加来源/证据路径为准，而不是依赖聊天记忆。

## 后台命令记录

controller 不托管进程，也不假装能恢复任意 shell 会话。对会影响续接判断的长命令，Codex 应记录运行事实：

```bash
node scripts/omykit-workflow.mjs record-run 05-verify \
  --id dev-server \
  --command "npm run dev" \
  --status running \
  --pid 4242 \
  --log .omykit/workflows/<workflow-id>/commands/dev-server.log \
  --resume "npm run dev"
```

记录会追加到 `commands/commands.jsonl`，并投影到 `resume` 和看板。后台命令通常是 dev server、测试 watcher、长构建、浏览器录制、截图服务、数据导入或本地容器检查。中断后先看 `resume` 输出的命令记录、日志路径和续接命令，再决定是继续等待、重启命令还是把节点 block。

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
node scripts/omykit-workflow.mjs tasks add "修 bug：根据截图修首页 UI 问题" --lang zh-CN
node scripts/omykit-workflow.mjs tasks list --json
node scripts/omykit-workflow.mjs workflows
node scripts/omykit-workflow.mjs workflows use <workflow-id>
node scripts/omykit-workflow.mjs templates list --lang zh-CN
node scripts/omykit-workflow.mjs templates show frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs templates validate
node scripts/omykit-workflow.mjs status
node scripts/omykit-workflow.mjs next
node scripts/omykit-workflow.mjs orchestrate
node scripts/omykit-workflow.mjs orchestrate --json
node scripts/omykit-workflow.mjs upgrade --all
node scripts/omykit-workflow.mjs validate
node scripts/omykit-workflow.mjs scorecard
node scripts/omykit-workflow.mjs record-run 05-verify --id test-watch --command "npm test -- --watch" --status running --log .omykit/workflows/<workflow-id>/commands/test-watch.log --resume "npm test -- --watch"
node scripts/omykit-workflow.mjs start 03-implement
node scripts/omykit-workflow.mjs complete 03-implement --handoff handoffs/03-implement-to-04-verify.json
node scripts/omykit-workflow.mjs reject 04-verify --to 03-implement --handoff handoffs/04-verify-to-03-implement.reject.json
node scripts/omykit-workflow.mjs block 02-design --reason "Waiting for user confirmation"
node scripts/omykit-workflow.mjs board
node scripts/omykit-workflow.mjs board --open --lang zh-CN
node scripts/omykit-workflow.mjs resume
```

命令作用于当前项目的 `.omykit/workflows/<workflow-id>/`。`init` 会写入 `.omykit/active-workflow`。如果存在多个 workflow，使用 `workflows` 查看，使用 `workflows use <workflow-id>` 选择 active，或显式传入 `--workflow <workflow-id>`；没有 active 且存在多个 workflow 时，controller 会拒绝猜测，避免续错任务。

## Workflow 模板

`init` 会把可复用 YAML workflow 模板编译成项目本地运行文件，放在 `.omykit/workflows/<workflow-id>/` 下。YAML 是面向人维护的来源；`graph.json`、节点卡、`state.json`、handoff 和看板投影仍然是运行时合同。

内置模板：

| 模板 | 使用场景 |
| --- | --- |
| `change.standard` | 默认的有边界功能、重构、文档或维护工作。 |
| `bugfix.standard` | 缺陷修复的复现、诊断、修复、验证、评审和交付。 |
| `frontend-ui.strict` | 设计敏感前端工作，包含 UI 方向、实现、浏览器/视觉验收、评审和交付。 |
| `mission.orchestration` | 需要需求洞察、任务拆解、工作流路由、执行监听、集成验票和 workflow 学习的复杂需求。 |

模板是分层的：

| 层 | 作用 |
| --- | --- |
| 图拓扑 | 节点 id、节点类型、依赖、重试上限、汇聚、handoff 目标。 |
| Agent 配置 | 节点卡和 handoff 使用的角色名与范围边界。 |
| 模型配置 | 推荐的模型档位策略和具体模型映射；实际供应商和模型只作为执行元数据记录。 |
| 运行配置 | 预期本地验证上下文，例如项目默认、浏览器验收或纯文档工作。 |
| 安全限位 | 重试、并行、权限和停止条件指导。 |
| Scorecard | 审计 handoff、验证、用量记录、语言、模型档位策略和交付进化复盘的证据检查。 |

想新增节点，优先编辑对应模板 YAML。想调整谁负责某一步，编辑 agent 层或节点的 `agent` 字段。想调整模型策略，编辑模型配置、节点档位或节点级推荐。这样图拓扑、agent、模型、运行环境、安全限位和评分可以分别审查、分别演进。

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

`board.json` 是稳定的投影数据，可供测试或未来工具复用。`board.html` 是可直接用浏览器打开的单文件 dashboard。它展示可点击总控指标、入口决策、执行方案和确认状态、任务追踪表、每个节点实际完成的工作项、下游交接上下文、交接包、Agent 通讯录、后台命令记录、变更文件摘要、skill 使用记录、同类 skill 选择决策、fallback 策略、验证结果、证据是否存在、workflow 进化候选、子智能体活动、模型档位策略、推荐具体模型、实际模型记录、token/上下文覆盖率、任务合同大小、上下文来源分布、耗时与 ETA 估算、项目快照、Git 分支/提交/状态、依赖边、打回边、并行组、worker profile 分道、blocker、decision、重试告警、最近 ledger 事件和自动生成的整改建议。

token、上下文、skill 和实际模型总量是来源感知的。Provider token 只有 handoff 或 ledger event 提供来源时才聚合；缺失 token 节点会显示为未记录，不会被当成 0 成本。上下文用量在缺少精确 worker 记录时，会由 controller 做确定性投影：已生成的 context-pack 文件大小、节点上下文估算、任务合同、依赖 handoff 摘要、下游 context、最近事件和 workflow 文件大小提示。运行环境不可观测的用量会通过 `usage_observation` 和缺失记录分开展示。推荐模型来自所选 `model_profile` 和节点策略；当 Codex runtime 策略允许时，worker 创建应把这些推荐模型作为 model override 传入。实际模型来自 `handoff.model`、`handoff.token_usage.model`、`agent_activity[].model` 或 `agent_activity[].token_usage.model`。

看板语言按这个顺序确定：显式 `--lang`、workflow metadata 语言、最新 handoff 语言、标题语言推断。只有需要覆盖 workflow 语言时才手动传 `--lang zh-CN`。在 Codex Desktop 中，Codex 应返回生成的 `board.html` 本地链接，并在可用时用内置浏览器打开。CLI 的 `--open` fallback 会让操作系统尝试用系统默认浏览器打开 HTML；如果自动打开失败，文件仍会保留，命令会打印 HTML 路径。

看板还会展示所选 workflow 模板和 Scorecard 审计结果。Scorecard 检查已记录证据，不单独相信自然语言完成声明。通过的 intake 节点必须记录 `intake_decision`，包含路由、执行形态、关键假设、执行方案、已选方案、确认状态和自定义答案策略。通过的 delivery 节点必须记录 `evolution_candidates`；空数组表示已复盘但没有可复用经验。它们还必须记录 `knowledge_sync`，状态为 `completed`、`not_needed` 或带原因的 `deferred`，避免交付时忘记 docs/AGENTS/记忆收尾。通用候选会转成给 `codex-workflow-evolution` 的整改建议。失败的 scorecard 检查会转成整改建议，并在可定位时链接到对应节点。skill 使用、skill 选择决策和实际模型检查是推荐级 warning：它暴露缺失记录，但不会强迫没有使用 skill、没有同类能力选择或运行环境没有暴露模型的节点伪造记录。

这个看板是静态视图，不自动启动 agent，不强制 claim 节点，不替用户选择具体供应商模型，不自动推断 skill 使用，不自动运行测试，不轮询文件，不同步远程状态，也不替代 `validate`、`resume`、handoff 或 delivery gate。它可以在 Codex 或其他 worker 写入记录后，展示多个 agent、worker 分道、逻辑并行组、skill 使用记录、模型档位建议、推荐模型、实际模型记录、耗时、用量和 handoff 证据。

## 升级旧 Workflow 产物

旧版本 controller 创建的 workflow 可以就地升级：

```bash
node scripts/omykit-workflow.mjs upgrade --all
node scripts/omykit-workflow.mjs upgrade --workflow <workflow-id>
```

`upgrade` 会补当前 artifact version、命令边界策略、自动编排策略、缺失运行目录、缺失节点卡和 `workflow-upgrade.json`。它不会伪造缺失的 handoff、token 用量、skill 使用、实际模型记录或验证证据。升级后重新运行 `board`，即可用最新版看板逻辑投影旧 workflow 状态。

## 文件

```text
.omykit/
  workflows/
    <workflow-id>/
      graph.json
      state.json
      assignments.jsonl
      ledger.jsonl
      decisions.md
      blockers.md
      nodes/
      handoffs/
      context-packs/
      commands/
      evidence/
      orchestration-plan.json
      workflow-upgrade.json
      board.json
      board.html
```

`graph.json` 定义 DAG。`state.json` 记录当前节点状态，并可用 `active_nodes` 记录并行工作中的多个活动节点。`assignments.jsonl` 是运行时 Agent 通讯录和分工记录。`ledger.jsonl` 是追加式事件历史。`nodes/` 保存任务卡。`handoffs/` 保存结构化节点结果。`context-packs/` 保存给续接或子智能体的最小上下文包。`commands/` 保存后台命令运行记录和可选日志。`evidence/` 保存命令输出、截图、摘要或导出证据。`board.json` 和 `board.html` 是生成出来的只读视图，可随时重新生成。

`.omykit/` 是 omyKit 的唯一运行时命名空间。Git 项目里，`init` 会把 `.omykit/` 写入 `.git/info/exclude`，不是 `.gitignore`，所以 workflow 运行状态默认只留在本地，不影响队友，也不会进入远程仓库；除非用户明确要求 vendor 到项目里。如果 `.omykit` 已经是一个非目录文件，omyKit 会停止并报告命名空间冲突，不会覆盖它。根目录里的 `graph.json`、`state.json`、`board.html`、`nodes/` 或 `handoffs/` 等通用名字会被 `doctor` 当作潜在旧产物冲突报告，但不会自动移动，因为它们可能是真正的项目文件。

## Compact 后续跑

compact 或中断后按这个顺序读取：

1. `.omykit/active-workflow` 或显式 `--workflow <id>`
2. `state.json`
3. `graph.json`
4. `assignments.jsonl`
5. 当前 running/ready 节点的 `context-packs/<node-id>.json`，没有时再生成
6. 最新相关 `ledger.jsonl` 事件
7. active、ready、failed 或 blocked 节点卡
8. 相关 handoff、command run 和 evidence 摘要

只有下一步需要精确修改、引用原文、安全/法律/隐私判断，或失败根因分析时，才回到完整源码或完整证据。

## 不做什么

- 不自动启动 agent。
- 不把 `parallel_group` 当成真实物理并发证明；真实 worker 活动应写入 `assignments.jsonl`、handoff 或 ledger event。
- 不调用 LLM。
- 不自动运行测试，除非 Codex 或用户显式运行命令。
- 不替代目标项目现有约定。
- 不让 Lite 工作默认变重。

参见 [task-graph.zh-CN.md](task-graph.zh-CN.md) 和 [handoff-protocol.zh-CN.md](handoff-protocol.zh-CN.md)。
