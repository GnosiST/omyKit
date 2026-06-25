# 版本管理准备度

语言：[English](versioning.md) | [简体中文](versioning.zh-CN.md)

使用本指南检查目标项目是否可以被安全修改、审查、定制和回滚。omyKit 应暴露缺口；不应强加不适合项目的发布流程。

## 目标项目清单

在 `init`、`retrofit`、重要 `change` 和 `delivery` 工作中检查：

- Git 仓库存在，并且当前分支已知。
- 大范围编辑前 working tree state 可见。
- 需要协作或发布时配置了 remote repository。
- Branching convention 已记录，或提出了安全默认值。
- 项目发布持久交付物时存在 release/version source：
  - package/app version（`package.json`、`pyproject.toml`、app config 等）
  - `VERSION`
  - `CHANGELOG.md`
  - release notes directory
  - GitHub Releases 或 tags
- 交付物的 rollback path 已知：
  - revert commit
  - redeploy previous release
  - restore database backup
  - reverse migration
  - restore previous generated artifact
  - reinstall previous skill/package version
- Customization path 清晰：
  - fork 或 branch
  - project-local config
  - project-local `AGENTS.md`
  - repo-local skill directory，例如 Codex 的 `.codex/skills/`
  - environment-specific settings
- Historical lookup 可行：
  - tags/releases
  - changelog entries
  - commit messages
  - issue/PR links
  - archived specs 或 decision records

## 模式指导

| Mode | 版本管理要求 |
| --- | --- |
| `Lite` | 知道当前 git status，并避免破坏性编辑。如果没有 rollback path，需要说明。 |
| `Standard` | 使用分支或清晰 commit scope。记录 changed artifacts 和 verification。用户可见行为变化时添加 changelog/release note。 |
| `Strict` | 高风险变更前要求明确 rollback plan。检查 migrations、data backup、deployment rollback、version bump、release notes 和可追踪 PR/issue/spec links。 |

## Init 指导

对新的目标项目，创建或建议：

- 如果缺失，初始化 git repository
- branch naming convention
- 持久项目的 `CHANGELOG.md` 或 release notes path
- 预期发布时的 `VERSION` 或 package-native version source
- delivery gates 文档中的 rollback expectations
- `AGENTS.md` 或 `docs/workflow/project-profile.md` 中的 customization boundary

除非用户要求，不要给一次性草稿、临时文档或低风险实验加发布机制。

## Retrofit 指导

对现有目标项目，先检查再提议变更：

- 当前 branch 和 dirty files
- remotes 和 default branch
- tags/releases/changelog/version files
- 现有 CI/release/deploy scripts
- migration 和 backup strategy
- project-local skills/config overrides
- 现有 contribution 或 branching rules

保留现有约定。如果版本管理薄弱，记录缺口并提出最小有用下一步。

## Change 指导

有意义变更前：

- 检查 `git status`
- 判断是否需要 branch、issue、spec、changelog 或 version bump
- 没有明确 rollback path 时避免 destructive migrations/resets
- 将 customization 保留在项目自有文件中，不要编辑全局安装工具

变更后：

- 报告 changed files
- 报告 verification evidence
- 说明 rollback 是简单 revert，还是需要特殊处理
- 只有项目约定需要时才更新 changelog/release notes

## Delivery 指导

在说工作 ready 前，捕获：

- 当前 branch，以及是否有 uncommitted changes
- verification commands 和 results
- artifact paths 或 release outputs
- skipped checks 和 residual risk
- rollback path
- 是否需要 version/changelog/tag/release note updates

## omyKit 仓库版本管理

对本仓库自身：

- `VERSION` 是当前 omyKit version。
- `CHANGELOG.md` 记录用户可见变更。
- Git tags 标记已发布版本。使用 `vMAJOR.MINOR.PATCH`。
- 项目级启用会在目标项目 `.omykit/kit/install-manifest` 写入 manifest。
- 项目级启用会在目标项目 `.omykit/kit/backups/` 保留 backups。
- `disable` 会关闭项目 entry points 但保留 runtime；`uninstall` 会归档 `.omykit`。
- 全局安装和回滚只作为显式 fallback。
- release 和 handoff 安装应从最终干净提交运行，这样 manifest 会记录当前 commit 且 `git_dirty=false`。

给目标项目启用当前工作树：

```bash
./scripts/project-local.sh enable <target-project>
./scripts/project-local.sh status <target-project>
./scripts/project-local.sh disable <target-project>
```

安装历史 omyKit git ref 到全局 fallback：

```bash
./scripts/install-ref.sh main
./scripts/install-ref.sh <release-tag>
./scripts/install-ref.sh <commit-sha>
```

恢复之前的全局 omyKit 安装：

```bash
./scripts/rollback-global.sh latest
./scripts/rollback-global.sh <backup-directory-name>
```

检查已安装 omyKit：

```bash
cat <target-project>/.omykit/kit/install-manifest
# global fallback only:
cat "${CODEX_HOME:-$HOME/.codex}/omykit/install-manifest"
```

## 版权与定制

定制 omyKit 或目标项目时：

- 优先使用项目原创 instructions，而不是复制第三方文本
- 将第三方 skill/project references 保持为链接或路由指导
- 如果 vendoring 实质第三方内容，保留 license 和 attribution
- 将 skills vendoring 到项目时，记录 upstream version 或 commit
