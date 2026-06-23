# Workflow Evolution

语言：[English](evolution.md) | [简体中文](evolution.zh-CN.md)

omyKit 应该从真实使用中改进，但不能把每个项目里的本地习惯都变成通用规则。

## 原则

从证据学习，不凭感觉扩张。只有一条 workflow 规则能帮助多个项目类型、减少重复浪费或风险，并且不带目标项目假设时，才适合进入 omyKit。

## 进化循环

```text
observe -> classify -> abstract -> update smallest surface -> verify -> install -> document
```

## 证据来源

- 用户反复反馈
- 路由或工具选择反复失误
- handoff 时发现 stale docs
- validation failure 或 recurring broken links
- delivery gate 遗漏
- 反复手动执行、应该脚本化的命令
- 反复出现的 controller 摩擦，例如 handoff 无效、重试循环、节点类型缺失、打回目标不清，或状态文件无法支持续跑
- 上游参考发生变化，并可能包含可复用 workflow 经验

## 分类

| Lesson type | 去向 |
| --- | --- |
| 一次性偏好 | 只留在当前对话 |
| 目标项目事实 | 目标项目 docs 或 `AGENTS.md` |
| 跨项目 workflow rule | omyKit skill 或 docs |
| 可重复机械检查 | `scripts/` 和 CI |
| 快速变化生态细节 | 当前来源链接或 registry reference |
| 上游参考变化 | 用 `upstream-watch` 审查；只提升可复用 workflow 经验 |

## 抽象测试

修改 omyKit 前确认：

- 它不只适用于一个仓库。
- 它不包含产品名、凭据、端口、技术栈选择或业务规则。
- 它可以表达成短规则、路由行、reference 或 validator。
- 它能降低未来风险、歧义或 token 浪费。
- 它不复制第三方文本或模板。

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
./scripts/install-global.sh
```
