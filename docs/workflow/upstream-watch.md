# Upstream Reference Watch

Language: [English](upstream-watch.md) | [简体中文](upstream-watch.zh-CN.md)

omyKit uses external repositories as reference signals, not vendored doctrine. Upstream changes should be reviewed periodically, but they should not interrupt ordinary work.

## Sources

Tracked references live in [`upstream-sources.json`](../../upstream-sources.json).

Officiality means "the exact upstream or home repository omyKit tracks for that capability", not endorsement by the repository owner. The verification snapshot below was checked through the GitHub repository API on 2026-06-22; star counts drift and should be refreshed when source reputation materially affects a decision.

| Source | Developer / owner | Stars on 2026-06-22 | Status | Reference scope in omyKit |
| --- | --- | ---: | --- | --- |
| [`obra/Superpowers`](https://github.com/obra/Superpowers) | `obra` / User | 235,549 | Not forked, active | Execution discipline, planning, TDD, debugging, review, and verification signals only; no workflow text copied. |
| [`github/spec-kit`](https://github.com/github/spec-kit) | `github` / Organization | 114,712 | Not forked, active | Strict SDD and constitution signals for durable projects; no templates copied. |
| [`Fission-AI/openspec`](https://github.com/Fission-AI/openspec) | `Fission-AI` / Organization | 55,967 | Not forked, active | Proposal and archived-delta change-management pattern; no CLI or templates bundled. |
| [`colbymchenry/codegraph`](https://github.com/colbymchenry/codegraph) | `colbymchenry` / User | 52,973 | Not forked, active | Code-map and impact-analysis routing signal; no dependency bundled. |
| [`upstash/context7`](https://github.com/upstash/context7) | `upstash` / Organization | 57,851 | Not forked, active | Current library-doc lookup signal; no documentation mirrored. |
| [`zhongerxin/Cowart`](https://github.com/zhongerxin/Cowart) | `zhongerxin` / User | 1,723 | Not forked, active | Visual canvas and spatial-context routing signal; no assets bundled. |
| [`GLips/Figma-Context-MCP`](https://github.com/GLips/Figma-Context-MCP) | `GLips` / User | 15,187 | Not forked, active | Figma design-context routing signal; no MCP config or code bundled. |
| [`phuryn/pm-skills`](https://github.com/phuryn/pm-skills) | `phuryn` / User | 20,429 | Not forked, active | PM method categories and routing cues; no PRD or launch templates copied. |
| [`birobirobiro/awesome-shadcn-ui`](https://github.com/birobirobiro/awesome-shadcn-ui) | `birobirobiro` / User | 19,884 | Not forked, active | shadcn/ui ecosystem discovery signal; no fast-changing catalog copied. |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) | `Leonxlnx` / User | 48,761 | Not forked, active | Visual-taste calibration signal; no skill body copied. |
| [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `nextlevelbuilder` / Organization | 94,918 | Not forked, active | UX/design intelligence lane and pattern-comparison signal; no database or skill body copied. |
| [`anthropics/skills`](https://github.com/anthropics/skills) | `anthropics` / Organization | 153,753 | Not forked, active | Official `frontend-design` source link and routing reference; no skill body copied into omyKit. |
| [`greensock/gsap-skills`](https://github.com/greensock/gsap-skills) | `greensock` / Organization | 9,717 | Not forked, active | Official GSAP API skill routing reference; no skill body copied into omyKit. |
| [`headroomlabs-ai/headroom`](https://github.com/headroomlabs-ai/headroom) | `headroomlabs-ai` / Organization | 45,826 | Not forked, active | Optional context-compression and output-shaping reference; no default dependency or proxy bundled. |

## Cadence

- Monthly automatic check through GitHub Actions.
- Manual `workflow_dispatch` before releases or larger workflow revisions.
- Local proactive check when a task depends on current external skill behavior.

## Local Check

```bash
node ./scripts/check-upstream-refs.mjs
```

This checks both upstream `HEAD` drift and the required source-integrity snapshot fields in `upstream-sources.json`.

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
- Do not substitute a linked official source with a similarly named fork, marketplace mirror, or repackaged skill unless the user explicitly asks for that alternate source.
- Do not turn a fast-changing ecosystem list into a fixed rule.
- Do not run this check for every task; use it at learning, release, or current-source dependency boundaries.
