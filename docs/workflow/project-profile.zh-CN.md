# omyKit 项目 Profile

语言：[English](project-profile.md) | [简体中文](project-profile.zh-CN.md)

本 profile 描述 omyKit 仓库本身。它是本仓库做 retrofit 健康检查、维护命令、发布准备和 workflow 状态边界判断的本地事实来源。

## 项目类型

omyKit 是一个 workflow 工具和文档仓库。它打包：

- `skills/` 下的全局 Codex skills
- `prompts/` 下的 prompt alias
- `scripts/omykit-workflow.mjs` 本地 workflow controller
- `workflow-templates/` 下的可复用 workflow 模板
- `schemas/` 下的 JSON schemas
- `docs/workflow/` 下的安装、controller、路由、交付、版本管理和工具选择文档
- `scripts/` 下的安装、回滚、上游监控、校验和 controller 测试脚本

本仓库是通用套件。不要把目标项目的产品规则、端口、凭据、技术栈假设或业务特定 workflow 习惯写进这里。

## 事实来源

| 位置 | 作用 |
| --- | --- |
| `AGENTS.md` | 本仓库维护时的 agent 规则。 |
| `README.md` / `README.zh-CN.md` | 面向用户的快速开始、命令示例、安装/更新/发布说明。 |
| `docs/README.md` / `docs/README.zh-CN.md` | 文档索引。 |
| `docs/workflow/` | 持久 workflow 设计、操作和治理文档。 |
| `skills/*/SKILL.md` | 安装到 Codex 的精简过程化路由规则。 |
| `workflow-templates/` | 可复用任务图、agents、模型 profiles、安全限位和 scorecards。 |
| `schemas/` | workflow artifact 的机器可读契约。 |
| `upstream-sources.json` | 已审阅外部参考注册表和 baseline commits。 |
| `CHANGELOG.md` | 用户可见的 omyKit 变化。 |

## 维护门禁

修改 skill、controller、schema、template 或 docs 后，交付前运行：

```bash
node scripts/omykit-workflow.mjs templates validate
node scripts/test-omykit-workflow.mjs
node ./scripts/validate-docs.mjs
PYTHON=/tmp/omykit-skill-validate/bin/python ./scripts/validate-skills.sh
git diff --check
```

release 前，或 workflow/spec/代码智能/文档/设计/动效/生态/上下文压缩路由依赖当前外部行为时，运行上游审查：

```bash
node ./scripts/check-upstream-refs.mjs --json
```

如果本地 `python3` 缺少 `PyYAML`，使用一次性 Python runtime 并通过 `PYTHON=...` 指定；不要为了本地校验把 Python 包状态写进本仓库。

## Controller 健康检查

本仓库和目标项目都可以使用 controller 健康命令：

```bash
node scripts/omykit-workflow.mjs doctor --lang zh-CN
node scripts/omykit-workflow.mjs doctor --fix --lang zh-CN
node scripts/omykit-workflow.mjs cleanup --dry-run --lang zh-CN
node scripts/omykit-workflow.mjs cleanup --uninstall-local --apply --lang zh-CN
```

`doctor` 会写入 `.omykit/health/health-report.json`，但 `.omykit/` 是本地 ignored runtime state。Git 项目里，`init` 和 `doctor --fix` 使用 `.git/info/exclude`，不是 `.gitignore`，所以默认不影响队友和远程仓库。除非用户明确选择把 workflow state vendor 进项目，否则不要提交生成的 health reports、boards、workflow ledgers、context packs 或 archives。

`doctor --fix` 可以给本地 workflow artifacts 补兼容元数据和缺失运行目录，但不能伪造 handoff、token 用量、skill 使用、实际模型记录或验证证据。

`cleanup --apply` 只把安全候选归档到 `.omykit/archive/<timestamp>/`；不能直接删除 workflow evidence。

`cleanup --uninstall-local --apply` 会把 `.omykit/` 移动到本地非项目归档位置，从目标项目工作区移除 omyKit；Git 项目通常归档到 `.git/omykit-uninstalled/`。

`.omykit/workflows/` 下的历史 dogfood workflow 可能早于当前 handoff 要求。缺少 intake decision、`knowledge_sync`、`evolution_candidates` 或 agent scope 时，应把它们视为审计发现；只能从真实记录修复、保留为历史证据，或审查后归档。

## 运行时和工具链

- Node.js 运行 controller、docs 校验、上游检查和 workflow 测试。
- 只有已安装 Codex skill validator 需要带 `PyYAML` 的 Python。
- 常规 omyKit 校验不需要 app server、database、Docker service、browser session 或 middleware。
- CodeGraph 可索引 `scripts/*.mjs` 和 workflow YAML，用于 controller 结构审查；源码测试仍是最终权威。

## 版本管理和回滚

- `VERSION` 记录当前 omyKit version。
- `CHANGELOG.md` 记录用户可见变化。
- Git commits 和 tags 提供历史追踪。
- `./scripts/install-global.sh` 把当前 checkout 安装到 `${CODEX_HOME:-$HOME/.codex}`。
- `./scripts/install-ref.sh <ref>` 安装历史 branch、tag 或 commit。
- `./scripts/rollback-global.sh latest` 恢复最近一次全局安装备份。
- release 或 handoff 安装必须从最终干净提交运行，install manifest 必须显示 `git_dirty=false`。

## 定制边界

目标项目定制应留在目标项目：

- `AGENTS.md` 或等价项目规则
- 目标项目的 `docs/workflow/project-profile.md`
- 仅在明确 vendoring 时使用可选 repo-local `.codex/skills/`
- 目标项目脚本和运行时文档

omyKit 提供可复用路由和 workflow 机制，不承载项目特定产品政策。
