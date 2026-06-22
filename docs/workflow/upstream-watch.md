# Upstream Reference Watch

Language: [English](upstream-watch.md) | [简体中文](upstream-watch.zh-CN.md)

omyKit uses external repositories as reference signals, not vendored doctrine. Upstream changes should be reviewed periodically, but they should not interrupt ordinary work or expand the default workflow surface without evidence.

## Sources

Tracked references live in [`upstream-sources.json`](../../upstream-sources.json).

Officiality means "the exact upstream or home repository omyKit tracks for that capability", not endorsement by the repository owner. The verification snapshot below was checked through the GitHub repository API on 2026-06-22; star counts drift and should be refreshed when source reputation materially affects a decision.

Sources that are popular but duplicate omyKit's PM, taste, catalog, or meta-UX lanes are intentionally not tracked here. Track only sources that remain admitted in the default tool registry.

| Source | Developer / owner | Stars on 2026-06-22 | Status | Reference scope in omyKit |
| --- | --- | ---: | --- | --- |
| [obra/Superpowers](https://github.com/obra/Superpowers) | `obra` / User | 235,582 | Not forked, active | Execution discipline, planning, TDD, debugging, review, and verification signals only; no workflow text copied. |
| [github/spec-kit](https://github.com/github/spec-kit) | `github` / Organization | 114,714 | Not forked, active | Strict SDD and constitution signals for durable projects; no templates copied. |
| [Fission-AI/openspec](https://github.com/Fission-AI/openspec) | `Fission-AI` / Organization | 55,971 | Not forked, active | Proposal and archived-delta change-management pattern; no CLI or templates bundled. |
| [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | `colbymchenry` / User | 52,991 | Not forked, active | Code-map and impact-analysis routing signal; no dependency bundled. |
| [upstash/context7](https://github.com/upstash/context7) | `upstash` / Organization | 57,852 | Not forked, active | Current library-doc lookup signal; no documentation mirrored. |
| [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) | `GLips` / User | 15,188 | Not forked, active | Figma design-context routing signal; no MCP config or code bundled. |
| [anthropics/skills](https://github.com/anthropics/skills) | `anthropics` / Organization | 153,760 | Not forked, active | Official frontend-design source link and routing reference; no skill body copied into omyKit. |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `greensock` / Organization | 9,719 | Not forked, active | Official GSAP API skill routing reference; no skill body copied into omyKit. |
| [openai/codex](https://github.com/openai/codex) | `openai` / Organization | 92,647 | Not forked, active | Codex platform/source reference; omyKit does not vendor Codex. |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `pbakaus` / User | 40,159 | Not forked, active | Installed local design-skill family reference; omyKit records routing boundaries and does not copy additional upstream text. |
| [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | `ibelick` / User | 3,302 | Not forked, active | Installed local UI-engineering skill family reference; no upstream body copied into omyKit. |
| [better-auth/better-icons](https://github.com/better-auth/better-icons) | `better-auth` / Organization | 1,105 | Not forked, active | Installed local icon-strategy reference; omyKit does not vendor CLI or MCP code. |
| [motiondivision/motion](https://github.com/motiondivision/motion) | `motiondivision` / Organization | 32,454 | Not forked, active | Official Motion GitHub reference; Motion AI Kit docs remain the source for paid AI Kit behavior. |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | `remotion-dev` / Organization | 50,849 | Not forked, active | Video-rendering platform reference; no dependency bundled. |
| [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) | `FFmpeg` / Organization | 61,333 | Not forked, active | Media-processing reference; omyKit does not vendor FFmpeg. |
| [docker/compose](https://github.com/docker/compose) | `docker` / Organization | 37,579 | Not forked, active | Runtime dependency orchestration reference. |
| [moby/moby](https://github.com/moby/moby) | `moby` / Organization | 71,728 | Not forked, active | Container runtime ecosystem reference; Docker Compose remains the preferred project-level route. |
| [GoogleChrome/chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples) | `GoogleChrome` / Organization | 17,619 | Not forked, active | Chrome extension platform reference; Codex Chrome plugin behavior remains first-party runtime behavior. |
| [microsoft/playwright](https://github.com/microsoft/playwright) | `microsoft` / Organization | 91,381 | Not forked, active | Browser automation reference; no dependency bundled. |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | `github` / Organization | 30,870 | Not forked, active | GitHub platform tooling reference; omyKit still prefers local git/gh when repository facts are local. |
| [linear/linear](https://github.com/linear/linear) | `linear` / Organization | 1,454 | Not forked, active | Linear work-tracking reference; no SDK bundled. |
| [getsentry/sentry](https://github.com/getsentry/sentry) | `getsentry` / Organization | 44,146 | Not forked, active | Observability platform reference; omyKit uses it only when deployed runtime evidence matters. |
| [SonarSource/sonarqube](https://github.com/SonarSource/sonarqube) | `SonarSource` / Organization | 10,699 | Not forked, active | External quality-gate reference; does not replace local verification. |
| [openai/openai-cua-sample-app](https://github.com/openai/openai-cua-sample-app) | `openai` / Organization | 1,740 | Not forked, active | Computer-use platform sample reference; no sample app vendored. |

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
- Do not add low-signal community specialist skills. Prefer verified, non-overlapping, official or mature sources; do not admit a repo solely because it has many stars.
- Do not track low-star platform sample repos unless they are the best available first-party source and materially affect omyKit routing.
- Do not turn a fast-changing ecosystem list into a fixed rule.
- Do not run this check for every task; use it at learning, release, or current-source dependency boundaries.
