# Tool Registry

This registry describes how Codex should combine tools without loading or using all of them by default.

| Tool | Role | Use when | Avoid when |
| --- | --- | --- | --- |
| Codex | Control plane | Always. It routes, plans, edits, verifies, and summarizes. | Do not bypass with separate uncoordinated tools. |
| AGENTS.md | Durable repo rules | Stable conventions, commands, boundaries, and definition of done. | One-off notes, history, or long mechanisms better suited to docs. |
| Superpowers | Execution discipline | Brainstorming, planning, debugging, TDD, verification, review. | As a spec source or project fact source. |
| Spec-Kit | Project constitution and strict SDD | New durable projects or major product foundations. | Small changes or existing projects with lighter spec systems. |
| OpenSpec | Change management | Standard feature/bug/refactor proposals and archived deltas. | One-off throwaway artifacts. |
| CodeGraph | Code map and impact | Existing code structure, callers/callees, blast radius. | Replacing tests, source confirmation, or runtime checks. |
| Context7 | Current library docs | Exact API/framework usage questions. | General project facts already in the repo. |
| Cowart | Visual canvas | Product flows, sketches, screenshots, spatial thinking, design references. | Replacing specs or implementation files. |
| Figma MCP | Design source | Existing design files, frames, components, tokens. | Guessing design without access. |
| frontend-design / ui-ux-pro-max / design-taste-frontend | UI design skill layer | Visually important frontend, redesign, landing page, portfolio, product UI, or design critique. | Backend/docs work, or screens where design judgment will not change the deliverable. |
| imagegen | Raster asset generation/editing | Bitmap visuals, moodboards, slide images, thumbnails, hero images, cutouts. | SVG/icon systems, deterministic UI code, existing vector assets. |
| Canva | Design/deck production | Canva-native presentations, social formats, brand kits. | Code-native UI or local editable files. |
| presentations | Deck creation/editing | PPTX/slide artifacts and rendered verification. | App UI or non-slide docs. |
| documents/PDF | Document artifacts | DOCX/PDF creation, editing, redline, render checks. | Raw markdown-only work. |
| spreadsheets | Data sheets | CSV/XLSX analysis, formulas, charts, exports. | Free-form docs or code data models. |
| Remotion/ffmpeg | Video rendering | Deterministic video composition and export. | Manual-only editing when a desktop app is required. |
| RTK | Command noise control | Shell commands in configured environments. | Commands that must bypass RTK by documented exception. |
| Docker/Compose | Runtime dependencies | Databases, caches, object storage, queues, local emulators. | When services already run or tests use in-memory/testcontainers. |
| Chrome Extension | Real Chrome profile | Signed-in websites, project policy requiring Chrome, real-profile visual checks. | Localhost checks that in-app browser/Playwright can handle. |
| Playwright MCP | Repeatable browser automation | Structured web interactions and accessibility snapshots. | Desktop apps or native mobile devtools. |
| Computer Use | Local GUI fallback | WeChat DevTools, desktop design/video/deck apps, OS file pickers, export panels. | Code edits, shell tasks, browser tasks with dedicated tools, risky UI actions without confirmation. |
| GitHub/Linear | Work tracking | Issues, PRs, review threads, handoff. | Local code facts available in repository. |
| Sentry/observability | Runtime failures | Logs, errors, traces from deployed systems. | Local build or unit test failures. |
| CodeRabbit/Sonar/Chromatic | External quality gates | PR review, static quality/security, visual regression. | Replacing local verification. |
| [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | PM method pattern source | Product discovery, strategy framing, PRD, launch planning, pre-mortem, acceptance, or test-scenario structure. | Copying templates or adding heavy PM ceremony to small implementation tasks. |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Design taste pattern source | Stricter visual judgment, anti-generic UI critique, or frontend design quality calibration. | Copying skill text or forcing marketing-page taste onto operational dashboards. |
| [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) | shadcn/ui ecosystem source | Current shadcn resources, component examples, library options, or ecosystem discovery. | Copying fast-changing catalogs into omyKit or treating a resource list as stable doctrine. |

## Integrated Registry Patterns

These entries are part of the tool registry. They do not create a separate route, and they do not require a separate handoff by default.

Apply them only when the active omyKit route sees the matching signal:

- Product or PM-method work: add discovery, PRD, launch, pre-mortem, acceptance, or test-scenario structure inside the active brief/change workflow.
- Visual frontend work: add checks for hierarchy, brand fit, layout resilience, responsive behavior, accessibility basics, and visual QA.
- shadcn/ui ecosystem work: consult current project dependencies or current sources only when examples, component options, or ecosystem research are needed.

Use an installed specialist skill directly inside the current route only when it is available and materially improves the deliverable. Query current external sources only when the answer depends on a fast-changing ecosystem. Do not copy third-party skill bodies, templates, resource lists, images, badges, or branding into omyKit.

When a pattern materially changes a decision, record which pattern was applied, what decision changed, whether a specialist skill or current source was used, and whether any licensed third-party content was copied with license and attribution.

## Versioning Readiness

Use `codex-version-readiness` when a target project needs traceable history, release notes, rollback, migration safety, dependency rollback, or project-local customization. This is a governance check, not a requirement to add heavyweight release tooling to every project.

## Default Selection Rule

Use the narrowest tool that can answer the next question. If a tool would add broad context but not change the next decision, skip it.
