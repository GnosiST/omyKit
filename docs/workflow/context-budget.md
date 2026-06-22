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

## Optional Headroom Fit

Headroom is useful as an optional reference or installed compression layer for large tool outputs, JSON arrays, search results, logs, diffs, RAG chunks, long docs, conversation handoffs, and output shaping. It should not become a default omyKit dependency.

Avoid it for small contexts, fresh user instructions, credentials or secrets, compliance-sensitive data, exact source-of-truth edits, legal/medical/financial facts, citations, or any output where omitted warnings could change the result.
