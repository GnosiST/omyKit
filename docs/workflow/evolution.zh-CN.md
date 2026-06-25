# Workflow Evolution

语言：[English](evolution.md) | [简体中文](evolution.zh-CN.md)

omyKit 应该从真实使用中改进，但不能把每个项目里的本地习惯都变成通用规则。

## 原则

从证据学习，不凭感觉扩张。只有一条 workflow 规则能帮助多个项目类型、减少重复浪费或风险，并且不带目标项目假设时，才适合进入 omyKit。

## 进化循环

```text
observe -> classify -> abstract -> update smallest surface -> verify -> install -> document
```

对于追踪型 workflow，正式闭环是：

```text
delivery handoff -> evolution_candidates -> scorecard audit -> codex-workflow-evolution review -> smallest owner update -> validation/install -> changelog/evidence
```

能力缺口先走前置接入闭环：

```text
capability_gaps -> 本地/项目试验 -> 证据审查 -> evolution_candidates -> 候选分支或 not_promoted -> validation/install -> changelog/evidence
```

通过的 delivery 节点必须包含 `evolution_candidates`。空数组表示交付时已经复盘，但没有可复用经验。非空候选必须包含：

- `lesson`：需要改变或保留的经验
- `scope`：`generic_omykit`、`project_local`、`one_off` 或 `volatile_ecosystem`
- `promotion_status`：`candidate`、`promoted`、`not_promoted` 或 `needs_review`
- `evidence`：至少一个 handoff、命令输出、看板、用户反馈或审查路径
- 可选的 `owner`、`update_surface`、`rationale` 和 `next_action`

看板会展示候选项，并把 `generic_omykit` 候选转成整改建议。Scorecard 要求 delivery 节点记录复盘，但不会要求每次交付都必须产生通用经验。

这和 delivery `knowledge_sync`、节点级 `skill_decisions`、`capability_gaps` 分工不同：`evolution_candidates` 判断 omyKit 自身是否要改；`knowledge_sync` 记录当前项目交付时 README、docs、AGENTS/CLAUDE 规则或记忆是否已同步；`skill_decisions` 记录同类 skill 的选择、fallback 和用户反馈；`capability_gaps` 记录当前工具集不足、候选工具需要本地、项目本地或候选分支评估的情况。只有反复有效或反复失败的选择经验、或能力缺口试验证据，才应升级为通用候选。

## 证据来源

- 用户反复反馈
- 路由或工具选择反复失误
- `skill_decisions` 中反复出现的用户不满意、换 skill 后改善或同类 skill 选择失误
- handoff 时发现 stale docs
- validation failure 或 recurring broken links
- delivery gate 遗漏
- 反复手动执行、应该脚本化的命令
- 反复出现的 controller 摩擦，例如 handoff 无效、重试循环、节点类型缺失、打回目标不清，或状态文件无法支持续跑
- 上游参考发生变化，并可能包含可复用 workflow 经验
- 高信号候选工具在本地或项目本地试验后，确实填补了已记录能力缺口

## 分类

| Lesson type | 去向 |
| --- | --- |
| 一次性偏好 | 只留在当前对话 |
| 目标项目事实 | 目标项目 docs 或 `AGENTS.md` |
| 跨项目 workflow rule | omyKit skill 或 docs |
| 可重复机械检查 | `scripts/` 和 CI |
| 快速变化生态细节 | 当前来源链接或 registry reference |
| 上游参考变化 | 用 `upstream-watch` 审查；只提升可复用 workflow 经验 |
| 能力缺口候选 | 记录 `capability_gaps`；先本地试验；只有经过 `evolution_candidates` 和候选分支才提升 |

## 提升状态

| 状态 | 含义 |
| --- | --- |
| `candidate` | 交付时捕获，等待审查。 |
| `needs_review` | 证据有价值，但还需要来源核对或抽象测试。 |
| `promoted` | 已更新最小 owner surface，完成验证、安装和文档记录。 |
| `not_promoted` | 一次性、项目本地、易变、证据不足或没有通过抽象测试。 |

## 抽象测试

修改 omyKit 前确认：

- 它不只适用于一个仓库。
- 它不包含产品名、凭据、端口、技术栈选择或业务规则。
- 它可以表达成短规则、路由行、reference 或 validator。
- 它能降低未来风险、歧义或 token 浪费。
- 它不复制第三方文本或模板。
- 如果触发原因是新外部工具，必须有来源、license、安装/运行和真实输出证据。

## 更新位置

| 需求 | 更新位置 |
| --- | --- |
| 用户可见解释 | `README.md` 或 `docs/workflow/` |
| 程序化行为 | 相关 `skills/*/SKILL.md` |
| 条件细节 | 单层 `references/` 文件 |
| 可重复检查 | `scripts/` 和 CI |
| 用户可见 kit 变更 | `CHANGELOG.md` |
| 外部参考漂移 | `upstream-sources.json`、[upstream-watch.zh-CN.md](upstream-watch.zh-CN.md) 和最小受影响 owner surface |

## 项目隔离

维护 omyKit 本身时，不要检查或编辑 sibling projects，除非用户明确要求跨项目同步。目标项目可以提供模式启发，但它们的技术栈、路由、凭据、端口、产品规则和业务术语不属于通用 kit。

## 验证

修改 skills 或 workflow docs 后：

```bash
./scripts/validate-skills.sh
node ./scripts/validate-docs.mjs
node ./scripts/check-upstream-refs.mjs
git diff --check
./scripts/project-local.sh enable <target-project>
```
