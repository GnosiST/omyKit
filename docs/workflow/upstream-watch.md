# Upstream Reference Watch

Language: [English](upstream-watch.md) | [简体中文](upstream-watch.zh-CN.md)

omyKit uses external repositories as reference signals, not vendored doctrine. Upstream changes should be reviewed periodically, but they should not interrupt ordinary work.

## Sources

Tracked references live in [`upstream-sources.json`](../../upstream-sources.json).

Current tracked sources:

- `phuryn/pm-skills` for PM method references.
- `birobirobiro/awesome-shadcn-ui` for shadcn/ui ecosystem discovery.
- `Leonxlnx/taste-skill` for design taste calibration.
- `headroomlabs-ai/headroom` for optional context compression, reversible retrieval, and output shaping reference signals.

## Cadence

- Monthly automatic check through GitHub Actions.
- Manual `workflow_dispatch` before releases or larger workflow revisions.
- Local proactive check when a task depends on current external skill behavior.

## Local Check

```bash
node ./scripts/check-upstream-refs.mjs
```

Use strict mode when a changed upstream should block release readiness until reviewed:

```bash
node ./scripts/check-upstream-refs.mjs --strict
```

## Review Rule

When an upstream source changed:

1. Inspect upstream diffs or release notes from the recorded baseline to the latest commit.
2. Summarize only reusable workflow lessons, new capability categories, or changed routing implications.
3. Run the `codex-workflow-evolution` abstraction test before editing omyKit.
4. Update the smallest owner surface: tool registry, workflow docs, a focused skill rule, validator, or no durable change.
5. Update `upstream-sources.json` baseline only after review.

## Guardrails

- Do not copy third-party skill bodies, templates, resource lists, images, badges, or branding into omyKit.
- Do not turn a fast-changing ecosystem list into a fixed rule.
- Do not run this check for every task; use it at learning, release, or current-source dependency boundaries.
