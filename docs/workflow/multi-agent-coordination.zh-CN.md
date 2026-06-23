# 多 Agent 协作与工作流意图

语言：[English](multi-agent-coordination.md) | [简体中文](multi-agent-coordination.zh-CN.md)

本文用于记录 omyKit 工作流的产品意图、参考对象、当前实现状态，以及 Codex thread-native 多 agent 协作的下一阶段设计。它是评估文档，不表示所有能力已经在 controller 中实现。

## 用户意图

omyKit 不是为了把每一步都套进重流程，而是为了让复杂任务在 Codex 中更可靠地完成：

- 高质量：任务被拆成可验收节点，失败可以打回，完成声明必须有证据。
- 高效率：简单任务保持 Lite；复杂任务才启用 controller、模板、scorecard 和看板。
- 尽量零人工托管：确认任务后自动推进；非阻塞问题记录下来，阻塞问题才升级给用户。
- 控制上下文和 token：每个节点只拿必要上下文；用 `context-pack`、`downstream_context`、证据摘要和命令记录避免反复读取全项目或整段对话。
- 避免长任务跑偏：把长任务拆成短节点，用结构化 handoff 交棒，而不是靠主聊天窗口长期记忆。
- 支持并行和汇聚：能串行、并行、扇出、汇聚、打回，并让看板反映真实任务进度。
- 模型按任务选择：简单节点用低成本档位，复杂设计/高风险审查用 frontier 档位；实际模型只在运行环境暴露时记录。
- 语言自适应：用户可见计划、问题、进度、handoff 和看板默认跟随用户提示词语言。
- 持续进化：delivery 节点记录可复用经验，scorecard 验证复盘是否发生，只有通过抽象测试的经验才进入通用套件。
- 保持来源可靠：只吸收高信号、官方或明确验证过的外部参考；不复制第三方 skill 正文、模板、图片、badge 或 branding。

理想效果是：用户只需要在 Codex 里说 `$omykit 开始执行：<任务>`，系统完成 intake、模板选择、节点推进、必要的多 agent 协作、证据记录、看板展示、验票和最终交付。用户可以随时看状态，但不需要手动驱动每个节点。

## 用户指定参考对象

这些来源由用户明确要求审查或借鉴。omyKit 只吸收可泛化的工作流思想，不复制第三方内容。

| 来源 | 借鉴点 | 当前状态 |
| --- | --- | --- |
| Prompt Chaining 思路 | 固定阶段、透明中间产物、校验拦截、用结构化流程换准确性。 | 已体现在 `workflow-templates/`、handoff、scorecard 和 controller 状态机。 |
| `obra/Superpowers` | brainstorming、planning、TDD、debugging、verification、review 等执行纪律。 | 已列入上游监控和工具注册表；作为纪律参考，不作为项目事实来源。 |
| `github/spec-kit` | constitution、spec-driven development、持久项目的 strict 流程。 | 已列入上游监控；用于 durable/Strict 项目信号。 |
| `Fission-AI/openspec` | proposal、delta、archive 的变更管理。 | 已列入上游监控；用于较正式的变更管理参考。 |
| `colbymchenry/codegraph` | 代码地图、调用关系、影响半径。 | 已列入工具注册表；代码结构探索优先语义索引。 |
| `upstash/context7` | 当前库文档查询。 | 已列入工具注册表；只在 API/库用法不稳定时使用。 |
| `GLips/Figma-Context-MCP` | Figma frame、组件、tokens 等设计源上下文。 | 已列入工具注册表；用于真实设计源，不凭空猜设计。 |
| `phuryn/pm-skills` | discovery、PRD、launch、pre-mortem、acceptance 等 PM 结构。 | 作为高信号可选 PM 参考；不默认路由。 |
| `birobirobiro/awesome-shadcn-ui` | shadcn/ui 生态发现。 | 作为高信号可选生态参考；不持久化目录内容。 |
| `Leonxlnx/taste-skill` | 反通用 UI、审美判断、品牌表达。 | 作为高信号视觉 specialist；按需使用。 |
| `nextlevelbuilder/ui-ux-pro-max-skill` | 高风险/复杂 UI/UX specialist 判断。 | 作为高信号视觉 specialist；按需使用。 |
| `zhongerxin/Cowart` | 用户要求核对的候选来源。 | 当前未进入默认注册表；若未来证明与 omyKit 职责不重叠且来源足够稳定，再按准入规则评估。 |
| Headroom / context compression 思路 | 大型 tool output、日志、RAG chunks 的可恢复压缩。 | 已吸收为“可选本地压缩、先缩小范围、原文可取回”的原则；未作为默认依赖。 |

