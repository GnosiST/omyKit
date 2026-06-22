# Context Modes

Use this reference to keep Codex fast and accurate.

## scan

Use for routing and estimating.

Allowed context:
- `AGENTS.md`, README, docs index, file tree, manifests, package scripts.
- CodeGraph status/files/explore summaries.
- Current selected Figma/design-source objects, not the whole board or file.
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

## Compression Gate

Use this order before moving to heavier context:

1. Avoid loading content that will not change the next decision.
2. Use indexes, outlines, symbol maps, selected frames, or project summaries.
3. Ask tools for compact output: `rg -n`, `git diff --stat`, focused test failures, selected logs, or exact file ranges.
4. Summarize the relevant evidence into task-local notes, then discard raw bulk output from reasoning.
5. Use optional local compression only when the content is large, repetitive, retrievable, and trusted.
6. Retrieve the original before exact edits, quotes, citations, security/legal/privacy claims, or any decision where lossiness can hide a failure.

## Optional Local Compression Fit

Local compression is useful as an optional installed tool for:

- large JSON arrays, search results, logs, diffs, RAG chunks, long docs, conversation handoffs, and repetitive tool output
- reversible workflows where the original can be retrieved on demand
- output shaping principles: terse progress, no restating long logs or code, and lower verbosity on routine tool-result followups

Avoid compression for:

- small contexts where setup overhead costs more than it saves
- fresh user instructions, unresolved requirements, credentials, secrets, or compliance-sensitive data
- exact code-edit source, security evidence, legal/medical/financial facts, or citations
- tool outputs where hidden warnings or omitted lines could change the fix
- environments where no trusted local install or retrieval path exists
