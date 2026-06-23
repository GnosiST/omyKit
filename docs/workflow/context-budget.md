# Context Budget

Language: [English](context-budget.md) | [简体中文](context-budget.zh-CN.md)

The kit optimizes for high-quality delivery with low token waste.

## Progression

```text
scan -> focus -> deep
```

## scan

Use for routing:
- root instructions
- README/docs index
- manifests/package scripts
- file tree
- CodeGraph summaries
- selected canvas/frame metadata
- artifact outlines

## focus

Use for implementation:
- exact spec/change/task file
- exact source files and tests
- exact design frame or slide range
- exact library docs
- exact command failure

## deep

Use only for high-risk or blocked work:
- long docs
- full logs
- multiple screenshots/viewports
- multiple external sources
- subagent research/review

## Anti-Waste Rules

- Do not read all docs for a narrow change.
- Do not ask subagents to rediscover the whole repo.
- Do not load every project-type reference.
- Do not paste raw logs forward.
- Do not use Strict mode for low-risk work.
- Do not write one-off facts into durable instructions.

## Compression Gate

Compression is useful only after narrowing fails. Use this order:

1. Avoid loading irrelevant content.
2. Prefer indexes, outlines, symbol maps, selected frames, and project summaries.
3. Ask tools for compact output such as focused file ranges, `git diff --stat`, exact failures, or selected log slices.
4. Summarize large outputs into local evidence notes before continuing.
5. Use optional local compression only for large, repetitive, retrievable, trusted content.
6. Retrieve the original before exact code edits, quotes, citations, security/legal/privacy claims, or any decision where lossiness can hide a failure.

## Controller Continuation

For controller-backed workflows, resume after compact or interruption from durable state before reading broad context:

1. `.omykit/active-workflow`, or an explicit `--workflow <id>` when multiple workflows exist
2. `.omykit/workflows/<id>/state.json`
3. `.omykit/workflows/<id>/graph.json`
4. `context-packs/<node-id>.json` for the running or ready node; generate it first when missing
5. the latest relevant `ledger.jsonl` events and `commands/commands.jsonl` records
6. active, ready, failed, or blocked node cards
7. related handoff and evidence summaries

Return to full source files, full logs, or original artifacts only when the next action depends on exact edits, citations, security/legal/privacy judgment, or failure root cause.

## Optional Local Compression Fit

Optional local compression is useful only for large tool outputs, JSON arrays, search results, logs, diffs, RAG chunks, long docs, conversation handoffs, and output shaping after narrowing fails. It should not become a default omyKit dependency.

Avoid it for small contexts, fresh user instructions, credentials or secrets, compliance-sensitive data, exact source-of-truth edits, legal/medical/financial facts, citations, or any output where omitted warnings could change the result.