## omyKit 自行补充参考对象

这些来源由维护过程中补充，用于补齐平台、工具和交付基础设施，不代表默认每次调用。

| 来源 | 借鉴点 | 当前状态 |
| --- | --- | --- |
| OpenAI Codex subagents 文档 | subagent 并行、模型选择、上下文污染/腐化风险、显式触发原则。 | 已影响 `dispatch-plan`、context pack 和主线程 orchestrator-observer 设计。 |
| OpenAI Codex app threads/worktrees 文档 | 多 thread、background work、worktree 隔离、handoff 到本地。 | 新增为下一阶段 thread-native 协作后端候选。 |
| OpenAI Codex + Agents SDK 文档 | 用 Codex MCP/Agents SDK 组织可追踪 multi-agent pipeline。 | 作为更重型外部 orchestrator 方向；不适合直接塞进轻量 skill 默认路径。 |
| Anthropic `frontend-design` | 官方 frontend UI 创建方向。 | 工具注册表中作为 UI 创建主能力。 |
| Impeccable 系列 | critique、audit、adapt、clarify、harden、onboard、extract、optimize 等窄能力。 | 作为职责清晰的 UI/UX narrow specialists。 |
| GSAP skills / Motion | 动效实现和动效系统。 | 仅在项目选择 GSAP 或有明确动效需求时调用。 |
| Docker / Moby / Playwright / GitHub MCP / Linear / Sentry / SonarQube / OpenAI CUA sample | 运行时、浏览器验证、工作追踪、观测、质量门禁和 GUI fallback。 | 作为平台或成熟基础设施参考；按任务和项目配置选择。 |

## 当前实现评估

| 需求 | 当前实现 | 评价 |
| --- | --- | --- |
| 不每步都跑 workflow | `omykit` 只在入口、范围变化、风险变化或交付前路由。 | 基本符合。 |
| 长任务不在创建 workflow 后停下 | skill 和 docs 已要求 `start -> work -> handoff -> complete/reject/block -> resume` 循环。 | 规则已补齐；真实执行仍依赖当前 Codex turn 的持续性。 |
| 可复用模板 | `change.standard`、`bugfix.standard`、`frontend-ui.strict`，并把拓扑、agent、模型、运行环境、安全限位、scorecard 分层。 | 符合方向，模板数量仍少。 |
| 结构化 handoff | schema、controller 校验、`downstream_context`、work items、evidence、skills、model、token/context、timing。 | 已比较完整。 |
| 子智能体并行 | `dispatch-plan` 给出 ready nodes、worker profile、推荐模型和 context pack。 | 有计划和记录，不自动调度。 |
| 多 thread / worktree agent | 已有 `dispatch-plan --surface`、`assign`、`assignments.jsonl`、Agent 通讯录、handoff 覆盖和写入范围 scorecard。 | 已具备记录和审计；仍不自动创建 thread/worktree。 |
| 低上下文续接 | `active-workflow`、`context-pack`、`downstream_context`、`commands/commands.jsonl`。 | 已有基础；还缺 thread-aware resume packet。 |
| 看板 | 展示任务、证据、skill、模型、token/context、时间、命令、交接包和整改建议。 | 已从通用模板升级为项目任务追踪；还不是实时调度台。 |
| 模型按任务选择 | model profile 推荐 `fast`、`standard`、`frontier` 和具体模型。 | 有推荐和记录；实际模型切换取决于 Codex 运行时能力。 |
| token/context/time 记录 | handoff 和 board 支持来源感知记录。 | 支持记录，不自动精确采集所有 Codex 内部用量。 |
| 自主进化 | delivery `evolution_candidates`、scorecard、`codex-workflow-evolution`。 | 闭环存在；还需更多真实任务沉淀模板升级。 |

结论：当前 omyKit 已经从“skill 说明集合”升级为“Skill + 轻量 controller + YAML 模板 + scorecard + 看板”的工作流套件，符合大部分核心需求。最明显短板是执行后端仍以当前主对话和 subagent 为中心，没有把 Codex app 的独立 thread/worktree 能力纳入 controller 运行模型。

## Codex 多 thread 协作可行性

当前 Codex 能力支持两种不同层级的多 agent 协作：

| 协作形态 | 适合 | 不适合 |
| --- | --- | --- |
| In-session subagents | 并行探索、审查、测试分析、短期独立任务，最后主线程汇总。 | 长时间后台执行、需要用户以后单独查看/继续的任务、重型代码改动冲突隔离。 |
| Background threads / worktrees | 长任务、独立分支、隔离写操作、后台执行、后续 handoff 到本地验证。 | 小任务、强共享上下文任务、多个 agent 同时改同一文件。 |

