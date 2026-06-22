# Upstream Reference Watch

语言：[English](upstream-watch.md) | [简体中文](upstream-watch.zh-CN.md)

omyKit 把外部仓库当作参考信号，而不是 vendored doctrine。上游变化应该定期审查，但不应该打断日常任务。

## 来源

跟踪的参考来源记录在 [`upstream-sources.json`](../../upstream-sources.json)。

这里的“官方性”指 omyKit 为某项能力跟踪的精确上游或项目主页仓库，不表示仓库所有者对 omyKit 背书。下面快照于 2026-06-22 通过 GitHub repository API 核对；star 数会变化，只有当来源声誉会实质影响决策时才需要刷新。

| 来源 | 开发者 / 所有者 | 2026-06-22 stars | 状态 | omyKit 参考范围 |
| --- | --- | ---: | --- | --- |
| [obra/Superpowers](https://github.com/obra/Superpowers) | `obra` / User | 235,577 | 非 fork, 活跃 | 只参考执行纪律、规划、TDD、调试、评审和验证信号；不复制 workflow 文本。 |
| [github/spec-kit](https://github.com/github/spec-kit) | `github` / Organization | 114,714 | 非 fork, 活跃 | 只参考持久项目的 strict SDD 和 constitution 信号；不复制模板。 |
| [Fission-AI/openspec](https://github.com/Fission-AI/openspec) | `Fission-AI` / Organization | 55,969 | 非 fork, 活跃 | 只参考 proposal 和 archived delta 的变更管理模式；不打包 CLI 或模板。 |
| [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | `colbymchenry` / User | 52,986 | 非 fork, 活跃 | 只作为代码地图和影响分析路由信号；不打包依赖。 |
| [upstash/context7](https://github.com/upstash/context7) | `upstash` / Organization | 57,851 | 非 fork, 活跃 | 只作为当前库文档查询信号；不镜像文档。 |
| [zhongerxin/Cowart](https://github.com/zhongerxin/Cowart) | `zhongerxin` / User | 1,735 | 非 fork, 活跃 | 只作为视觉画布和空间上下文路由信号；不打包资产。 |
| [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) | `GLips` / User | 15,188 | 非 fork, 活跃 | 只作为 Figma 设计上下文路由信号；不打包 MCP 配置或代码。 |
| [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | `phuryn` / User | 20,433 | 非 fork, 活跃 | 只参考 PM 方法类别和路由提示；不复制 PRD 或发布模板。 |
| [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) | `birobirobiro` / User | 19,884 | 非 fork, 活跃 | 只作为 shadcn/ui 生态发现信号；不复制快速变化的目录。 |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `Leonxlnx` / User | 48,774 | 非 fork, 活跃 | 只作为视觉品味校准信号；不复制 skill body。 |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `nextlevelbuilder` / Organization | 94,930 | 非 fork, 活跃 | 只作为 UX/设计智能和模式比较信号；不复制数据库或 skill body。 |
| [anthropics/skills](https://github.com/anthropics/skills) | `anthropics` / Organization | 153,760 | 非 fork, 活跃 | 只作为官方 frontend-design 来源链接和路由参考；不把 skill body 复制进 omyKit。 |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `greensock` / Organization | 9,719 | 非 fork, 活跃 | 只作为官方 GSAP API skill 路由参考；不把 skill body 复制进 omyKit。 |
| [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) | `headroomlabs-ai` / Organization | 45,899 | 非 fork, 活跃 | 只作为可选上下文压缩和输出整形参考；不作为默认依赖或代理打包。 |
| [openai/codex](https://github.com/openai/codex) | `openai` / Organization | 92,646 | 非 fork, 活跃 | Codex 平台/源码参考；omyKit 不 vendor Codex。 |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `pbakaus` / User | 40,158 | 非 fork, 活跃 | 本地设计 skill 家族的上游参考；只记录路由边界，不复制更多上游文本。 |
| [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | `ibelick` / User | 3,302 | 非 fork, 活跃 | 本地 UI 工程 skill 家族的上游参考；不把上游 body 复制进 omyKit。 |
| [better-auth/better-icons](https://github.com/better-auth/better-icons) | `better-auth` / Organization | 1,105 | 非 fork, 活跃 | 本地图标策略参考；不 vendor CLI 或 MCP 代码。 |
| [motiondivision/motion](https://github.com/motiondivision/motion) | `motiondivision` / Organization | 32,454 | 非 fork, 活跃 | 官方 Motion GitHub 参考；Motion AI Kit 行为以官方 docs 为准。 |
| [canva-sdks/canva-claude-skills](https://github.com/canva-sdks/canva-claude-skills) | `canva-sdks` / Organization | 41 | 非 fork, 活跃 | Canva connector/agent-skill 来源参考；omyKit 不 vendor Canva skills。 |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | `remotion-dev` / Organization | 50,848 | 非 fork, 活跃 | 视频渲染平台参考；不打包依赖。 |
| [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) | `FFmpeg` / Organization | 61,333 | 非 fork, 活跃 | 媒体处理参考；omyKit 不 vendor FFmpeg。 |
| [docker/compose](https://github.com/docker/compose) | `docker` / Organization | 37,579 | 非 fork, 活跃 | 本地多服务运行时准备参考。 |
| [moby/moby](https://github.com/moby/moby) | `moby` / Organization | 71,727 | 非 fork, 活跃 | 容器运行时生态参考；项目级路由优先使用 Docker Compose。 |
| [GoogleChrome/chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) | `GoogleChrome` / Organization | 17,619 | 非 fork, 活跃 | Chrome extension 平台参考；Codex Chrome 插件行为仍以第一方 runtime 为准。 |
| [microsoft/playwright](https://github.com/microsoft/playwright) | `microsoft` / Organization | 91,381 | 非 fork, 活跃 | 浏览器自动化参考；不打包依赖。 |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | `github` / Organization | 30,870 | 非 fork, 活跃 | GitHub 平台工具参考；仓库事实仍优先本地 git/gh。 |
| [linear/linear](https://github.com/linear/linear) | `linear` / Organization | 1,454 | 非 fork, 活跃 | Linear 工作追踪参考；不打包 SDK。 |
| [getsentry/sentry](https://github.com/getsentry/sentry) | `getsentry` / Organization | 44,146 | 非 fork, 活跃 | 可观测性平台参考；只在部署运行时证据相关时使用。 |
| [SonarSource/sonarqube](https://github.com/SonarSource/sonarqube) | `SonarSource` / Organization | 10,699 | 非 fork, 活跃 | 静态质量和安全门禁参考；不替代本地验证。 |
| [chromaui/chromatic-cli](https://github.com/chromaui/chromatic-cli) | `chromaui` / Organization | 337 | 非 fork, 活跃 | Storybook 视觉回归参考；不打包 CLI。 |
| [coderabbitai/awesome-coderabbit](https://github.com/coderabbitai/awesome-coderabbit) | `coderabbitai` / Organization | 402 | 非 fork, 活跃 | CodeRabbit 资源参考；产品行为应通过当前 docs/app output 验证。 |
| [openai/openai-cua-sample-app](https://github.com/openai/openai-cua-sample-app) | `openai` / Organization | 1,740 | 非 fork, 活跃 | Computer Use 平台示例参考；不 vendor 示例 app。 |

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
- 不接入低信号社区 specialist skill。优先选择已验证且 1,000+ stars 的仓库；低 star 例外只限第一方平台来源，并标成 platform/connector 参考。
- 不要把快速变化的生态列表变成固定规则。
- 不要每个任务都运行这个检查；只在学习、发布或依赖当前来源的边界运行。
