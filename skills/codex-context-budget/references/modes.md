# Context Modes

Use this reference to keep Codex fast and accurate.

## scan

Use for routing and estimating.

Allowed context:
- `AGENTS.md`, README, docs index, file tree, manifests, package scripts.
- CodeGraph status/files/explore summaries.
- Current selected Cowart/Figma objects, not the whole board.
- Deck/video/document outlines, not full rendered artifacts.
- Latest command error summary, not raw logs.

Stop when you know project type, risk, likely tools, and next file/tool to inspect.

## focus

Use for planning and implementation.

Allowed context:
- Exact spec/change/task file.
- Exact source files, call sites, tests, config, schemas, or asset metadata.
- Specific library docs through Context7 or official docs.
- Specific browser page/screenshot/console output.
- Specific deck slides, video frames, or design frames.

Stop when you can safely edit or verify.

## deep

Use only when `focus` is insufficient.

Allowed context:
- Full long files, multiple historical docs, long logs, screenshots across viewports, external research.
- Multiple subagents for independent research/review.

Use for high-risk architecture, security, migrations, subtle regressions, visual QA, or blocked debugging.

## Anti-Waste Checks

- Can CodeGraph answer this faster than reading files?
- Can an index or outline answer this before full content?
- Is this reference for the current artifact type only?
- Is a subagent doing independent work, or duplicating the main agent?
- Can the raw output be reduced to a short evidence note?
