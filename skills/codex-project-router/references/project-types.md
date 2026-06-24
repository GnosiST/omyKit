# Project Type Routing

Route by deliverable, not by repository technology.

| Type | Signals | Primary workflow | Typical tools |
| --- | --- | --- | --- |
| `app` | source code, tests, dev server, database, UI | spec/change -> impact -> build -> verify | CodeGraph, Context7, runtime-readiness, RTK, project scripts, platform official CLIs, Chrome/Playwright |
| `maintenance` | bug, regression, refactor, migration | reproduce -> impact -> minimal fix -> regression check | CodeGraph, Superpowers debugging/TDD, tests |
| `deck` | slides, keynote, pptx, canva, presentation | brief -> outline -> storyboard -> deck -> render QA | presentations, Canva, imagegen, pdf render |
| `video` | script, timeline, clips, remotion, export | brief -> script -> shot list -> render -> frame QA | Remotion, ffmpeg, imagegen, Computer Use only for local GUI fallback |
| `design` | UI, prototype, brand, image, Figma, selected design source | brief -> selected source/frame -> design system -> prototype -> visual QA | Figma, frontend-design, critique/audit, high-signal visual specialists, imagegen |
| `research` | report, citations, market/tool analysis | question -> source plan -> research -> synthesis -> cite | web, Notion/Drive, hv-analysis, PDF/doc tools |
| `data` | spreadsheet, CSV, metrics, chart | question -> schema -> clean -> analyze -> visualize -> export | spreadsheets, Python/Node, charts |
| `mixed` | multiple artifact classes | split into separate deliverable tracks | router plus per-type skills |

## Mode Selection

- `Lite`: reversible one-off work, small artifact, no durable system impact.
- `Standard`: default for useful project work and client-facing artifacts.
- `Strict`: durable product, architecture, security, migration, regulated/high-stakes, paid/client work, or broad blast radius.

## Tool Ordering

Keep the selected route until scope, risk, artifact type, or user intent changes.

1. Native/project APIs and files.
2. Project scripts and platform official CLIs or automation APIs, such as WeChat DevTools CLI for Mini Programs when the project evidence supports it.
3. Semantic/indexed tools such as CodeGraph or outline readers.
4. Dedicated MCP/plugins such as Figma, Canva, GitHub, Context7.
5. Browser automation for web runtime checks.
6. Computer Use only for local GUI workflows when no official/dedicated connector, MCP/plugin, browser automation, shell/API path, project script, or platform official CLI can do the job.

## Versioning Route

Include `codex-version-readiness` when the task touches releases, migrations, deployments, dependency upgrades, generated artifacts, global skills/tools, project customization, or any change where rollback/history lookup matters.

## Tool Registry Pattern Route

- Do not stack same-lane skills by default; choose one primary capability, then add a narrower secondary only when it covers a separate gap.
- Product or PM-method work: add discovery, PRD, launch, pre-mortem, acceptance, or test-scenario structure inside the active workflow; use PM-specialist skills only when the PM deliverable is primary.
- Visual frontend work: use `frontend-design` for concrete UI creation, `critique` for UX/pattern judgment, `audit` for technical UI checks, `teach-impeccable` only for stable design-context capture, high-signal visual specialists such as `design-taste-frontend` or `ui-ux-pro-max` only when they materially change visual direction, and project-native checks for accessibility, metadata, icons, and performance.
- shadcn/ui ecosystem research: consult current project dependencies or current external sources only when examples or ecosystem options are needed; do not copy fast-changing resource lists into omyKit.
