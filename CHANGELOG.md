# Changelog

This file records notable omyKit changes. Keep entries short, factual, and tied to reviewable changes.

## Unreleased

- Refreshed Context7, OpenAI Codex, and Sentry upstream baselines after reviewing enterprise API docs, MCP sandbox-state handling, and Sentry migration-flag changes; no additional omyKit workflow rule was promoted.
- Added layered workflow templates and scorecards: `change.standard`, `bugfix.standard`, and `frontend-ui.strict` now compile into controller graphs with agent/model/runtime/safety profiles, template inspection commands, scorecard audits, language-aware board inference, schemas, tests, and English/Chinese docs.
- Added board interaction and operations telemetry: clickable status filters, node-detail anchors, project change summaries, generated improvement actions, context-size coverage, node timing/ETA, and supplier-independent model-tier policy for agent work.
- Tightened workflow handoffs and schemas for language, context usage, timing, agent scope, model tier, and stable agent IDs so multi-agent records are auditable without forcing the controller to call models.
- Refreshed `openai/codex` and `getsentry/sentry` upstream baselines after reviewing Codex Apps cache/auth setup cleanup and Sentry inbound-filter audit-log metadata; no omyKit workflow rule was promoted.
- Redesigned the workflow board as a project task tracker: nodes now project actual work items, changed files, evidence availability, agent activity, token usage coverage, per-node timelines, and parallel-group token summaries instead of only generic node contracts.
- Extended workflow handoffs with optional `work_items`, `changed_files`, `agent_activity`, and source-aware `token_usage`; token totals only aggregate recorded usage and leave missing nodes visible.
- Refreshed upstream baselines for OpenAI Codex, Moby, and Sentry after reviewing GitHub compare metadata; no omyKit workflow rule was promoted.
- Upgraded the visual board from a generic workflow status view into a project-aware collaboration map with project snapshot, Git state, active changes, key files, recent commits, node handoff summaries, and verification evidence.
- Dogfooded the controller and visual board on the omyKit repository itself; ignored local `.omykit/` state, filtered template metadata out of risk panels, and added `board --lang zh-CN` so Codex-first Chinese board requests render Chinese dashboard labels.
- Refreshed the `openai/codex` upstream baseline after reviewing compact-remote style/test and Codex Apps manager flag cleanup changes; no omyKit workflow rule was promoted.
- Refreshed the `getsentry/sentry` upstream baseline after reviewing a Sentry app external-form rename; no omyKit workflow rule was promoted.
- Added Codex-first install/update/controller usage guidance so users can ask Codex to install omyKit, update itself, inspect workflow status, resume workflows, and generate/open boards without manually running shell commands unless needed for fallback or automation.
- Added a static workflow visual board: `omykit-workflow.mjs board` now writes `board.json` and `board.html` with command-center metrics, status columns, dependency/reject edges, worker lanes, node details, risk panels, recent events, optional collaboration metadata, schema coverage, tests, and English/Chinese docs.
- Added a C-lite workflow controller with task-graph, node-card, state, and handoff schemas; a local `omykit-workflow.mjs` CLI; smoke tests; global install/rollback support; and English/Chinese controller, task-graph, and handoff docs.
- Refreshed upstream baselines for Spec-Kit, CodeGraph, Codex, Impeccable, Remotion, FFmpeg, Moby, Playwright, Linear, Sentry, and SonarQube after reviewing drift; no third-party content was copied, and no additional omyKit doctrine was promoted.
- Added dirty-working-tree warnings and documentation for clean global install manifests during release or handoff.
- Removed community PM/taste/catalog/meta-UX skill references and low-signal platform sample repos from default tool routing and upstream tracking to keep omyKit conservative, reliable, and non-fusionary.
- Tightened source admission rules so stars are supporting evidence, not sufficient proof for default routing.
- Added source marks and verified sources to every tool-registry row, covering installed local skills, platform tools, OpenAI bundled tools, and repo-local mechanisms.
- Added star-count suffixes to verified GitHub sources in the tool registry and documented a no-low-signal-community-skill admission rule.
- Added source-integrity baselines for admitted local skill origins and platform-tool GitHub references such as Impeccable, UI Skills, Better Icons, Motion, Remotion, FFmpeg, Docker, Playwright, GitHub MCP, Linear, Sentry, SonarQube, and OpenAI CUA samples.
- Added source-integrity snapshots and validation for external references, including developer/owner, star counts as of 2026-06-22, fork/archive status, and scoped reference boundaries.
- Refreshed the `openai/codex` upstream baseline after reviewing a remote-exec sandboxing change; no omyKit workflow rule was promoted.
- Refreshed the `getsentry/sentry` upstream baseline after reviewing an internal migration-helper change; no omyKit workflow rule was promoted.
- Refreshed the `FFmpeg/FFmpeg` upstream baseline after reviewing a D3D11VA pixel-format support change; no omyKit workflow rule was promoted.
- Refreshed the `remotion-dev/remotion` upstream baseline after reviewing an Examples-to-Elements documentation rename; no omyKit workflow rule was promoted.
- Added workflow usability controls to the overview so routing, custom answers, language matching, same-lane skill selection, and external reference boundaries are visible in one place.
- Linked admitted upstream sources for Superpowers, Spec-Kit, OpenSpec, CodeGraph, Context7, Figma Context MCP, frontend-design, and GSAP skills, and added a no-forks/no-mirrors source-integrity rule.
- Linked `frontend-design` and `gsap-*` to their official skill sources, added them to upstream tracking, and clarified tool-registry source labeling rules.
- Extended skill validation to require the omyKit `Language` section, user-language matching rule, and private chain-of-thought boundary in every bundled skill.
- Generalized context-budget guidance around optional local compression with original-retrieval safeguards and output-shaping rules.

