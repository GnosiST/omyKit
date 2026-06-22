# Upstream Reference Watch

语言：[English](upstream-watch.md) | [简体中文](upstream-watch.zh-CN.md)

omyKit 把外部仓库当作参考信号，而不是 vendored doctrine。上游变化应该定期审查，但不应该打断日常任务。

## 来源

跟踪的参考来源记录在 [`upstream-sources.json`](../../upstream-sources.json)。

这里的“官方性”指 omyKit 为某项能力跟踪的精确上游或项目主页仓库，不表示仓库所有者对 omyKit 背书。下面快照于 2026-06-22 通过 GitHub repository API 核对；star 数会变化，只有当来源声誉会实质影响决策时才需要刷新。

| 来源 | 开发者 / 所有者 | 2026-06-22 stars | 状态 | omyKit 参考范围 |
| --- | --- | ---: | --- | --- |
| [`obra/Superpowers`](https://github.com/obra/Superpowers) | `obra` / User | 235,549 | 非 fork，活跃 | 只参考执行纪律、规划、TDD、调试、评审和验证信号；不复制 workflow 文本。 |
| [`github/spec-kit`](https://github.com/github/spec-kit) | `github` / Organization | 114,712 | 非 fork，活跃 | 只参考持久项目的 strict SDD 和 constitution 信号；不复制模板。 |
| [`Fission-AI/openspec`](https://github.com/Fission-AI/openspec) | `Fission-AI` / Organization | 55,967 | 非 fork，活跃 | 只参考 proposal 和 archived delta 的变更管理模式；不打包 CLI 或模板。 |
| [`colbymchenry/codegraph`](https://github.com/colbymchenry/codegraph) | `colbymchenry` / User | 52,973 | 非 fork，活跃 | 只作为代码地图和影响分析路由信号；不打包依赖。 |
| [`upstash/context7`](https://github.com/upstash/context7) | `upstash` / Organization | 57,851 | 非 fork，活跃 | 只作为当前库文档查询信号；不镜像文档。 |
| [`zhongerxin/Cowart`](https://github.com/zhongerxin/Cowart) | `zhongerxin` / User | 1,723 | 非 fork，活跃 | 只作为视觉画布和空间上下文路由信号；不打包资产。 |
| [`GLips/Figma-Context-MCP`](https://github.com/GLips/Figma-Context-MCP) | `GLips` / User | 15,187 | 非 fork，活跃 | 只作为 Figma 设计上下文路由信号；不打包 MCP 配置或代码。 |
| [`phuryn/pm-skills`](https://github.com/phuryn/pm-skills) | `phuryn` / User | 20,429 | 非 fork，活跃 | 只参考 PM 方法类别和路由提示；不复制 PRD 或发布模板。 |
| [`birobirobiro/awesome-shadcn-ui`](https://github.com/birobirobiro/awesome-shadcn-ui) | `birobirobiro` / User | 19,884 | 非 fork，活跃 | 只作为 shadcn/ui 生态发现信号；不复制快速变化的目录。 |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) | `Leonxlnx` / User | 48,761 | 非 fork，活跃 | 只作为视觉品味校准信号；不复制 skill body。 |
| [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `nextlevelbuilder` / Organization | 94,918 | 非 fork，活跃 | 只作为 UX/设计智能和模式比较信号；不复制数据库或 skill body。 |
| [`anthropics/skills`](https://github.com/anthropics/skills) | `anthropics` / Organization | 153,753 | 非 fork，活跃 | 只作为官方 `frontend-design` 来源链接和路由参考；不把 skill body 复制进 omyKit。 |
| [`greensock/gsap-skills`](https://github.com/greensock/gsap-skills) | `greensock` / Organization | 9,717 | 非 fork，活跃 | 只作为官方 GSAP API skill 路由参考；不把 skill body 复制进 omyKit。 |
| [`headroomlabs-ai/headroom`](https://github.com/headroomlabs-ai/headroom) | `headroomlabs-ai` / Organization | 45,826 | 非 fork，活跃 | 只作为可选上下文压缩和输出整形参考；不作为默认依赖或代理打包。 |

## 节奏

- GitHub Actions 每月自动检查。
- release 或较大 workflow 修订前可手动触发 `workflow_dispatch`。
- 当某个任务依赖当前外部 skill 行为时，主动本地检查。

## 本地检查

```bash
node ./scripts/check-upstream-refs.mjs
```

这个命令会同时检查 upstream `HEAD` 是否漂移，以及 `upstream-sources.json` 里的来源完整性快照字段是否齐全。

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
- 不要用同名 fork、marketplace 镜像或二次打包 skill 替代已链接的官方来源，除非用户明确要求使用那个替代来源。
- 不要把快速变化的生态列表变成固定规则。
- 不要每个任务都运行这个检查；只在学习、发布或依赖当前来源的边界运行。
