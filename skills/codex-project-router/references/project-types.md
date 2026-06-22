# Project Type Routing

Route by deliverable, not by repository technology.

| Type | Signals | Primary workflow | Typical tools |
| --- | --- | --- | --- |
| `app` | source code, tests, dev server, database, UI | spec/change -> impact -> build -> verify | CodeGraph, Context7, runtime-readiness, RTK, Chrome/Playwright |
| `maintenance` | bug, regression, refactor, migration | reproduce -> impact -> minimal fix -> regression check | CodeGraph, Superpowers debugging/TDD, tests |
| `deck` | slides, keynote, pptx, canva, presentation | brief -> outline -> storyboard -> deck -> render QA | presentations, Canva, imagegen, pdf render |
| `video` | script, timeline, clips, remotion, export | brief -> script -> shot list -> render -> frame QA | Remotion, ffmpeg, imagegen, Computer Use |
| `design` | UI, prototype, brand, image, Figma/Cowart | brief -> canvas/frame -> design system -> prototype -> visual QA | Cowart, Figma, ui-ux-pro-max, frontend-design, imagegen |
| `research` | report, citations, market/tool analysis | question -> source plan -> research -> synthesis -> cite | web, Notion/Drive, hv-analysis, PDF/doc tools |
| `data` | spreadsheet, CSV, metrics, chart | question -> schema -> clean -> analyze -> visualize -> export | spreadsheets, Python/Node, charts |
| `mixed` | multiple artifact classes | split into separate deliverable tracks | router plus per-type skills |

## Mode Selection

- `Lite`: reversible one-off work, small artifact, no durable system impact.
- `Standard`: default for useful project work and client-facing artifacts.
- `Strict`: durable product, architecture, security, migration, regulated/high-stakes, paid/client work, or broad blast radius.

## Tool Ordering

1. Native/project APIs and files.
2. Semantic/indexed tools such as CodeGraph or outline readers.
3. Dedicated MCP/plugins such as Figma, Canva, GitHub, Context7.
4. Browser automation for web runtime checks.
5. Computer Use only for local GUI workflows without a better API/plugin.