## 0.1.0 - 2026-06-22

- Added upstream reference monitoring for third-party skill/source repositories, with local checks, monthly GitHub Actions, and evidence-based promotion rules.
- Replaced hard-coded historical install examples with generic git refs so rollback docs do not depend on tags that may not exist yet.
- Clarified repo-local skill vendoring paths so Codex examples use `.codex/skills/` instead of an unmapped neutral directory.
- Added `codex-workflow-evolution` for evidence-based omyKit improvement, with project isolation and abstraction rules.
- Expanded same-lane tool selection to cover design-context capture, audit, UI baseline checks, responsive adaptation, UX copy, hardening, onboarding, design-system extraction, performance, metadata, icons, motion, GSAP implementation, PM, and shadcn resource discovery.
- Added CI and a local Markdown link validator so skill and documentation checks are repeatable.
- Standardized the recommended existing-project prompt on `$omykit 改造旧项目` while keeping `$omykit 初始化旧项目` as a supported alias.
- Clarified same-lane skill selection so omyKit chooses PM, UI, visual-quality, accessibility, icon, motion, and ecosystem capabilities by fit instead of stacking them by default.
- Registered initial PM, UI, visual-quality, and ecosystem reference patterns in the tool registry instead of a separate page.
- Added language-aware output rules so visible rationale, plans, questions, progress, and handoff follow the user's prompt language.
- Added Mermaid workflow and skill-coordination diagrams, plus Chinese mirrors for workflow documentation.
- Clarified Quick Start command blocks by separating shell install commands from Codex chat prompts.
- Added explicit integrated-skill coordination docs explaining responsibilities, handoffs, and conflict-prevention rules.
- Polished GitHub-facing README content and added Chinese documentation entry points.
- Added workflow throttling rules so omyKit routes work at task boundaries and phase changes instead of every action.
- Clarified that routing questions may offer suggestions while still accepting custom answers.
- Added tool-registry guidance for PM, design, and ecosystem-reference signals without copying third-party content.
- Added target-project version readiness guidance for release tags, changelog updates, history lookup, rollback, and project-local customization.
- Added `codex-version-readiness` to assess target-project branch, release, rollback, history lookup, and customization readiness.
- Hardened global installation with validation, versioned backups, and install manifests.
- Initial omyKit skill set for project routing, context budgeting, project init, retrofit, change workflow, runtime readiness, and delivery gates.
- Added scripts to install a historical git ref and restore a previous global backup.
