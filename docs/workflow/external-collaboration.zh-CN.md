# 外部 Skill 协作

语言：[English](external-collaboration.md) | [简体中文](external-collaboration.zh-CN.md)

把外部 skills 和资源目录当作协作者，而不是要合并进 omyKit 的内容。omyKit 保持路由和治理层定位。

## 原则

- 路由到能改善交付物的最窄 specialist skill。
- 在范围、风险、交付物类型或用户意图变化前保持当前路由稳定。
- 不要把第三方 skill body、模板、资源列表、图片、badge 或 branding 复制进 omyKit。
- 如果未来 vendoring 第三方内容，保留上游 license、copyright notice 和 attribution 要求。
- 优先使用 omyKit 原创措辞，描述何时协作、捕获什么证据、避免什么。

## 参考角色

| Reference | 用于 | 协作方式 | 避免 |
| --- | --- | --- | --- |
| `phuryn/pm-skills` | 产品发现、策略、PRD、发布规划、pre-mortem、测试场景、PM shipping checks。 | 当任务主要是 PM 方法时，路由给 PM-focused skills，或让用户安装/使用它们。 | 把大型 PM 框架折叠进 omyKit，或复制 PRD/launch 模板。 |
| `Leonxlnx/taste-skill` | 视觉重要的 frontend、landing page、portfolio、redesign 和设计质量审查。 | omyKit 识别项目类型和风险后，把重设计判断的 frontend 工作路由给 design taste skills。 | 把详细风格规则嵌入 omyKit，或强行把视觉设计规则套到运营 dashboard 和非视觉任务上。 |
| `birobirobiro/awesome-shadcn-ui` | 发现 shadcn/ui 生态资源、示例、组件库和有贡献治理的目录。 | 当 shadcn 项目需要示例或生态选项时，把它作为外部资源索引使用。 | 把其目录复制进 omyKit，或把快速变化的资源列表当作稳定 workflow doctrine。 |

## 已审阅来源

- [phuryn/pm-skills](https://github.com/phuryn/pm-skills)
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
- [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui)

这些项目被视为外部参考。除非未来明确 vendoring 许可内容并保留必要声明，否则 omyKit 内容应保持原创。

## 路由指导

- Product/PM request：omyKit 保持 intake，再把产品方法工作交给 PM-specific skills。
- Frontend visual-quality request：omyKit 分类范围和验证，再调用适合的 design/frontend skill。
- shadcn resource request：omyKit 识别需求，再查询当前外部来源或项目依赖列表。
- Mixed product + code work：拆成多个 track。PM skills 负责意图，omyKit 负责实现治理，delivery gates 负责证据。

## 需要捕获的证据

当外部 skill 或目录实质影响工作时，记录：

- 哪个外部项目或 skill 影响了决策
- 它是作为已安装 skill、web/reference source，还是一般模式启发使用
- 哪个决策因此改变
- 是否复制了 licensed content；如有，包含 license 和 attribution

不要把一次性浏览记录写入 `AGENTS.md`。稳定协作规则应放在这里或项目本地 workflow docs。
