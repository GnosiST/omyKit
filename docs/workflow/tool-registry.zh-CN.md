# 工具注册表

语言：[English](tool-registry.md) | [简体中文](tool-registry.zh-CN.md)

本注册表说明 Codex 如何组合工具，同时避免默认加载或使用所有工具。

`来源标记` 和 `已验证来源` 两列说明每个条目是 omyKit 核心项、本地已安装 skill、官方上游 skill、平台工具、OpenAI bundled 工具、成熟基础设施参考，还是仓库本地机制。只有对路由或来源完整性有实质影响的 GitHub 来源才进入 `upstream-sources.json`。不要用同名 fork、marketplace 镜像或二次打包 skill 替代已验证来源，除非用户明确要求使用那个替代来源。

默认注册表保持保守。只接纳 omyKit 自有路由、一方平台/工具来源、官方上游 skill、成熟交付基础设施，或高信号且职责不重叠的 specialist skill。视觉/UI 类社区 skill 的默认准入线是 GitHub 10k+ stars，并且必须是非 fork、活跃、来源已核验；低星本地安装可以继续存在于用户 Codex 环境中，但不应列入本表，也不由 omyKit 默认路由调用。Stars 只是辅助信号，不是准入证明。社区 PM、审美、资源目录或 meta-UX 类 skill 是按需参考，不是默认 route，除非用户为当前任务明确要求。

工具选择必须先用官方、一方、专用、平台原生或项目原生能力，再考虑通用 GUI 自动化。只有没有合适的官方/bundled connector、MCP/plugin、浏览器自动化、shell/API 路径、项目脚本或平台官方 CLI 能完成本地 GUI 任务时，才使用 Computer Use 作为 fallback。

