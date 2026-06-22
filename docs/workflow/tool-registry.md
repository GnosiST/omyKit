# Tool Registry

Language: [English](tool-registry.md) | [简体中文](tool-registry.zh-CN.md)

This registry describes how Codex should combine tools without loading or using all of them by default.

The `Source mark` and `Verified source` columns identify whether an entry is an omyKit core item, installed local skill, tracked upstream reference, platform tool, OpenAI bundled tool, or repo-local mechanism. GitHub-backed sources are tracked in `upstream-sources.json` when they are material to routing or source integrity. Do not replace a verified source with a similarly named fork, marketplace mirror, or repackaged skill unless the user explicitly asks for that alternate source.

Third-party specialist skills need a verified source, non-forked and non-archived status, and enough public signal to avoid lowering workflow quality. As a default bar, prefer established repos with roughly 1,000+ GitHub stars, or first-party official platform sources when the repo is small because it exists mainly for connector samples or docs. Low-signal community skills should stay out unless the user explicitly requests them.

| Tool | Source mark | Verified source | Role | Use when | Avoid when |
| --- | --- | --- | --- | --- | --- |
| Codex | Core control plane | [openai/codex](https://github.com/openai/codex) (92,646★) | Control plane | Always. It routes, plans, edits, verifies, and summarizes. | Do not bypass with separate uncoordinated tools. |
| AGENTS.md | Repo-local rule file | This repository | Durable repo rules | Stable conventions, commands, boundaries, and definition of done. | One-off notes, history, or long mechanisms better suited to docs. |
| [Superpowers](https://github.com/obra/Superpowers) | Tracked upstream reference | [obra/Superpowers](https://github.com/obra/Superpowers) (235,577★) | Execution discipline | Brainstorming, planning, debugging, TDD, verification, review. | As a spec source or project fact source. |
| [Spec-Kit](https://github.com/github/spec-kit) | Tracked upstream reference | [github/spec-kit](https://github.com/github/spec-kit) (114,714★) | Project constitution and strict SDD | New durable projects or major product foundations. | Small changes or existing projects with lighter spec systems. |
| [OpenSpec](https://github.com/Fission-AI/openspec) | Tracked upstream reference | [Fission-AI/openspec](https://github.com/Fission-AI/openspec) (55,969★) | Change management | Standard feature/bug/refactor proposals and archived deltas. | One-off throwaway artifacts. |
| [CodeGraph](https://github.com/colbymchenry/codegraph) | Tracked upstream reference | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) (52,986★) | Code map and impact | Existing code structure, callers/callees, blast radius. | Replacing tests, source confirmation, or runtime checks. |
| [Context7](https://github.com/upstash/context7) | Tracked upstream reference | [upstash/context7](https://github.com/upstash/context7) (57,851★) | Current library docs | Exact API/framework usage questions. | General project facts already in the repo. |
| [Headroom](https://github.com/headroomlabs-ai/headroom) | Tracked upstream reference | [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) (45,899★) | Optional context compression reference or installed layer | Large repetitive tool outputs, logs, RAG chunks, files, diffs, conversation handoffs, or output shaping after native narrowing is insufficient. | Default dependency, every task, exact source-of-truth edits, security/legal/privacy evidence, citations, or untrusted data paths without local retrieval. |
| [Cowart](https://github.com/zhongerxin/Cowart) | Tracked upstream reference | [zhongerxin/Cowart](https://github.com/zhongerxin/Cowart) (1,735★) | Visual canvas | Product flows, sketches, screenshots, spatial thinking, design references. | Replacing specs or implementation files. |
| [Figma MCP](https://github.com/GLips/Figma-Context-MCP) | Tracked upstream reference | [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) (15,188★) | Design source | Existing design files, frames, components, tokens. | Guessing design without access. |
| teach-impeccable | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | Durable design context capture | One-time capture of stable product/design context into AI configuration for future sessions. | One-off visual tweaks or project facts that are not stable design guidance. |
| [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Official upstream skill reference | [anthropics/skills](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) (153,760★) | UI creation and implementation direction | Building or redesigning concrete frontend screens, components, landing pages, portfolios, or product UI. | Pure research, accessibility-only fixes, or backend/docs work. |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Tracked upstream reference | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (94,930★) | UX/design intelligence and pattern comparison | Evaluating flows, information architecture, interaction patterns, design alternatives, or design rationale. | Straight implementation with enough design direction already present. |
| [design-taste-frontend](https://github.com/Leonxlnx/taste-skill) | Installed local skill / GitHub upstream | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (48,774★) | Visual taste guardrail | High-stakes visual polish, anti-generic UI critique, hierarchy, composition, brand fit, or frontend taste calibration. | Routine dense operational screens where novelty or expressive styling is not useful. |
| critique | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | UX critique | Visual hierarchy, information architecture, cognitive load, or user-experience review. | Implementation or code-level remediation. |
| audit | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | Technical UI audit | Accessibility, performance, theming, responsive behavior, and UI anti-pattern review. | Creative direction or product strategy. |
| baseline-ui | Installed local skill / GitHub upstream | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) (3,302★) | Baseline UI checks | Tailwind UI scale, typography, animation duration, component accessibility, or common UI anti-pattern checks. | Broad creative direction or product strategy. |
| adapt | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | Responsive adaptation | Breakpoints, fluid layout, touch targets, device/platform adaptation, or cross-context layout fixes. | Brand direction, content strategy, or non-layout work. |
| fixing-accessibility | Installed local skill / GitHub upstream | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) (3,302★) | Accessibility repair | ARIA, keyboard navigation, focus management, contrast, forms, dialogs, or WCAG-oriented fixes. | General visual polish or layout exploration. |
| clarify | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | UX copy clarity | Labels, errors, microcopy, empty-state text, or instructions that confuse users. | Visual layout, architecture, or copywriting outside the interface. |
| harden | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | Interface resilience | Error states, i18n, text overflow, edge cases, and production robustness. | Pure visual ideation or backend-only hardening. |
| onboard | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | Onboarding and first-run UX | First-use flows, empty states, activation, or time-to-value improvements. | Mature repeated-use workflows that do not involve onboarding. |
| extract | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | Design-system extraction | Reusable components, design tokens, and repeated UI patterns that should become a system. | One-off screens or unvalidated visual experiments. |
| optimize | Installed local skill / GitHub upstream | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (40,158★) | UI performance | Loading, rendering, animation, images, bundle size, and perceived speed. | Non-UI performance or visual taste work. |
| fixing-metadata | Installed local skill / GitHub upstream | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) (3,302★) | HTML metadata and previews | Title, description, canonical, Open Graph, Twitter cards, favicon, JSON-LD, robots, or share previews. | In-app copy, layout, or backend SEO strategy. |
| better-icons | Installed local skill / GitHub upstream | [better-auth/better-icons](https://github.com/better-auth/better-icons) (1,105★) | Icon strategy | Icon semantics, style consistency, library choice, fallback strategy, or icon-heavy toolbars. | Whole-screen redesign or non-icon UI work. |
| motion-ai-kit | Installed local skill / official docs | [Motion AI Kit](https://motion.dev/docs/ai-kit) / [motiondivision/motion](https://github.com/motiondivision/motion) (32,454★) | Motion system | Microinteractions, page transitions, onboarding animation, state feedback, or motion choreography. | Static UI tasks or performance-sensitive work without a motion need. |
| fixing-motion-performance | Installed local skill / GitHub upstream | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) (3,302★) | Motion performance repair | Layout thrashing, compositor-safe animation, scroll-linked performance, blur cost, or animation smoothness issues. | Motion concepting or static UI work. |
| [gsap-* skills](https://github.com/greensock/gsap-skills) | Official upstream skill reference | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) (9,719★) | GSAP implementation | GSAP timelines, ScrollTrigger, React/framework integration, plugins, utilities, or performance tuning when GSAP is already chosen or requested. | General motion strategy, CSS-only animation, or projects without GSAP. |
| imagegen | OpenAI first-party tool | [OpenAI Images docs](https://platform.openai.com/docs/guides/images) | Raster asset generation/editing | Bitmap visuals, moodboards, slide images, thumbnails, hero images, cutouts. | SVG/icon systems, deterministic UI code, existing vector assets. |
| Canva | Platform connector / official GitHub | [canva-sdks/canva-claude-skills](https://github.com/canva-sdks/canva-claude-skills) (41★) | Design/deck production | Canva-native presentations, social formats, brand kits. | Code-native UI or local editable files. |
| presentations | OpenAI bundled artifact tool | OpenAI primary runtime; no public repo tracked | Deck creation/editing | PPTX/slide artifacts and rendered verification. | App UI or non-slide docs. |
| documents/PDF | OpenAI bundled artifact tool | OpenAI primary runtime; no public repo tracked | Document artifacts | DOCX/PDF creation, editing, redline, render checks. | Raw markdown-only work. |
| spreadsheets | OpenAI bundled artifact tool | OpenAI primary runtime; no public repo tracked | Data sheets | CSV/XLSX analysis, formulas, charts, exports. | Free-form docs or code data models. |
| Remotion/ffmpeg | Platform tools / official GitHub | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) (50,848★) / [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) (61,333★) | Video rendering | Deterministic video composition and export. | Manual-only editing when a desktop app is required. |
| RTK | Local runtime wrapper | Local command wrapper in this environment | Command noise control | Shell commands in configured environments. | Commands that must bypass RTK by documented exception. |
| Docker/Compose | Platform tools / official GitHub | [docker/compose](https://github.com/docker/compose) (37,579★) / [moby/moby](https://github.com/moby/moby) (71,727★) | Runtime dependencies | Databases, caches, object storage, queues, local emulators. | When services already run or tests use in-memory/testcontainers. |
| Chrome Extension | Platform tool / official GitHub | [GoogleChrome/chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) (17,619★) | Real Chrome profile | Signed-in websites, project policy requiring Chrome, real-profile visual checks. | Localhost checks that in-app browser/Playwright can handle. |
| Playwright MCP | Platform tool / official GitHub | [microsoft/playwright](https://github.com/microsoft/playwright) (91,381★) | Repeatable browser automation | Structured web interactions and accessibility snapshots. | Desktop apps or native mobile devtools. |
| Computer Use | OpenAI platform / official sample | [openai/openai-cua-sample-app](https://github.com/openai/openai-cua-sample-app) (1,740★) | Local GUI fallback | WeChat DevTools, desktop design/video/deck apps, OS file pickers, export panels. | Code edits, shell tasks, browser tasks with dedicated tools, risky UI actions without confirmation. |
| GitHub/Linear | Platform tools / official GitHub | [github/github-mcp-server](https://github.com/github/github-mcp-server) (30,870★) / [linear/linear](https://github.com/linear/linear) (1,454★) | Work tracking | Issues, PRs, review threads, handoff. | Local code facts available in repository. |
| Sentry/observability | Platform tool / official GitHub | [getsentry/sentry](https://github.com/getsentry/sentry) (44,146★) | Runtime failures | Logs, errors, traces from deployed systems. | Local build or unit test failures. |
| CodeRabbit/Sonar/Chromatic | Quality tools / official GitHub | [coderabbitai/awesome-coderabbit](https://github.com/coderabbitai/awesome-coderabbit) (402★) / [SonarSource/sonarqube](https://github.com/SonarSource/sonarqube) (10,699★) / [chromaui/chromatic-cli](https://github.com/chromaui/chromatic-cli) (337★) | External quality gates | PR review, static quality/security, visual regression. | Replacing local verification. |
| Upstream Watch | Repo-local mechanism | [scripts/check-upstream-refs.mjs](../../scripts/check-upstream-refs.mjs) | External reference drift check | Monthly, before releases, or when workflow/spec/code-intelligence/docs/design/motion/ecosystem/context-compression routing depends on current third-party behavior. | Every task or as automatic permission to copy upstream content. |
| [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | Tracked upstream reference | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) (20,433★) | PM method reference source | Product discovery, strategy framing, PRD, launch planning, pre-mortem, acceptance, or test-scenario structure. | Copying templates or adding heavy PM ceremony to small implementation tasks. |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Tracked upstream reference | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (48,774★) | Design taste reference source | Stricter visual judgment, anti-generic UI critique, or frontend design quality calibration. | Copying skill text or forcing marketing-page taste onto operational dashboards. |
| [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) | Tracked upstream reference | [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) (19,884★) | shadcn/ui ecosystem reference source | Current shadcn resources, component examples, library options, or ecosystem discovery. | Copying fast-changing catalogs into omyKit or treating a resource list as stable doctrine. |

## Optional Registry Patterns

These entries are part of the tool registry. They do not create a separate route, and they do not require a separate handoff by default.

Apply them only when the active omyKit route sees the matching signal:

- Product or PM-method work: add discovery, PRD, launch, pre-mortem, acceptance, or test-scenario structure inside the active brief/change workflow.
- Visual frontend work: add checks for hierarchy, brand fit, layout resilience, responsive behavior, accessibility basics, and visual QA.
- shadcn/ui ecosystem work: consult current project dependencies or current sources only when examples, component options, or ecosystem research are needed.
- Context compression work: first narrow source context with indexes, outlines, focused commands, and evidence notes; use Headroom-style compression only when large retrievable outputs still exceed the useful budget.
- Upstream reference drift: run `node ./scripts/check-upstream-refs.mjs` monthly, before releases, or when a task depends on current external skill behavior; use `codex-workflow-evolution` before adopting any lesson, and prefer the exact linked official source over forks or mirrors.

Use an installed specialist skill directly inside the current route only when it is available and materially improves the deliverable. Query current external sources only when the answer depends on a fast-changing ecosystem. Do not copy third-party skill bodies, templates, resource lists, images, badges, or branding into omyKit.

When a pattern materially changes a decision, record which pattern was applied, what decision changed, whether a specialist skill or current source was used, and whether any licensed third-party content was copied with license and attribution.

## Same-Lane Selection

Do not stack same-lane skills by default. Choose one primary capability for the next decision, then add a narrower secondary capability only when it covers a separate gap.

| Lane | Prefer first | Add only when |
| --- | --- | --- |
| Product/PM method | omyKit's built-in PM pattern; consult `phuryn/pm-skills` only as a reference signal. | The requested deliverable is mainly PRD, discovery, launch, pre-mortem, or acceptance design. |
| UI creation | `frontend-design`. | Add `design-taste-frontend` for high-stakes visual polish, or `baseline-ui` for implementation checks. |
| UX critique/research | `ui-ux-pro-max`. | Add `frontend-design` only when the result must become concrete UI. |
| Visual taste | `design-taste-frontend`; consult `Leonxlnx/taste-skill` only as a reference signal. | Add `frontend-design` when taste critique must be implemented. |
| Design context capture | `teach-impeccable`. | Use only for stable design guidance that should persist across sessions; do not use for a one-off page tweak. |
| UX critique | `critique`. | Add `audit` only when technical checks are required. |
| Technical UI audit | `audit`. | Add focused fixing skills only for confirmed issues. |
| UI implementation baseline | `baseline-ui`. | Add `audit` only when the review must cover broader accessibility, performance, theming, or responsive behavior. |
| Responsive adaptation | `adapt`. | Add `harden` for text overflow/i18n edge cases. |
| Accessibility hardening | `fixing-accessibility`. | Add `baseline-ui` for broader component-scale checks. |
| UX copy | `clarify`. | Add `onboard` only when the copy is part of first-run activation. |
| Interface resilience | `harden`. | Add `adapt` for device-specific layout fixes. |
| Onboarding | `onboard`. | Add `clarify` for microcopy or `motion-ai-kit` for meaningful guided motion. |
| Design-system extraction | `extract`. | Add `frontend-design` only when extracted patterns must be implemented. |
| UI performance | `optimize`. | Add `fixing-motion-performance` only for animation-specific performance. |
| Metadata and previews | `fixing-metadata`. | Add browser checks only when rendered page output matters. |
| Icon systems | `better-icons`. | Add UI creation or audit skills only when icon decisions affect broader layout. |
| Motion | `motion-ai-kit`. | Add `fixing-motion-performance` only if animation cost or smoothness is a risk. |
| GSAP implementation | The matching `gsap-*` skill for the concrete API or integration concern. | Add `motion-ai-kit` only when the intended choreography is unclear; add `fixing-motion-performance` only for confirmed performance risk. |
| shadcn/ui resources | Project dependencies and current official/source material first; consult `birobirobiro/awesome-shadcn-ui` as an ecosystem reference. | The task needs current examples, component options, or library discovery. |
| Context compression | `codex-context-budget` first: avoid, index, focus, compact, then summarize. | Use Headroom only when large repetitive content remains useful, originals can be retrieved, and the path is local or explicitly trusted. |
| Workflow evolution | `codex-workflow-evolution`. | Add owner skills only after evidence shows the generic kit should change. |

## Versioning Readiness

Use `codex-version-readiness` when a target project needs traceable history, release notes, rollback, migration safety, dependency rollback, or project-local customization. This is a governance check, not a requirement to add heavyweight release tooling to every project.

## Default Selection Rule

Use the narrowest tool that can answer the next question. If a tool would add broad context but not change the next decision, skip it.
