# Project Type Routing

Route by deliverable, not by repository technology.

| Type | Signals | Primary workflow | Typical tools |
| --- | --- | --- | --- |
| `app` | source code, tests, dev server, database, UI | spec/change -> impact -> build -> verify | CodeGraph, Context7, runtime-readiness, RTK, Chrome/Playwright |
| `maintenance` | bug, regression, refactor, migration | reproduce -> impact -> minimal fix -> regression check | CodeGraph, Superpowers debugging/TDD, tests |
| `deck` | slides, keynote, pptx, canva, presentation | brief -> outline -> storyboard -> deck -> render QA | presentations, Canva, imagegen, pdf render |
| `video` | script, timeline, clips, remotion, export | brief -> script -> shot list -> render -> frame QA | Remotion, ffmpeg, imagegen, Computer Use |
| `design` | UI, prototype, brand, image, Figma/Cowart | brief -> canvas/frame -> design system -> prototype -> visual QA | Cowart, Figma, ui-ux-pro-max, frontend-design, critique/audit, imagegen |
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
2. Semantic/indexed tools such as CodeGraph or outline readers.
3. Dedicated MCP/plugins such as Figma, Canva, GitHub, Context7.
4. Browser automation for web runtime checks.
5. Computer Use only for local GUI workflows without a better API/plugin.

## Versioning Route

Include `codex-version-readiness` when the task touches releases, migrations, deployments, dependency upgrades, generated artifacts, global skills/tools, project customization, or any change where rollback/history lookup matters.

## Tool Registry Pattern Route

- Do not stack same-lane skills by default; choose one primary capability, then add a narrower secondary only when it covers a separate gap.
- Product or PM-method work: add discovery, PRD, launch, pre-mortem, acceptance, or test-scenario structure inside the active workflow; use PM-specialist skills only when the PM deliverable is primary.
- Visual frontend work: use `frontend-design` for concrete UI creation, `ui-ux-pro-max` for UX/pattern judgment, `design-taste-frontend` for visual taste calibration, `teach-impeccable` for stable design-context capture, and focused UI skills such as `critique`, `audit`, `adapt`, `baseline-ui`, `fixing-accessibility`, `clarify`, `harden`, `onboard`, `extract`, `optimize`, `fixing-metadata`, `better-icons`, `motion-ai-kit`, `fixing-motion-performance`, or matching `gsap-*` skills for their specific lanes.
- shadcn/ui ecosystem research: consult current project dependencies or current external sources only when examples or ecosystem options are needed; do not copy fast-changing resource lists into omyKit.