| Tool | 来源标记 | 已验证来源 | 角色 | 使用场景 | 避免场景 |
| --- | --- | --- | --- | --- | --- |
| Codex | 核心控制面 | [openai/codex](https://github.com/openai/codex) (92,647★) | 控制面 | 始终使用。它负责路由、规划、编辑、验证和总结。 | 不要用不协调的独立工具绕过它。 |
| Codex app threads/worktrees | OpenAI 平台能力 | [Codex app features](https://developers.openai.com/codex/app/features)、[Worktrees](https://developers.openai.com/codex/app/worktrees)、[Prompting threads](https://developers.openai.com/codex/prompting) | 后台协作 | 长任务、写操作较重、需要独立审查或适合放到独立 thread/worktree 的工作。 | 小任务、未约束共享写范围，或替代 omyKit 结构化 handoff。 |
| AGENTS.md | 仓库本地规则 | 本仓库 | 持久仓库规则 | 稳定约定、命令、边界和 definition of done。 | 一次性 notes、历史或长机制更适合 docs。 |
| neat-freak | 本地已安装 specialist | 用户提供的本地 skill；不 vendoring，也不作为上游来源跟踪 | 知识同步 | 阶段收口、文档/记忆过期、给同事或其他 agent 的 clean handoff，或追踪型交付的 `knowledge_sync` 审查。 | 每个节点、小型 Lite 任务，或把 skill body 复制进 omyKit。 |
| Workflow Controller | 仓库本地机制 | [scripts/omykit-workflow.mjs](../../scripts/omykit-workflow.mjs) 和 [schemas](../../schemas/workflow-graph.schema.json) | 持久任务图状态 | 多节点、可续跑、容易 compact、被打回、需要并行或 Strict workflow 工作。 | Lite 工作、一次性任务，或替代 Codex 执行。 |
| [Superpowers](https://github.com/obra/Superpowers) | 已跟踪上游参考 | [obra/Superpowers](https://github.com/obra/Superpowers) (235,582★) | 执行纪律 | Brainstorming、planning、debugging、TDD、verification、review。 | 不作为 spec source 或项目事实来源。 |
| [Spec-Kit](https://github.com/github/spec-kit) | 官方上游参考 | [github/spec-kit](https://github.com/github/spec-kit) (114,714★) | 项目 constitution 和 strict SDD | 新的持久项目或重大产品基础。 | 小变更或已有轻量 spec system 的项目。 |
| [OpenSpec](https://github.com/Fission-AI/openspec) | 已跟踪上游参考 | [Fission-AI/openspec](https://github.com/Fission-AI/openspec) (55,971★) | 变更管理 | 标准 feature/bug/refactor proposal 和 archived deltas。 | 一次性临时交付物。 |
| [PM Skills](https://github.com/phuryn/pm-skills) | 高信号可选 PM 参考 | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) (20,661★) | PM 方法结构 | 用户明确要求 PM-specialist workflow，或交付物主要是 PRD、launch、pre-mortem、acceptance、product discovery。 | 默认工程变更、小修复，或 omyKit 内置 PM pattern 已足够时。 |
| [CodeGraph](https://github.com/colbymchenry/codegraph) | 已跟踪上游参考 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) (52,991★) | 代码地图和影响分析 | 现有代码结构、callers/callees、blast radius。 | 替代测试、源码确认或运行时检查。 |
| [Context7](https://github.com/upstash/context7) | 已跟踪上游参考 | [upstash/context7](https://github.com/upstash/context7) (57,852★) | 当前库文档 | 精确 API/framework 用法问题。 | 仓库里已有的一般项目事实。 |
| [Figma MCP](https://github.com/GLips/Figma-Context-MCP) | 已跟踪上游参考 | [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) (15,204★) | 设计源 | 现有设计文件、frames、components、tokens。 | 在无访问时猜设计。 |
| teach-impeccable | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | 持久设计上下文采集 | 一次性把稳定产品/设计上下文写入 AI 配置，供后续会话使用。 | 一次性视觉微调，或不属于稳定设计指导的项目事实。 |
| [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | 官方上游 skill 参考 | [anthropics/skills](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) (154,163★) | UI 创建和实现方向 | 构建或重设计具体 frontend screens、components、landing pages、portfolios 或 product UI。 | 纯研究、仅可访问性修复或后端/docs 工作。 |
| design-taste-frontend | 高信号视觉 specialist | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (49,367★) | 审美判断和反通用 UI | UI 输出显得通用、品牌表达或视觉判断会实质影响结果，或用户明确要求 Taste Skill。 | 仅可访问性、仅 metadata、后端、文档或机械代码修复。 |
| ui-ux-pro-max | 高信号视觉 specialist | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (95,324★) | 高阶 UI/UX 设计智能 | 复杂 redesign、多平台 UI、高风险产品 UI，或更强视觉 specialist 会改变结果时。 | 小修复、常规实现检查，或 `frontend-design` 加项目上下文已足够时。 |
| critique | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | UX 评审 | 视觉层级、信息架构、认知负担或用户体验评审。 | 实现或代码级修复。 |
| audit | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | 技术 UI 审计 | 可访问性、性能、主题、响应式和 UI 反模式审查。 | 创意方向或产品策略。 |
| adapt | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | 响应式适配 | 断点、流式布局、触控目标、设备/平台适配或跨上下文布局修复。 | 品牌方向、内容策略或非布局工作。 |
| clarify | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | UX 文案清晰度 | 让用户困惑的标签、错误、microcopy、空状态文案或说明。 | 视觉布局、架构或界面外文案。 |
| harden | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | 界面韧性 | 错误状态、i18n、文本溢出、边界情况和生产韧性。 | 纯视觉构思或后端加固。 |
| onboard | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | 引导和首次使用体验 | 首次使用流程、空状态、激活或 time-to-value 优化。 | 不涉及 onboarding 的成熟重复使用流程。 |
| extract | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | 设计系统提取 | 可复用组件、设计令牌和需要沉淀成系统的重复 UI patterns。 | 一次性页面或未经验证的视觉实验。 |
| optimize | 已安装狭窄 specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513★) | UI 性能 | 加载、渲染、动画、图片、包体积和感知速度。 | 非 UI 性能或视觉品味工作。 |
| motion-ai-kit | 已安装狭窄 specialist / 官方文档 | [Motion AI Kit](https://motion.dev/docs/ai-kit) / [motiondivision/motion](https://github.com/motiondivision/motion) (32,471★) | 动效系统 | 微交互、页面转场、onboarding animation、状态反馈或动效编排。 | 静态 UI 任务，或没有动效需求的性能敏感工作。 |
| [gsap-* skills](https://github.com/greensock/gsap-skills) | 官方上游 skill 参考 | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) (9,788★) | GSAP 实现 | 已选择或明确要求 GSAP 时，处理 timeline、ScrollTrigger、React/framework 集成、plugins、utils 或性能调优。 | 通用动效策略、CSS-only 动画，或未使用 GSAP 的项目。 |
| [awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) | 高信号生态参考 | [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) (19,896★) | shadcn/ui 生态发现 | 检查项目依赖和官方文档后，仍需要当前 shadcn 示例、组件选项或生态研究。 | 默认 UI 路由、复制目录内容，或替代项目原生组件决策。 |
| imagegen | OpenAI 第一方工具 | [OpenAI Images docs](https://platform.openai.com/docs/guides/images) | 位图资产生成/编辑 | Bitmap visuals、moodboards、slide images、thumbnails、hero images、cutouts。 | SVG/icon systems、确定性 UI code、已有 vector assets。 |
| Canva | 平台连接器 | 已安装 Canva connector/plugin；omyKit 不跟踪低信号 skill repo | 设计/deck 生产 | Canva-native presentations、social formats、brand kits。 | Code-native UI 或本地 editable files。 |
| presentations | OpenAI bundled 交付物工具 | OpenAI primary runtime；无公开 repo 跟踪 | Deck 创建/编辑 | PPTX/slide artifacts 和 rendered verification。 | App UI 或非 slide docs。 |
| [PPT Master](https://github.com/hugohe3/ppt-master) | 高信号候选 deck specialist | [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) (31,003★) | 原生可编辑 PPTX 工作流 | 只有 bundled `presentations`、Canva、项目模板或现有 PPT 工具无法满足原生可编辑 deck 生成/美化要求，且用户或目标项目确实受益于本地试验时才使用。 | 默认 deck 路由、复制其 skill body/templates/assets/branding，或没有 source、license、security、install 和真实输出证据就提交进 omyKit 主线。 |
| documents/PDF | OpenAI bundled 交付物工具 | OpenAI primary runtime；无公开 repo 跟踪 | 文档交付物 | DOCX/PDF 创建、编辑、redline、render checks。 | 纯 markdown 工作。 |
| spreadsheets | OpenAI bundled 交付物工具 | OpenAI primary runtime；无公开 repo 跟踪 | 数据表 | CSV/XLSX analysis、formulas、charts、exports。 | 自由文本 docs 或 code data models。 |
| Remotion/ffmpeg | 成熟基础设施 / 官方 GitHub | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) (50,849★) / [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) (61,333★) | 视频渲染 | 确定性视频 composition 和 export。 | 需要 desktop app 的纯手工编辑。 |
| RTK | 本地运行时包装 | 当前环境的本地命令包装 | 命令噪声控制 | 配置环境中的 shell commands。 | 文档例外要求绕过 RTK 的命令。 |
| 平台官方 CLI | 一方平台工具 / 官方文档 | 当前平台官方文档，例如小程序的 [微信开发者工具 CLI](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html) | 平台 build、preview、upload、simulator 或 validation 自动化 | 目标项目绑定到提供官方 CLI 或自动化 API 的平台，例如微信小程序、iOS、Android、Expo 或云厂商工具。 | 没有项目证据表明属于该平台、用非官方 wrapper 替代官方工具，或项目脚本已经覆盖该任务。 |
| Docker/Compose | 成熟基础设施 / 官方 GitHub | [docker/compose](https://github.com/docker/compose) (37,579★) / [moby/moby](https://github.com/moby/moby) (71,728★) | 运行时依赖 | Databases、caches、object storage、queues、local emulators。 | 服务已运行或 tests 使用 in-memory/testcontainers。 |
| Chrome Extension | 平台工具 / 官方 GitHub | [GoogleChrome/chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) (17,619★) | 真实 Chrome profile | 登录态网站、项目要求 Chrome、真实 profile visual checks。 | Localhost checks 可由 in-app browser/Playwright 完成。 |
| Playwright MCP | 成熟基础设施 / 官方 GitHub | [microsoft/playwright](https://github.com/microsoft/playwright) (91,381★) | 可重复浏览器自动化 | 结构化 web interactions 和 accessibility snapshots。 | Desktop apps 或 native mobile devtools。 |
| Computer Use | OpenAI 平台 / 官方示例 | [openai/openai-cua-sample-app](https://github.com/openai/openai-cua-sample-app) (1,740★) | 最后一级本地 GUI fallback | 只有官方/bundled connector、MCP/plugin、浏览器自动化、shell/API 路径、项目脚本和平台官方 CLI 都不可用或不足时，才用于 desktop design/video/deck apps、OS file pickers、export panels 或本地 GUI 工具。 | Code edits、shell tasks、已有专用工具的 browser tasks、未经确认的 risky UI actions，或任何已有官方/专用工具路径的任务。 |
| GitHub/Linear | 平台工具 / 官方 GitHub | [github/github-mcp-server](https://github.com/github/github-mcp-server) (30,870★) / [linear/linear](https://github.com/linear/linear) (1,454★) | 工作追踪 | Issues、PRs、review threads、handoff。 | 仓库本地已有的代码事实。 |
| Sentry/observability | 平台工具 / 官方 GitHub | [getsentry/sentry](https://github.com/getsentry/sentry) (44,146★) | 运行时失败 | 部署系统中的 logs、errors、traces。 | 本地 build 或 unit test failures。 |
| SonarQube / project quality gates | 成熟基础设施 / 项目已配置工具 | [SonarSource/sonarqube](https://github.com/SonarSource/sonarqube) (10,699★)；其他质量工具必须来自当前项目配置或官方产品文档 | 外部质量门禁 | 项目已配置时用于 static quality/security、PR review 或 visual regression。 | 替代本地验证，或默认新增外部门禁。 |
| Upstream Watch | 仓库本地机制 | [scripts/check-upstream-refs.mjs](../../scripts/check-upstream-refs.mjs) | 外部参考漂移检查 | 每月、release 前，或 workflow/spec/代码智能/文档/设计/动效/生态/上下文压缩路由依赖当前第三方行为时。 | 每个任务都运行，或把它当成自动复制上游内容的许可。 |

## 注册表可选模式

这些条目属于工具注册表，不是单独 route，也不默认要求额外 handoff。

只有当前 omyKit route 出现匹配信号时才应用：

- Product/PM 方法工作：在当前 brief/change workflow 中加入 discovery、PRD、launch、pre-mortem、acceptance 或 test-scenario 结构，默认使用 omyKit 自有模式；只有用户明确要求时才使用 `phuryn/pm-skills` 这类高信号外部 PM skill。
- 视觉前端工作：加入层级、品牌适配、布局韧性、响应式、基础可访问性和视觉 QA 检查；只有高信号视觉 specialist 会实质改变方向时才调用。
- shadcn/ui 生态工作：只有任务需要当前示例、组件选项或生态研究时，才查询当前项目依赖、官方/当前来源或 `awesome-shadcn-ui`；不要把目录内容持久化进 omyKit。
- Workflow controller 工作：只有持久任务图状态、结构化 handoff、打回循环、阻塞项或 compact 后恢复能实质提高可靠性时，才在当前 change route 内使用；不要创建单独 route，也不要强加给 Lite 任务。
- 知识同步：只在阶段收口、文档/记忆过期或追踪型交付 `knowledge_sync` 时使用 `neat-freak` 或等价定向审查；不要每个节点都运行。
- 上下文压缩工作：先用索引、大纲、聚焦命令和证据摘要缩小上下文；只有大型可取回输出仍超过有效预算时，才使用已明确安装、可信的本地压缩层。
- 平台特定项目：先发现并优先使用该平台官方 CLI 或自动化 API，再考虑 Computer Use。小程序项目如果可用微信开发者工具 CLI，就用它处理支持的 preview、upload、build checks；只有 CLI 覆盖不了的纯 GUI 步骤才降级到 Computer Use。
- 上游参考漂移：每月、release 前，或任务依赖当前外部 skill 行为时运行 `node ./scripts/check-upstream-refs.mjs`；吸收任何经验前先使用 `codex-workflow-evolution`，并优先使用已链接的精确官方来源，不用 fork 或镜像替代。
- Deck-specialist 缺口：先用 bundled `presentations`、Canva、项目模板或现有 deck 工具。只有这些能力不足，且 `hugohe3/ppt-master` 这类高信号 specialist 可能实质改善原生可编辑 PPTX 时，才记录 `capability_gaps`，先做 local-only 或 project-local 试验，再由 `codex-workflow-evolution` 根据证据决定是否提升。

只有 specialist skill 已安装、职责狭窄，并且能实质改善当前交付物时，才在当前 route 内直接使用它。只有答案依赖快速变化生态时才查询当前外部来源。不要把第三方 skill body、模板、资源列表、图片、badge 或 branding 复制进 omyKit。

当某个模式实质影响决策时，记录应用了哪个模式、哪个决策因此改变、是否调用了 specialist skill 或当前来源，以及是否复制了 licensed third-party content；如有，包含 license 和 attribution。

当节点实际使用 specialist skill，且同类能力存在多个合理候选时，在 handoff `skill_decisions` 记录：能力线、选用 skill、选择依据、未选候选、用户不满意时的 `fallback_policy`、用户反馈和结果。用户不满意时，先按 `fallback_policy.next_skill` 做定向重做或修改；不要把同类 skill 全部叠加。反复有效或反复失败的选择经验进入 delivery `evolution_candidates`，由 `codex-workflow-evolution` 决定是否调整通用路由。

## 能力缺口接入

当当前任务需要 omyKit 尚未覆盖的 skill 或工具时，不要静默装进通用套件，也不要默认直接推主线。

采用以下路径：

1. 确认缺口：说明当前官方、bundled、项目原生或已安装工具不能满足哪个交付质量。
2. 选择最窄试验：`local_only` 表示用户本地试验，`project_local` 表示目标项目本地 vendoring/config，`omykit_candidate_branch` 表示通用 kit 可能需要新 route，`main_after_review` 只在审查批准后使用，`not_integrated` 表示候选被拒。
3. 在相关 handoff 记录 `capability_gaps`，包含来源、license、stars 或其他可信信号、安装/运行证据、试验计划和下一步。
4. 不要把第三方代码、skill body、模板、截图、badge、图片、赞助商文案或 branding 放进 omyKit，除非 license 和 attribution 审查明确允许 vendoring。
5. 如果本地/项目试验在多个 artifact class 或项目类型里反复有效，再创建 `evolution_candidate`，交给 `codex-workflow-evolution` 审查。
6. omyKit 规则变更走 branch/PR；只有 owner 明确批准的维护工作，在验证后才直接进入主线。

以 PPT Master 为例：它上游活跃、MIT、非 fork、信号较强，因此有资格进入“记录后的本地试验”，但不是自动默认依赖。

## 同类能力选择

默认不要叠加调用同类 skill。先为下一步决策选择一个主能力；只有存在独立缺口时，才补一个更窄的次能力。

| 能力线 | 优先选择 | 仅在这些情况补充 |
| --- | --- | --- |
| Product/PM 方法 | omyKit 内置 PM pattern。 | 只有用户明确要求外部 PM skill，且交付物主要是 PRD、discovery、launch、pre-mortem 或 acceptance design 时才使用 `phuryn/pm-skills`。 |
| UI 创建 | `frontend-design`。 | 只有确有独立缺口时，才补 `design-taste-frontend` 做审美/反通用判断，或补 `ui-ux-pro-max` 做高风险复杂 UI。 |
| UX 评审/研究 | `critique`。 | 结果必须落成具体 UI 时才补 `frontend-design`；需要技术检查时才补 `audit`。 |
| 视觉质量 | 创建用 `frontend-design`，评审用 `critique`。 | 只有新颖性、品牌表达或高阶视觉判断对任务有实质价值时，才补 `design-taste-frontend` 或 `ui-ux-pro-max`。 |
| 设计上下文采集 | `teach-impeccable`。 | 只在稳定设计指导需要跨会话保留时使用；不要用于一次性页面微调。 |
| 技术 UI 审计 | `audit`。 | 已确认具体问题时，使用项目原生定向修复和验证。 |
| UI 实现 QA | 项目原生 browser checks 加 `audit`。 | 视觉方向改变时才补 `frontend-design`。 |
| 响应式适配 | `adapt`。 | 文本溢出/i18n 边界情况明显时补 `harden`。 |
| 可访问性加固 | `audit` 加项目原生 browser/accessibility checks。 | 做直接代码修复和验证；默认不路由到低星 accessibility specialist skill。 |
| UX 文案 | `clarify`。 | 文案属于首次使用激活时才补 `onboard`。 |
| 界面韧性 | `harden`。 | 设备特定布局问题时才补 `adapt`。 |
| Onboarding | `onboard`。 | 需要 microcopy 时补 `clarify`，需要有意义引导动效时补 `motion-ai-kit`。 |
| 设计系统提取 | `extract`。 | 提取后的 pattern 必须实现时才补 `frontend-design`。 |
| UI 性能 | `optimize`。 | 确认是动画性能问题时，才补 browser profiling、`motion-ai-kit` 或匹配的 `gsap-*`。 |
| Metadata 和预览 | 项目原生 metadata checks 加 browser verification。 | 页面级 UI 质量也在范围内时才补 `audit`。 |
| 图标系统 | 现有项目图标库、设计系统或当前官方来源。 | 图标决策影响整体布局时才补 UI 创建或审计 skill。 |
| 动效 | `motion-ai-kit`。 | 已选择或明确要求 GSAP 时才补匹配的 `gsap-*`。 |
| GSAP 实现 | 按具体 API 或集成问题选择匹配的 `gsap-*` skill。 | 只有动效编排目标不清楚时才补 `motion-ai-kit`；确认性能风险时使用 browser profiling 和定向代码修复。 |
| shadcn/ui 资源 | 先看项目依赖和官方文档。 | 只有需要当前生态发现时才补 `awesome-shadcn-ui`；不要把社区目录内容持久化进 omyKit。 |
| Deck 交付物 | Bundled `presentations`、Canva、项目模板和现有 PPT 工具。 | 只有原生可编辑 PPTX 生成或美化是未满足质量线时，才本地试验 `ppt-master`；是否进入 omyKit 必须经过 `capability_gaps` 和进化审查。 |
| 上下文压缩 | 先用 `codex-context-budget`：避免读取、索引、聚焦、紧凑输出，再摘要。 | 只有大型重复内容仍有价值、可取回原文，且路径是本地可信时，才使用可选本地压缩。 |
| 持久 workflow 状态 | 当前 `codex-change-workflow` 加 Workflow Controller。 | 只用于多节点、可续跑、容易 compact、被打回、需要并行或 Strict 工作；不要把它当单独 route。 |
| Workflow 进化 | `codex-workflow-evolution`。 | 只有证据表明通用 kit 应改变时，才补相关 owner skill。 |
| 知识同步 | 已安装时用 `neat-freak`，否则做定向 docs/AGENTS 审查。 | 只在阶段收口、文档/记忆过期或追踪型交付 `knowledge_sync` 使用；不要把它当成规划或编码 skill。 |

## 版本管理准备度

当目标项目需要可追踪历史、release notes、rollback、migration safety、dependency rollback 或 project-local customization 时，使用 `codex-version-readiness`。这是治理检查，不是要求每个项目都增加重型发布工具。

## 默认选择规则

使用能回答下一个问题的最窄工具。优先使用项目原生和官方/专用工具，再考虑通用 fallback；Computer Use 是本地 GUI 工作在没有更好支持面时的最后选项。如果某个工具会增加大量上下文但不改变下一步决策，就跳过它。选择同类 skill 时按任务信号、交付物类型、风险、项目上下文、来源可信度和历史反馈综合判断；stars 和官方来源是准入/可信信号，不是自动优先级。
