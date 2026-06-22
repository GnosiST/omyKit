# 按需能力增强

语言：[English](capability-patterns.md) | [简体中文](capability-patterns.zh-CN.md)

这些模式应直接用于 omyKit 的正常路由，不是单独的跳转层。它们帮助 Codex 判断什么时候在当前 workflow 中加入 PM 结构、设计判断或生态资源发现，同时不把第三方内容复制进套件。

## 原则

- 默认把有用模式融入当前 omyKit route，而不是创建单独 handoff。
- `omykit`、`codex-project-router` 和 `codex-change-workflow` 继续负责范围、风险、执行和证据。
- 只有 specialist skill 已安装且能实质改善当前交付物时才调用它。
- 只有答案依赖快速变化生态时才查询当前外部来源。
- 不要把第三方 skill body、模板、资源列表、图片、badge 或 branding 复制进 omyKit。
- 如果未来 vendoring 第三方内容，保留上游 license、copyright notice 和 attribution 要求。

## 已融入的模式

| 信号 | 在 omyKit 内部如何应用 | 什么时候才使用 specialist/source | 避免 |
| --- | --- | --- | --- |
| Product/PM 方法工作 | 在当前 brief/change workflow 中加入 discovery、PRD、launch、pre-mortem、acceptance 或 test-scenario 结构。 | 已安装 PM-specific skill，且任务主要是产品方法工作。 | 复制 PM 模板，或把小实现任务强行套进重型 PM 流程。 |
| 视觉前端质量 | 加入层级、品牌适配、布局韧性、响应式、基础可访问性和视觉 QA 检查。 | 已安装 design/taste skill，且交付物依赖视觉判断。 | 把固定风格规则嵌进 omyKit，或把营销页审美强行套到运营 dashboard。 |
| shadcn/ui 生态发现 | 把 shadcn 当作资源发现信号，查询当前项目依赖或当前来源。 | 任务需要当前示例、组件选项或生态研究。 | 把快速变化的目录复制进 omyKit，或把资源列表当成稳定 doctrine。 |

## 已审阅来源

- [phuryn/pm-skills](https://github.com/phuryn/pm-skills)
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
- [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui)

这些项目只用于启发路由模式。除非未来明确 vendoring 许可内容并保留必要声明，否则 omyKit 内容应保持原创。

## 需要捕获的证据

当某个模式实质影响工作时，记录：

- 应用了哪个模式
- 哪个决策因此改变
- 是否调用了 specialist skill 或当前外部来源
- 是否复制了 licensed third-party content；如有，包含 license 和 attribution

不要把一次性浏览记录写入 `AGENTS.md`。稳定模式规则应放在这里或项目本地 workflow docs。
