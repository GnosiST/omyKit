---
name: codex-context-budget
description: Minimize Codex token and context use while preserving delivery quality. Use before loading files, docs, MCP outputs, browser state, design canvases, images, videos, decks, spreadsheets, or logs; use when a task may over-read, spawn broad agents, need scan/focus/deep context selection, or benefit from optional local compression/output shaping for large retrievable content.
---

# Codex Context Budget

Load the smallest context that can support the next safe decision.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

## Rule

Use progressive context:

1. `scan`: indexes, manifests, file lists, outlines, project profile, CodeGraph summaries, selected canvas/frame metadata.
2. `focus`: exact specs, interfaces, tests, call sites, selected design frames, relevant tool output.
3. `deep`: full files, long docs, histories, logs, screenshots, or multiple external sources only when risk or blockage requires it.

Default to `scan`. Escalate one level at a time.

Apply the budget when choosing context or crossing a task phase. Do not restart the budget workflow for each command, file read, or edit once the current context level is adequate.

## Workflow

1. State the current context level.
2. Load only context needed for the next decision.
3. Prefer semantic/indexed tools over raw bulk reads: CodeGraph for code structure, Context7 for exact library docs, selected Figma/design-source objects for design context, outlines for decks/docs.
4. Apply the compression gate before `deep`: avoid loading first, narrow with indexes/outlines second, compact native command output third, summarize fourth, and use optional local compression only when content is large, repetitive, retrievable, and trusted.
5. Summarize large outputs into task-local notes before continuing.
6. Retrieve the original source before exact code edits, quotes, citations, legal/security/privacy claims, or decisions where lossy compression could hide a failure.
7. Stop reading once the next safe decision is possible.

## Controller Continuation

For omyKit controller workflows after compact, interruption, or handoff, resume with the smallest durable state:

1. `.omykit/active-workflow`, or an explicit `--workflow <id>` when multiple workflows exist.
2. `.omykit/workflows/<id>/state.json`.
3. `.omykit/workflows/<id>/graph.json`.
4. `context-packs/<node-id>.json` for the running or ready node; generate it first when missing.
5. Latest relevant `ledger.jsonl` events and `commands/commands.jsonl` records.
6. Active, failed, blocked, or ready node cards.
7. Related handoff and evidence summaries.

Return to original files or full evidence only when the next action needs exact edits, quotes, security/legal/privacy judgment, or failure root cause.

For subagent dispatch, the main thread keeps only the orchestration state and gives each worker the smallest node-local context pack: active workflow id, `state.json`, `graph.json`, the node card, relevant dependency handoff summaries, upstream `downstream_context`, active command records, and exact files only when the node needs edits or verification. Do not fork the whole conversation history into a worker unless the subtask cannot be specified any other way.

## Hard Limits

- Do not read all docs for a narrow change.
- Do not ask every subagent to rediscover the whole project.
- Do not paste raw logs into follow-up reasoning; extract command, failure, and owner.
- Do not use Strict workflow for low-risk one-off work.
- Do not put one-off discoveries into `AGENTS.md`; only stable rules graduate there.
- Do not add proxies, MCP compression, or any compression layer as a default omyKit dependency; route to optional local compression only when installed, trusted, and useful for the current task.
- Do not send secrets, credentials, private data, or compliance-sensitive material through an untrusted or remote compression path.
- Do not treat compressed output as the source of truth when exact wording, line numbers, or complete data matters.

Read [modes.md](references/modes.md) for examples.