可行性：高。当前 Codex app 已有 thread 管理工具面，可以列线程、读线程、给线程发消息、创建项目 worktree 线程、handoff 线程，并能 pin/archive/rename。官方文档也明确支持 parallel threads、worktrees 和 subagents。

必要性：中高。对于 omyKit 的目标，thread-native 协作能解决三个现有痛点：

1. 主窗口上下文污染：长日志、探索过程和中间失败留在 worker thread，不压主控上下文。
2. 写操作隔离：worktree 让多个 worker 在不同 checkout 上工作，降低互相覆盖风险。
3. 长任务续接：每个 worker thread 可以独立保留自己的历史，主控只读结构化摘要和 handoff。

但它不应该替代现有 subagent 机制。推荐策略是双后端：

- `subagent` 后端：短、轻、读多写少、需要同一 turn 汇总。
- `thread_worktree` 后端：长、重、写多、可独立验收或需要后台运行。

## Agent 通讯录设计

“通讯录”应分成模板层和运行层：

| 层 | 文件/字段 | 内容 |
| --- | --- | --- |
| 模板层 | `workflow-templates/common/agents.yaml` | 稳定角色：planner、researcher、coder、tester、reviewer、delivery、ux-designer、visual-qa 等。 |
| 节点层 | graph/node card | 当前节点建议角色、模型档位、执行面、写入范围和 handoff target。 |
| 运行层 | `state.json` / `ledger.jsonl` / `assignments.jsonl` | 实际分配给哪个 Codex thread、subagent、worktree、模型、开始/结束时间、证据路径。 |
| 交接层 | `handoffs/*.json` | 真实产出、`downstream_context`、证据、用量、skill/model 记录。 |

建议扩展一个 `agent_roster` 或 `assignments` 结构，而不是把 thread id 写进模板：

```json
{
  "agent_id": "coder-ui-01",
  "role": "frontend-coder",
  "execution_surface": "thread_worktree",
  "thread_id": "runtime-provided",
  "project_scope": "current repository",
  "write_scope": ["src/ui/**", "tests/ui/**"],
  "model_tier": "standard",
  "context_pack": "context-packs/04-implement.json",
  "handoff_required": "handoffs/04-implement-to-05-visual-qa.json",
  "status": "running"
}
```

## 已落地的第一批能力

1. `dispatch-plan --surface auto|subagent|thread|worktree|main` 输出 ready node 推荐执行面。
2. `assign` 命令写入 `.omykit/workflows/<id>/assignments.jsonl`，记录 `thread_id`、worktree、worker、模型、scope、状态、context pack 和 handoff 路径。
3. 看板新增 Agent 通讯录，显示每个 agent 的角色、执行面、线程/worktree、节点和状态。
4. Scorecard 新增 assignment handoff 覆盖和写入范围冲突检查。
5. Compact recovery 顺序加入 `assignments.jsonl`，让主控恢复时能先读通讯录再决定续接哪个 worker。

## 后续优化路线

1. 接入 Codex app thread 工具，在用户明确要求后台/独立 thread 时自动创建受限 thread 或 worktree。
2. 给每个 assignment 增加 thread summary 拉取和 handoff 回写助手，降低主窗口读取完整 worker 历史的需要。
3. 看板继续升级 Thread Map，显示 thread 状态、最后消息、handoff 是否回流和需要用户介入的节点。
4. 对写操作制定更强保守策略：默认不要两个 background threads 改同一文件；需要并行写时必须 disjoint write scope 或 worktree 隔离。
5. 增加 thread-aware resume 命令：主控 compact 后先读 active workflow、assignments、context pack、thread summaries，再决定继续哪个 thread 或 handoff 到本地。

## 当前不建议做的事

- 不要让 controller 自动创建无限 background threads；Codex thread 创建必须是显式的用户意图或由 `$omykit` 命令明确触发。
- 不要让多个 thread 共享未约束写范围。
- 不要把某次运行的 thread id、worktree 路径写入通用模板。
- 不要把 Headroom 这类压缩代理设为默认依赖；只把“可恢复压缩”作为可选优化路径。
- 不要把低信号或未验证来源并入默认工具注册表。

## 下一步建议

下一轮建议实现真正的 Codex app thread 后端：由主控在用户明确授权的情况下创建独立 thread/worktree，把 context pack 作为启动消息，把返回摘要写入 handoff，并把 thread id、worktree 路径和最终状态补回 `assignments.jsonl`。
