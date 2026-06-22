# 工具注册表

语言：[English](tool-registry.md) | [简体中文](tool-registry.zh-CN.md)

本注册表说明 Codex 如何组合工具，同时避免默认加载或使用所有工具。

带链接的工具名表示外部上游参考来源，应记录到 `upstream-sources.json` 里跟踪。普通工具名表示本地 skill、平台能力或没有单一稳定上游仓库的工具类别。如果某个本地 skill 基于官方上游 skill，应链接官方来源，并把它作为参考信号跟踪。

| Tool | 角色 | 使用场景 | 避免场景 |
| --- | --- | --- | --- |
| Codex | 控制面 | 始终使用。它负责路由、规划、编辑、验证和总结。 | 不要用不协调的独立工具绕过它。 |
| AGENTS.md | 持久仓库规则 | 稳定约定、命令、边界和 definition of done。 | 一次性 notes、历史或长机制更适合 docs。 |
| Superpowers | 执行纪律 | Brainstorming、planning、debugging、TDD、verification、review。 | 不作为 spec source 或项目事实来源。 |
| Spec-Kit | 项目 constitution 和 strict SDD | 新的持久项目或重大产品基础。 | 小变更或已有轻量 spec system 的项目。 |
| OpenSpec | 变更管理 | 标准 feature/bug/refactor proposal 和 archived deltas。 | 一次性临时交付物。 |
| CodeGraph | 代码地图和影响分析 | 现有代码结构、callers/callees、blast radius。 | 替代测试、源码确认或运行时检查。 |
| Context7 | 当前库文档 | 精确 API/framework 用法问题。 | 仓库里已有的一般项目事实。 |
| [Headroom](https://github.com/headroomlabs-ai/headroom) | 可选上下文压缩参考或已安装压缩层 | 原生缩小范围仍不够时，用于大型重复 tool outputs、logs、RAG chunks、files、diffs、conversation handoffs 或输出整形。 | 默认依赖、每个任务、精确源码编辑、安全/法律/隐私证据、引用出处，或没有本地可取回原文的非可信数据路径。 |
| Cowart | 视觉画布 | 产品流程、草图、截图、空间思考、设计参考。 | 替代 specs 或实现文件。 |
| Figma MCP | 设计源 | 现有设计文件、frames、components、tokens。 | 在无访问时猜设计。 |
| teach-impeccable | 持久设计上下文采集 | 一次性把稳定产品/设计上下文写入 AI 配置，供后续会话使用。 | 一次性视觉微调，或不属于稳定设计指导的项目事实。 |
| [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | UI 创建和实现方向 | 构建或重设计具体 frontend screens、components、landing pages、portfolios 或 product UI。 | 纯研究、仅可访问性修复或后端/docs 工作。 |
| ui-ux-pro-max | UX/设计智能和模式比较 | 评估 flows、information architecture、interaction patterns、设计备选方案或设计理由。 | 已有足够设计方向的直接实现。 |
| design-taste-frontend | 视觉品味护栏 | 高风险视觉打磨、反通用 UI 评审、层级、构图、品牌适配或 frontend 品味校准。 | 不需要新颖或表达性风格的常规高密度运营页面。 |
| critique | UX 评审 | 视觉层级、信息架构、认知负担或用户体验评审。 | 实现或代码级修复。 |
| audit | 技术 UI 审计 | 可访问性、性能、主题、响应式和 UI 反模式审查。 | 创意方向或产品策略。 |
| baseline-ui | 基线 UI 检查 | Tailwind UI scale、typography、animation duration、component accessibility 或常见 UI 反模式检查。 | 大范围创意方向或产品策略。 |
| adapt | 响应式适配 | 断点、流式布局、触控目标、设备/平台适配或跨上下文布局修复。 | 品牌方向、内容策略或非布局工作。 |
| fixing-accessibility | 可访问性修复 | ARIA、键盘导航、焦点管理、对比度、表单、对话框或 WCAG-oriented 修复。 | 通用视觉打磨或布局探索。 |
| clarify | UX 文案清晰度 | 让用户困惑的标签、错误、microcopy、空状态文案或说明。 | 视觉布局、架构或界面外文案。 |
| harden | 界面韧性 | 错误状态、i18n、文本溢出、边界情况和生产韧性。 | 纯视觉构思或后端加固。 |
| onboard | 引导和首次使用体验 | 首次使用流程、空状态、激活或 time-to-value 优化。 | 不涉及 onboarding 的成熟重复使用流程。 |
| extract | 设计系统提取 | 可复用组件、设计令牌和需要沉淀成系统的重复 UI patterns。 | 一次性页面或未经验证的视觉实验。 |
| optimize | UI 性能 | 加载、渲染、动画、图片、包体积和感知速度。 | 非 UI 性能或视觉品味工作。 |
| fixing-metadata | HTML metadata 和预览 | title、description、canonical、Open Graph、Twitter cards、favicon、JSON-LD、robots 或分享预览。 | 应用内文案、布局或后端 SEO 策略。 |
| better-icons | 图标策略 | 图标语义、风格一致性、库选择、fallback 策略或图标密集工具栏。 | 整屏重设计或非图标 UI 工作。 |
| motion-ai-kit | 动效系统 | 微交互、页面转场、onboarding animation、状态反馈或动效编排。 | 静态 UI 任务，或没有动效需求的性能敏感工作。 |
| fixing-motion-performance | 动效性能修复 | 布局抖动、合成层安全动画、滚动联动性能、模糊成本或动画流畅度问题。 | 动效概念设计或静态 UI 工作。 |
| [gsap-* skills](https://github.com/greensock/gsap-skills) | GSAP 实现 | 已选择或明确要求 GSAP 时，处理 timeline、ScrollTrigger、React/framework 集成、plugins、utils 或性能调优。 | 通用动效策略、CSS-only 动画，或未使用 GSAP 的项目。 |
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
| Upstream Watch | 外部参考漂移检查 | 每月、release 前，或 PM/设计/动效/生态/上下文压缩路由依赖当前第三方行为时。 | 每个任务都运行，或把它当成自动复制上游内容的许可。 |
| [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | PM 方法参考来源 | 产品发现、策略框架、PRD、发布规划、pre-mortem、验收或测试场景结构。 | 复制模板，或把小实现任务套进重型 PM 流程。 |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 设计品味参考来源 | 更严格的视觉判断、反通用 UI 评审或 frontend 设计质量校准。 | 复制 skill 文本，或把营销页审美强行套到运营 dashboard。 |
| [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) | shadcn/ui 生态参考来源 | 当前 shadcn 资源、组件示例、库选项或生态发现。 | 把快速变化的目录复制进 omyKit，或把资源列表当成稳定 doctrine。 |

## 注册表可选模式

这些条目属于工具注册表，不是单独 route，也不默认要求额外 handoff。

只有当前 omyKit route 出现匹配信号时才应用：

- Product/PM 方法工作：在当前 brief/change workflow 中加入 discovery、PRD、launch、pre-mortem、acceptance 或 test-scenario 结构。
- 视觉前端工作：加入层级、品牌适配、布局韧性、响应式、基础可访问性和视觉 QA 检查。
- shadcn/ui 生态工作：只有任务需要当前示例、组件选项或生态研究时，才查询当前项目依赖或当前来源。
- 上下文压缩工作：先用索引、大纲、聚焦命令和证据摘要缩小上下文；只有大型可取回输出仍超过有效预算时，才使用 Headroom 类压缩。
- 上游参考漂移：每月、release 前，或任务依赖当前外部 skill 行为时运行 `node ./scripts/check-upstream-refs.mjs`；吸收任何经验前先使用 `codex-workflow-evolution`。

只有 specialist skill 已安装且能实质改善当前交付物时，才在当前 route 内直接使用它。只有答案依赖快速变化生态时才查询当前外部来源。不要把第三方 skill body、模板、资源列表、图片、badge 或 branding 复制进 omyKit。

当某个模式实质影响决策时，记录应用了哪个模式、哪个决策因此改变、是否调用了 specialist skill 或当前来源，以及是否复制了 licensed third-party content；如有，包含 license 和 attribution。

## 同类能力选择

默认不要叠加调用同类 skill。先为下一步决策选择一个主能力；只有存在独立缺口时，才补一个更窄的次能力。

| 能力线 | 优先选择 | 仅在这些情况补充 |
| --- | --- | --- |
| Product/PM 方法 | omyKit 内置 PM pattern；`phuryn/pm-skills` 只作为参考信号。 | 交付物主要是 PRD、discovery、launch、pre-mortem 或 acceptance design。 |
| UI 创建 | `frontend-design`。 | 高风险视觉打磨时补 `design-taste-frontend`，实现检查时补 `baseline-ui`。 |
| UX 评审/研究 | `ui-ux-pro-max`。 | 结果必须落成具体 UI 时才补 `frontend-design`。 |
| 视觉品味 | `design-taste-frontend`；`Leonxlnx/taste-skill` 只作为参考信号。 | 品味评审需要落地实现时补 `frontend-design`。 |
| 设计上下文采集 | `teach-impeccable`。 | 只在稳定设计指导需要跨会话保留时使用；不要用于一次性页面微调。 |
| UX 评审 | `critique`。 | 需要技术检查时才补 `audit`。 |
| 技术 UI 审计 | `audit`。 | 已确认具体问题时才补 focused fixing skill。 |
| UI 实现基线 | `baseline-ui`。 | 需要覆盖更宽的可访问性、性能、主题或响应式问题时才补 `audit`。 |
| 响应式适配 | `adapt`。 | 文本溢出/i18n 边界情况明显时补 `harden`。 |
| 可访问性加固 | `fixing-accessibility`。 | 需要更宽的组件基线检查时补 `baseline-ui`。 |
| UX 文案 | `clarify`。 | 文案属于首次使用激活时才补 `onboard`。 |
| 界面韧性 | `harden`。 | 设备特定布局问题时才补 `adapt`。 |
| Onboarding | `onboard`。 | 需要 microcopy 时补 `clarify`，需要有意义引导动效时补 `motion-ai-kit`。 |
| 设计系统提取 | `extract`。 | 提取后的 pattern 必须实现时才补 `frontend-design`。 |
| UI 性能 | `optimize`。 | 动画性能问题才补 `fixing-motion-performance`。 |
| Metadata 和预览 | `fixing-metadata`。 | 需要确认渲染页面输出时才补 browser checks。 |
| 图标系统 | `better-icons`。 | 图标决策影响整体布局时才补 UI 创建或审计 skill。 |
| 动效 | `motion-ai-kit`。 | 动画成本或流畅度有风险时才补 `fixing-motion-performance`。 |
| GSAP 实现 | 按具体 API 或集成问题选择匹配的 `gsap-*` skill。 | 只有动效编排目标不清楚时才补 `motion-ai-kit`；只有确认性能风险时才补 `fixing-motion-performance`。 |
| shadcn/ui 资源 | 先看项目依赖和当前官方/source material；`birobirobiro/awesome-shadcn-ui` 只作为生态参考。 | 任务需要当前示例、组件选项或 library discovery。 |
| 上下文压缩 | 先用 `codex-context-budget`：避免读取、索引、聚焦、紧凑输出，再摘要。 | 只有大型重复内容仍有价值、可取回原文，且路径是本地或明确可信时，才使用 Headroom。 |
| Workflow 进化 | `codex-workflow-evolution`。 | 只有证据表明通用 kit 应改变时，才补相关 owner skill。 |

## 版本管理准备度

当目标项目需要可追踪历史、release notes、rollback、migration safety、dependency rollback 或 project-local customization 时，使用 `codex-version-readiness`。这是治理检查，不是要求每个项目都增加重型发布工具。

## 默认选择规则

使用能回答下一个问题的最窄工具。如果某个工具会增加大量上下文但不改变下一步决策，就跳过它。
