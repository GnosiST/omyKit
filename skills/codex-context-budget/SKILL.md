---
name: codex-context-budget
description: Minimize Codex token and context use while preserving delivery quality. Use before loading files, docs, MCP outputs, browser state, design canvases, images, videos, decks, spreadsheets, or logs; use when a task may over-read, spawn broad agents, or need scan/focus/deep context selection.
---

# Codex Context Budget

Load the smallest context that can support the next safe decision.

## Rule

Use progressive context:

1. `scan`: indexes, manifests, file lists, outlines, project profile, CodeGraph summaries, selected canvas/frame metadata.
2. `focus`: exact specs, interfaces, tests, call sites, selected design frames, relevant tool output.
3. `deep`: full files, long docs, histories, logs, screenshots, or multiple external sources only when risk or blockage requires it.

Default to `scan`. Escalate one level at a time.

## Workflow

1. State the current context level.
2. Load only context needed for the next decision.
3. Prefer semantic/indexed tools over raw bulk reads: CodeGraph for code structure, Context7 for exact library docs, Cowart/Figma selected objects for design context, outlines for decks/docs.
4. Summarize large outputs into task-local notes before continuing.
5. Stop reading once the next safe decision is possible.

## Hard Limits

- Do not read all docs for a narrow change.
- Do not ask every subagent to rediscover the whole project.
- Do not paste raw logs into follow-up reasoning; extract command, failure, and owner.
- Do not use Strict workflow for low-risk one-off work.
- Do not put one-off discoveries into `AGENTS.md`; only stable rules graduate there.

Read [modes.md](references/modes.md) for examples.
