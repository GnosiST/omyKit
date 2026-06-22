# Capability Patterns

Languages: [English](capability-patterns.md) | [简体中文](capability-patterns.zh-CN.md)

Use these patterns inside omyKit's normal routing. They are not a separate workflow layer. They help Codex decide when to apply PM structure, design judgment, or ecosystem resource discovery without copying third-party content into the kit.

## Principles

- Fold useful patterns into the current omyKit route instead of creating a separate handoff by default.
- Keep `omykit`, `codex-project-router`, and `codex-change-workflow` responsible for scope, risk, execution, and evidence.
- Use an installed specialist skill only when it is available and materially improves the current deliverable.
- Use current external sources only when the answer depends on a fast-changing ecosystem.
- Do not copy third-party skill bodies, templates, resource lists, images, badges, or branding into omyKit.
- If future work vendors third-party content, preserve upstream license, copyright notice, and attribution requirements.

## Integrated Patterns

| Signal | Apply inside omyKit by | Use specialist/source only when | Avoid |
| --- | --- | --- | --- |
| Product/PM method work | Add discovery, PRD, launch, pre-mortem, acceptance, or test-scenario structure to the active brief/change workflow. | A PM-specific installed skill is available and the task is primarily product-method work. | Copying PM templates or forcing heavy PM ceremony onto small implementation tasks. |
| Visual frontend quality | Add design-quality checks for hierarchy, brand fit, layout resilience, responsive behavior, accessibility basics, and visual QA. | A design/taste skill is installed and the deliverable depends on visual judgment. | Embedding fixed style rules into omyKit or applying marketing-page taste rules to operational dashboards. |
| shadcn/ui ecosystem discovery | Treat shadcn as a resource-discovery signal and consult current project dependencies or current sources. | The task needs current examples, component options, or ecosystem research. | Copying fast-changing catalogs into omyKit or treating a resource list as stable doctrine. |

## Sources Reviewed

- [phuryn/pm-skills](https://github.com/phuryn/pm-skills)
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
- [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui)

These projects informed routing patterns only. Keep omyKit wording original unless a future change deliberately vendors licensed material and preserves the required notices.

## Evidence To Capture

When a pattern materially affects work, record:

- which pattern was applied
- what decision changed because of it
- whether a specialist skill or current external source was used
- whether any licensed third-party content was copied; if yes, include license and attribution

Do not record one-off browsing notes in `AGENTS.md`. Stable pattern rules belong here or in project-local workflow docs.
