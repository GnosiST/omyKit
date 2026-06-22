# 工具注册表

语言：[English](tool-registry.md) | [简体中文](tool-registry.zh-CN.md)

本注册表说明 Codex 如何组合工具，同时避免默认加载或使用所有工具。

| Tool | 角色 | 使用场景 | 避免场景 |
| --- | --- | --- | --- |
| Codex | 控制面 | 始终使用。它负责路由、规划、编辑、验证和总结。 | 不要用不协调的独立工具绕过它。 |
| AGENTS.md | 持久仓库规则 | 稳定约定、命令、边界和 definition of done。 | 一次性 notes、历史或长机制更适合 docs。 |
| Superpowers | 执行纪律 | Brainstorming、planning、debugging、TDD、verification、review。 | 不作为 spec source 或项目事实来源。 |
| Spec-Kit | 项目 constitution 和 strict SDD | 新的持久项目或重大产品基础。 | 小变更或已有轻量 spec system 的项目。 |
| OpenSpec | 变更管理 | 标准 feature/bug/refactor proposal 和 archived deltas。 | 一次性临时交付物。 |
| CodeGraph | 代码地图和影响分析 | 现有代码结构、callers/callees、blast radius。 | 替代测试、源码确认或运行时检查。 |
| Context7 | 当前库文档 | 精确 API/framework 用法问题。 | 仓库里已有的一般项目事实。 |
| Cowart | 视觉画布 | 产品流程、草图、截图、空间思考、设计参考。 | 替代 specs 或实现文件。 |
| Figma MCP | 设计源 | 现有设计文件、frames、components、tokens。 | 在无访问时猜设计。 |
| imagegen | 位图资产生成/编辑 | Bitmap visuals、moodboards、slide images、thumbnails、hero images、cutouts。 | SVG/icon systems、确定性 UI code、已有 vector assets。 |
| Canva | 设计/deck 生产 | Canva-native presentations、social formats、brand kits。 | Code-native UI 或本地 editable files。 |
| presentations | Deck 创建/编辑 | PPTX/slide artifacts 和 rendered verification。 | App UI 或非 slide docs。 |
| documents/PDF | 文档交付物 | DOCX/PDF 创建、编辑、redline、render checks。 | 纯 markdown 工作。 |
| spreadsheets | 数据表 | CSV/XLSX analysis、formulas、charts、exports。 | 自由文本 docs 或 code data models。 |
| Remotion/ffmpeg | 视频渲染 | 确定性视频 composition 和 export。 | 需要 desktop app 的纯手工编辑。 |
| RTK | 命令噪声控制 | 配置环境中的 shell commands。 | 文档例外要求绕过 RTK 的命令。 |
| Docker/Compose | 运行时依赖 | Databases、caches、object storage、queues、local emulators。 | 服务已运行或 tests 使用 in-memory/testcontainers。 |
| Chrome Extension | 真实 Chrome profile | 登录态网站、项目要求 Chrome、真实 profile visual checks。 | Localhost checks 可由 in-app browser/Playwright 完成。 |
| Playwright MCP | 可重复浏览器自动化 | 结构化 web interactions 和 accessibility snapshots。 | Desktop apps 或 native mobile devtools。 |
| Computer Use | 本地 GUI fallback | WeChat DevTools、desktop design/video/deck apps、OS file pickers、export panels。 | Code edits、shell tasks、已有专用工具的 browser tasks、未经确认的 risky UI actions。 |
| GitHub/Linear | 工作追踪 | Issues、PRs、review threads、handoff。 | 仓库本地已有的代码事实。 |
| Sentry/observability | 运行时失败 | 部署系统中的 logs、errors、traces。 | 本地 build 或 unit test failures。 |
| CodeRabbit/Sonar/Chromatic | 外部质量门禁 | PR review、static quality/security、visual regression。 | 替代本地验证。 |

## 外部 Skill 协作

把外部 skill 项目作为协作者，而不是要整体合并的内容：

- PM-focused skills 可支持产品发现、PRD、发布规划、pre-mortem 和测试场景。
- Design taste skills 可在 omyKit 路由任务后支持视觉重要的 frontend 和 redesign 工作。
- shadcn ecosystem catalogs 可支持当前资源发现，但不要复制其资源列表。

当外部参考实质改变决策时记录来源；如果 vendoring 第三方内容，保留 license/attribution。

## 版本管理准备度

当目标项目需要可追踪历史、release notes、rollback、migration safety、dependency rollback 或 project-local customization 时，使用 `codex-version-readiness`。这是治理检查，不是要求每个项目都增加重型发布工具。

## 默认选择规则

使用能回答下一个问题的最窄工具。如果某个工具会增加大量上下文但不改变下一步决策，就跳过它。
