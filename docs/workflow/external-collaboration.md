# External Skill Collaboration

Use external skills and resource catalogs as collaborators, not as content to merge into omyKit. omyKit remains the routing and governance layer.

## Principles

- Route to the narrowest specialist skill that can improve the deliverable.
- Keep the selected route stable until scope, risk, artifact type, or user intent changes.
- Do not copy third-party skill bodies, templates, resource lists, images, badges, or branding into omyKit.
- If a future change vendors third-party content, preserve the upstream license, copyright notice, and attribution requirements.
- Prefer original omyKit wording that describes when to collaborate, what evidence to capture, and what to avoid.

## Reference Roles

| Reference | Use for | Collaborate by | Avoid |
| --- | --- | --- | --- |
| `phuryn/pm-skills` | Product discovery, strategy, PRDs, launch planning, pre-mortems, test scenarios, PM shipping checks. | Route product-management work to PM-focused skills or ask the user to install/use them when the task is primarily PM methodology. | Folding large PM frameworks into omyKit or copying PRD/launch templates. |
| `Leonxlnx/taste-skill` | Visually important frontend, landing pages, portfolios, redesigns, and design-quality audits. | Route design-heavy frontend work to design taste skills after omyKit identifies the project type and risk. | Embedding detailed style rules in omyKit or forcing visual-design rules onto operational dashboards and non-visual tasks. |
| `birobirobiro/awesome-shadcn-ui` | Discovering shadcn/ui ecosystem resources, examples, component libraries, and contribution-governed catalogs. | Use as an external resource index when a shadcn-specific project needs examples or ecosystem options. | Copying its catalog into omyKit or treating a fast-changing resource list as stable workflow doctrine. |

## Sources Reviewed

- [phuryn/pm-skills](https://github.com/phuryn/pm-skills)
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
- [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui)

These projects are treated as external references. Keep omyKit content original unless a future change deliberately vendors licensed material and preserves the required notices.

## Routing Guidance

- Product/PM request: keep omyKit as intake, then hand off to PM-specific skills for the product-method work.
- Frontend visual-quality request: use omyKit to classify scope and verification, then invoke an appropriate design/frontend skill.
- shadcn resource request: use omyKit to identify the need, then consult current external sources or the project dependency list.
- Mixed product + code work: split into tracks. Use PM skills for intent, omyKit for implementation governance, and delivery gates for evidence.

## Evidence To Capture

When an external skill or catalog materially affects work, record:

- which external project or skill informed the decision
- whether it was used as installed skill, web/reference source, or general pattern inspiration
- what decision changed because of it
- whether any licensed content was copied; if yes, include license and attribution

Do not record one-off browsing notes in `AGENTS.md`. Stable collaboration rules belong here or in project-local workflow docs.
