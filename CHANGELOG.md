# Changelog

This file records notable omyKit changes. Keep entries short, factual, and tied to reviewable changes.

## Unreleased

- Linked `frontend-design` and `gsap-*` to their official skill sources, added them to upstream tracking, and clarified tool-registry source labeling rules.
- Extended skill validation to require the omyKit `Language` section, user-language matching rule, and private chain-of-thought boundary in every bundled skill.
- Added Headroom as an optional upstream reference and expanded context-budget guidance with compression gates, original-retrieval safeguards, and output-shaping rules.
- Refreshed the `phuryn/pm-skills` upstream baseline after reviewing a README badge-only change; no omyKit workflow rule was promoted.

## 0.1.0 - 2026-06-22

- Added upstream reference monitoring for third-party skill/source repositories, with local checks, monthly GitHub Actions, and evidence-based promotion rules.
- Replaced hard-coded historical install examples with generic git refs so rollback docs do not depend on tags that may not exist yet.
- Clarified repo-local skill vendoring paths so Codex examples use `.codex/skills/` instead of an unmapped neutral directory.
- Added `codex-workflow-evolution` for evidence-based omyKit improvement, with project isolation and abstraction rules.
- Expanded same-lane tool selection to cover design-context capture, audit, UI baseline checks, responsive adaptation, UX copy, hardening, onboarding, design-system extraction, performance, metadata, icons, motion, GSAP implementation, PM, and shadcn resource discovery.
- Added CI and a local Markdown link validator so skill and documentation checks are repeatable.
- Standardized the recommended existing-project prompt on `$omykit 改造旧项目` while keeping `$omykit 初始化旧项目` as a supported alias.
- Clarified same-lane skill selection so omyKit chooses PM, UI, taste, accessibility, icon, motion, and shadcn capabilities by fit instead of stacking them by default.
- Registered PM, UI-design, design-taste, and shadcn ecosystem reference patterns in the tool registry instead of a separate page.
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
