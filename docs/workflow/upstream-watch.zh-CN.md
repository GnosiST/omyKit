# Upstream Reference Watch

语言：[English](upstream-watch.md) | [简体中文](upstream-watch.zh-CN.md)

omyKit 把外部仓库当作参考信号，而不是 vendored doctrine。上游变化应该定期审查，但不应该打断日常任务。

## 来源

跟踪的参考来源记录在 [`upstream-sources.json`](../../upstream-sources.json)。

当前跟踪来源：

- `phuryn/pm-skills`：PM 方法参考。
- `birobirobiro/awesome-shadcn-ui`：shadcn/ui 生态发现。
- `Leonxlnx/taste-skill`：设计品味校准。

## 节奏

- GitHub Actions 每月自动检查。
- release 或较大 workflow 修订前可手动触发 `workflow_dispatch`。
- 当某个任务依赖当前外部 skill 行为时，主动本地检查。

## 本地检查

```bash
node ./scripts/check-upstream-refs.mjs
```

当上游变化应在发布前阻塞 review 时使用 strict 模式：

```bash
node ./scripts/check-upstream-refs.mjs --strict
```

## 审查规则

当上游来源变化时：

1. 查看从记录 baseline 到最新 commit 的 upstream diff 或 release notes。
2. 只总结可复用 workflow 经验、新能力类别或路由影响。
3. 修改 omyKit 前先运行 `codex-workflow-evolution` 抽象测试。
4. 更新最小 owner surface：tool registry、workflow docs、聚焦 skill 规则、validator，或不做持久变更。
5. 只有审查完成后，才更新 `upstream-sources.json` baseline。

## 护栏

- 不要把第三方 skill body、模板、资源列表、图片、badge 或 branding 复制进 omyKit。
- 不要把快速变化的生态列表变成固定规则。
- 不要每个任务都运行这个检查；只在学习、发布或依赖当前来源的边界运行。
