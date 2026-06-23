# Tool Registry

Language: [English](tool-registry.md) | [简体中文](tool-registry.zh-CN.md)

This registry describes how Codex should combine tools without loading or using all of them by default.

The `Source mark` and `Verified source` columns identify whether an entry is an omyKit core item, installed local skill, official upstream skill, platform tool, OpenAI bundled tool, mature infrastructure reference, or repo-local mechanism. GitHub-backed sources are tracked in `upstream-sources.json` only when they are material to routing or source integrity. Do not replace a verified source with a similarly named fork, marketplace mirror, or repackaged skill unless the user explicitly asks for that alternate source.

The default registry is intentionally conservative. Admit only omyKit-owned routes, first-party platform/tool sources, official upstream skills, mature delivery infrastructure, or high-signal specialist skills with clear non-overlapping value. For visual/UI community skills, the default admission bar is 10k+ GitHub stars plus non-fork, active, source-checked status; lower-star local installs may remain available in the user's Codex environment but should not be listed here or used by omyKit routing. Stars are supporting evidence, not admission proof. Community PM, taste, catalog, or meta-UX skills are optional references, not default routes, unless the user explicitly requests them for the task.

| Tool | Source mark | Verified source | Role | Use when | Avoid when |
| --- | --- | --- | --- | --- | --- |
| Codex | Core control plane | [openai/codex](https://github.com/openai/codex) (92,647 stars) | Control plane | Always. It routes, plans, edits, verifies, and summarizes. | Do not bypass with separate uncoordinated tools. |
| AGENTS.md | Repo-local rule file | This repository | Durable repo rules | Stable conventions, commands, boundaries, and definition of done. | One-off notes, history, or long mechanisms better suited to docs. |
| Workflow Controller | Repo-local mechanism | [scripts/omykit-workflow.mjs](../../scripts/omykit-workflow.mjs) plus [schemas](../../schemas/workflow-graph.schema.json) | Durable task graph state | Multi-node, resumable, compact-prone, rejected, parallel, or Strict workflow work. | Lite work, one-off tasks, or as a replacement for Codex execution. |
| [Superpowers](https://github.com/obra/Superpowers) | Tracked upstream reference | [obra/Superpowers](https://github.com/obra/Superpowers) (235,582 stars) | Execution discipline | Brainstorming, planning, debugging, TDD, verification, review. | As a spec source or project fact source. |
| [Spec-Kit](https://github.com/github/spec-kit) | Official upstream reference | [github/spec-kit](https://github.com/github/spec-kit) (114,714 stars) | Project constitution and strict SDD | New durable projects or major product foundations. | Small changes or existing projects with lighter spec systems. |
| [OpenSpec](https://github.com/Fission-AI/openspec) | Tracked upstream reference | [Fission-AI/openspec](https://github.com/Fission-AI/openspec) (55,971 stars) | Change management | Standard feature/bug/refactor proposals and archived deltas. | One-off throwaway artifacts. |
| [PM Skills](https://github.com/phuryn/pm-skills) | High-signal optional PM reference | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) (20,661 stars) | PM method structure | User explicitly asks for PM-specialist workflow, or the deliverable is mainly PRD, launch, pre-mortem, acceptance, or product discovery. | Default engineering changes, small fixes, or when omyKit's built-in PM pattern is sufficient. |
| [CodeGraph](https://github.com/colbymchenry/codegraph) | Tracked upstream reference | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) (52,991 stars) | Code map and impact | Existing code structure, callers/callees, blast radius. | Replacing tests, source confirmation, or runtime checks. |
| [Context7](https://github.com/upstash/context7) | Tracked upstream reference | [upstash/context7](https://github.com/upstash/context7) (57,852 stars) | Current library docs | Exact API/framework usage questions. | General project facts already in the repo. |
| [Figma MCP](https://github.com/GLips/Figma-Context-MCP) | Tracked upstream reference | [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) (15,204 stars) | Design source | Existing design files, frames, components, tokens. | Guessing design without access. |
| teach-impeccable | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | Durable design context capture | One-time capture of stable product/design context into AI configuration for future sessions. | One-off visual tweaks or project facts that are not stable design guidance. |
| [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Official upstream skill reference | [anthropics/skills](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) (154,163 stars) | UI creation and implementation direction | Building or redesigning concrete frontend screens, components, landing pages, portfolios, or product UI. | Pure research, accessibility-only fixes, or backend/docs work. |
| design-taste-frontend | High-signal visual specialist | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (49,367 stars) | Taste and anti-generic UI judgment | UI output feels generic, brand expression or visual judgment materially affects the result, or the user explicitly asks for Taste Skill. | Accessibility-only, metadata-only, backend, docs, or mechanical code repair. |
| ui-ux-pro-max | High-signal visual specialist | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (95,324 stars) | Advanced UI/UX design intelligence | Complex redesign, multi-platform UI, high-stakes product UI, or visual direction where a stronger specialist can change the outcome. | Small fixes, routine implementation checks, or when `frontend-design` plus project context is enough. |
| critique | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | UX critique | Visual hierarchy, information architecture, cognitive load, or user-experience review. | Implementation or code-level remediation. |
| audit | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | Technical UI audit | Accessibility, performance, theming, responsive behavior, and UI anti-pattern review. | Creative direction or product strategy. |
| adapt | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | Responsive adaptation | Breakpoints, fluid layout, touch targets, device/platform adaptation, or cross-context layout fixes. | Brand direction, content strategy, or non-layout work. |
| clarify | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | UX copy clarity | Labels, errors, microcopy, empty-state text, or instructions that confuse users. | Visual layout, architecture, or copywriting outside the interface. |
| harden | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | Interface resilience | Error states, i18n, text overflow, edge cases, and production robustness. | Pure visual ideation or backend-only hardening. |
| onboard | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | Onboarding and first-run UX | First-use flows, empty states, activation, or time-to-value improvements. | Mature repeated-use workflows that do not involve onboarding. |
| extract | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | Design-system extraction | Reusable components, design tokens, and repeated UI patterns that should become a system. | One-off screens or unvalidated visual experiments. |
| optimize | Installed narrow specialist | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,513 stars) | UI performance | Loading, rendering, animation, images, bundle size, and perceived speed. | Non-UI performance or visual taste work. |
| motion-ai-kit | Installed narrow specialist / official docs | [Motion AI Kit](https://motion.dev/docs/ai-kit) / [motiondivision/motion](https://github.com/motiondivision/motion) (32,471 stars) | Motion system | Microinteractions, page transitions, onboarding animation, state feedback, or motion choreography. | Static UI tasks or performance-sensitive work without a motion need. |
| [gsap-* skills](https://github.com/greensock/gsap-skills) | Official upstream skill reference | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) (9,788 stars) | GSAP implementation | GSAP timelines, ScrollTrigger, React/framework integration, plugins, utilities, or performance tuning when GSAP is already chosen or requested. | General motion strategy, CSS-only animation, or projects without GSAP. |
| [awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) | High-signal ecosystem reference | [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) (19,896 stars) | shadcn/ui ecosystem discovery | Current shadcn examples, component options, or ecosystem research after checking project dependencies and official docs. | Default UI routing, copying catalog contents, or replacing project-native component decisions. |
| imagegen | OpenAI first-party tool | [OpenAI Images docs](https://platform.openai.com/docs/guides/images) | Raster asset generation/editing | Bitmap visuals, moodboards, slide images, thumbnails, hero images, cutouts. | SVG/icon systems, deterministic UI code, existing vector assets. |
| Canva | Platform connector | Installed Canva connector/plugin; no omyKit-tracked low-signal skill repo | Design/deck production | Canva-native presentations, social formats, brand kits. | Code-native UI or local editable files. |
| presentations | OpenAI bundled artifact tool | OpenAI primary runtime; no public repo tracked | Deck creation/editing | PPTX/slide artifacts and rendered verification. | App UI or non-slide docs. |
| documents/PDF | OpenAI bundled artifact tool | OpenAI primary runtime; no public repo tracked | Document artifacts | DOCX/PDF creation, editing, redline, render checks. | Raw markdown-only work. |
| spreadsheets | OpenAI bundled artifact tool | OpenAI primary runtime; no public repo tracked | Data sheets | CSV/XLSX analysis, formulas, charts, exports. | Free-form docs or code data models. |
| Remotion/ffmpeg | Mature infrastructure / official GitHub | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) (50,849 stars) / [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) (61,333 stars) | Video rendering | Deterministic video composition and export. | Manual-only editing when a desktop app is required. |
| RTK | Local runtime wrapper | Local command wrapper in this environment | Command noise control | Shell commands in configured environments. | Commands that must bypass RTK by documented exception. |
| Docker/Compose | Mature infrastructure / official GitHub | [docker/compose](https://github.com/docker/compose) (37,579 stars) / [moby/moby](https://github.com/moby/moby) (71,728 stars) | Runtime dependencies | Databases, caches, object storage, queues, local emulators. | When services already run or tests use in-memory/testcontainers. |
| Chrome Extension | Platform tool / official GitHub | [GoogleChrome/chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) (17,619 stars) | Real Chrome profile | Signed-in websites, project policy requiring Chrome, real-profile visual checks. | Localhost checks that in-app browser/Playwright can handle. |
| Playwright MCP | Mature infrastructure / official GitHub | [microsoft/playwright](https://github.com/microsoft/playwright) (91,381 stars) | Repeatable browser automation | Structured web interactions and accessibility snapshots. | Desktop apps or native mobile devtools. |
| Computer Use | OpenAI platform / official sample | [openai/openai-cua-sample-app](https://github.com/openai/openai-cua-sample-app) (1,740 stars) | Local GUI fallback | Desktop design/video/deck apps, OS file pickers, export panels, or local GUI tools with no better API. | Code edits, shell tasks, browser tasks with dedicated tools, risky UI actions without confirmation. |
| GitHub/Linear | Platform tools / official GitHub | [github/github-mcp-server](https://github.com/github/github-mcp-server) (30,870 stars) / [linear/linear](https://github.com/linear/linear) (1,454 stars) | Work tracking | Issues, PRs, review threads, handoff. | Local code facts available in repository. |
| Sentry/observability | Platform tool / official GitHub | [getsentry/sentry](https://github.com/getsentry/sentry) (44,146 stars) | Runtime failures | Logs, errors, traces from deployed systems. | Local build or unit test failures. |
| SonarQube / project quality gates | Mature infrastructure / project-configured tools | [SonarSource/sonarqube](https://github.com/SonarSource/sonarqube) (10,699 stars); other quality tools must come from current project config or official product docs | External quality gates | Static quality/security, PR review, or visual regression only when already configured for the project. | Replacing local verification or adding new external gates by default. |
| Upstream Watch | Repo-local mechanism | [scripts/check-upstream-refs.mjs](../../scripts/check-upstream-refs.mjs) | External reference drift check | Monthly, before releases, or when workflow/spec/code-intelligence/docs/design/motion/ecosystem/context-compression routing depends on current third-party behavior. | Every task or as automatic permission to copy upstream content. |

## Optional Registry Patterns

These entries are part of the tool registry. They do not create a separate route, and they do not require a separate handoff by default.

Apply them only when the active omyKit route sees the matching signal:

- Product or PM-method work: add discovery, PRD, launch, pre-mortem, acceptance, or test-scenario structure inside the active brief/change workflow, using omyKit's own patterns unless the user explicitly requests a specific high-signal external PM skill such as `phuryn/pm-skills`.
- Visual frontend work: add checks for hierarchy, brand fit, layout resilience, responsive behavior, accessibility basics, and visual QA; use high-signal visual specialists only when they materially change direction.
- shadcn/ui ecosystem work: consult current project dependencies, official/current source material, or `awesome-shadcn-ui` only when examples, component options, or ecosystem research are needed; do not persist catalog contents into omyKit.
- Workflow controller work: use the controller inside the active change route only when durable task graph state, structured handoffs, reject loops, blockers, or compact recovery materially improve reliability; do not create a separate route or force it onto Lite tasks.
- Context compression work: first narrow source context with indexes, outlines, focused commands, and evidence notes; use an explicitly installed, trusted local compression layer only when large retrievable outputs still exceed the useful budget.
- Upstream reference drift: run `node ./scripts/check-upstream-refs.mjs` monthly, before releases, or when a task depends on current external skill behavior; use `codex-workflow-evolution` before adopting any lesson, and prefer the exact linked official source over forks or mirrors.

Use an installed specialist skill directly inside the current route only when it is available, narrow, and materially improves the deliverable. Query current external sources only when the answer depends on a fast-changing ecosystem. Do not copy third-party skill bodies, templates, resource lists, images, badges, or branding into omyKit.

When a pattern materially changes a decision, record which pattern was applied, what decision changed, whether a specialist skill or current source was used, and whether any licensed third-party content was copied with license and attribution.

## Same-Lane Selection

Do not stack same-lane skills by default. Choose one primary capability for the next decision, then add a narrower secondary capability only when it covers a separate gap.

| Lane | Prefer first | Add only when |
| --- | --- | --- |
| Product/PM method | omyKit's built-in PM pattern. | Use `phuryn/pm-skills` only when the user explicitly requests it and the deliverable is mainly PRD, discovery, launch, pre-mortem, or acceptance design. |
| UI creation | `frontend-design`. | Add `design-taste-frontend` for taste/anti-generic judgment, or `ui-ux-pro-max` for high-stakes complex UI, only when that separate gap is real. |
| UX critique/research | `critique`. | Add `frontend-design` only when the result must become concrete UI; add `audit` only when technical checks are required. |
| Visual quality | `frontend-design` for creation, `critique` for review. | Add `design-taste-frontend` or `ui-ux-pro-max` only when novelty, brand expression, or high-end visual judgment is material. |
| Design context capture | `teach-impeccable`. | Use only for stable design guidance that should persist across sessions; do not use for a one-off page tweak. |
| Technical UI audit | `audit`. | Use targeted project-native fixes and verification for confirmed issues. |
| UI implementation QA | Project-native browser checks plus `audit`. | Add `frontend-design` only if the fix changes visual direction. |
| Responsive adaptation | `adapt`. | Add `harden` for text overflow/i18n edge cases. |
| Accessibility hardening | `audit` plus project-native browser/accessibility checks. | Add direct code fixes and verification; do not route to low-star accessibility specialist skills by default. |
| UX copy | `clarify`. | Add `onboard` only when the copy is part of first-run activation. |
| Interface resilience | `harden`. | Add `adapt` for device-specific layout fixes. |
| Onboarding | `onboard`. | Add `clarify` for microcopy or `motion-ai-kit` for meaningful guided motion. |
| Design-system extraction | `extract`. | Add `frontend-design` only when extracted patterns must be implemented. |
| UI performance | `optimize`. | Add browser profiling, `motion-ai-kit`, or matching `gsap-*` only for confirmed animation-specific performance. |
| Metadata and previews | Project-native metadata checks plus browser verification. | Add `audit` only when page-level UI quality is also in scope. |
| Icon systems | Existing project icon library, design system, or current official source. | Add UI creation or audit skills only when icon decisions affect broader layout. |
| Motion | `motion-ai-kit`. | Add matching `gsap-*` only when GSAP is already selected or explicitly requested. |
| GSAP implementation | The matching `gsap-*` skill for the concrete API or integration concern. | Add `motion-ai-kit` only when the intended choreography is unclear; use browser profiling and targeted code fixes for confirmed performance risk. |
| shadcn/ui resources | Project dependencies and official docs first. | Add `awesome-shadcn-ui` only for current ecosystem discovery; do not persist community catalog contents into omyKit. |
| Context compression | `codex-context-budget` first: avoid, index, focus, compact, then summarize. | Use optional local compression only when large repetitive content remains useful, originals can be retrieved, and the path is local and trusted. |
| Durable workflow state | Active `codex-change-workflow` plus Workflow Controller. | Use only for multi-node, resumable, compact-prone, rejected, parallel, or Strict work; do not use it as a separate route. |
| Workflow evolution | `codex-workflow-evolution`. | Add owner skills only after evidence shows the generic kit should change. |

## Versioning Readiness

Use `codex-version-readiness` when a target project needs traceable history, release notes, rollback, migration safety, dependency rollback, or project-local customization. This is a governance check, not a requirement to add heavyweight release tooling to every project.

## Default Selection Rule

Use the narrowest tool that can answer the next question. If a tool would add broad context but not change the next decision, skip it.
