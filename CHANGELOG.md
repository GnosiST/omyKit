# Changelog

This file records notable omyKit changes. Keep entries short, factual, and tied to reviewable changes.

## Unreleased

- Reframed third-party inspiration as inline capability patterns instead of a separate handoff layer.
- Added language-aware output rules so visible rationale, plans, questions, progress, and handoff follow the user's prompt language.
- Added Mermaid workflow and skill-coordination diagrams, plus Chinese mirrors for workflow documentation.
- Clarified Quick Start command blocks by separating shell install commands from Codex chat prompts.
- Added explicit integrated-skill coordination docs explaining responsibilities, handoffs, and conflict-prevention rules.
- Polished GitHub-facing README content and added Chinese documentation entry points.
- Added workflow throttling rules so omyKit routes work at task boundaries and phase changes instead of every action.
- Clarified that routing questions may offer suggestions while still accepting custom answers.
- Added capability-pattern guidance for PM, design, and ecosystem-reference signals without copying third-party content.
- Added target-project version readiness guidance for release tags, changelog updates, history lookup, rollback, and project-local customization.
- Added `codex-version-readiness` to assess target-project branch, release, rollback, history lookup, and customization readiness.
- Hardened global installation with validation, versioned backups, and install manifests.
- Added scripts to install a historical git ref and restore a previous global backup.

## 0.1.0

- Initial omyKit skill set for project routing, context budgeting, project init, retrofit, change workflow, runtime readiness, and delivery gates.
