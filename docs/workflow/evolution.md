# Workflow Evolution

Language: [English](evolution.md) | [简体中文](evolution.zh-CN.md)

omyKit should improve from real use without turning every local habit into a generic rule.

## Principle

Learn from evidence, not from vibes. A workflow rule belongs in omyKit only when it helps multiple project types, reduces repeated waste or risk, and stays free of target-project assumptions.

## Evolution Loop

```text
observe -> classify -> abstract -> update smallest surface -> verify -> install -> document
```

For tracked workflows, the closed loop is:

```text
delivery handoff -> evolution_candidates -> scorecard audit -> codex-workflow-evolution review -> smallest owner update -> validation/install -> changelog/evidence
```

Passed delivery nodes must include `evolution_candidates`. An empty array means the delivery was reviewed and no reusable lesson was found. A non-empty candidate must include:

- `lesson`: what should change or be preserved
- `scope`: `generic_omykit`, `project_local`, `one_off`, or `volatile_ecosystem`
- `promotion_status`: `candidate`, `promoted`, `not_promoted`, or `needs_review`
- `evidence`: at least one handoff, command output, board, user-feedback, or review path
- optional `owner`, `update_surface`, `rationale`, and `next_action`

The board shows candidates and turns `generic_omykit` candidates into improvement actions. Scorecards require delivery nodes to record the review but do not require every delivery to produce a generic lesson.

This is separate from delivery `knowledge_sync` and node-level `skill_decisions`: `evolution_candidates` decide whether omyKit itself should change; `knowledge_sync` records whether README, docs, AGENTS/CLAUDE rules, or memory were reconciled for the current project handoff; `skill_decisions` record same-lane skill selection, fallback, and user feedback. Promote only repeated effective or ineffective selection lessons into generic candidates.

## Evidence Sources

- repeated user feedback
- repeated missed route or tool choice
- repeated dissatisfaction, improved fallback, or same-lane skill-selection misses recorded in `skill_decisions`
- stale docs found during handoff
- validation failure or recurring broken links
- delivery gate miss
- repeated manual command that should become a script
- repeated controller friction such as invalid handoffs, retry loops, missing node types, unclear reject targets, or state that failed to support continuation
- upstream reference changed and may contain reusable workflow lessons

## Classification

| Lesson type | Destination |
| --- | --- |
| One-off preference | Conversation only |
| Target-project fact | Target project docs or `AGENTS.md` |
| Cross-project workflow rule | omyKit skill or docs |
| Repeatable mechanical check | `scripts/` and CI |
| Fast-changing ecosystem detail | Current source link or registry reference |
| Changed upstream reference | Review with `upstream-watch`; promote only reusable workflow lessons |

## Promotion States

| State | Meaning |
| --- | --- |
| `candidate` | Captured during delivery and awaiting review. |
| `needs_review` | Evidence is promising but requires more source checking or abstraction work. |
| `promoted` | The smallest owner surface was updated, verified, installed, and documented. |
| `not_promoted` | The lesson was one-off, project-local, volatile, insufficiently evidenced, or failed the abstraction test. |

## Abstraction Test

Before changing omyKit, confirm:

- It applies beyond one repository.
- It avoids product names, credentials, ports, stack choices, and business rules.
- It can be expressed as a small rule, routing row, reference, or validator.
- It lowers future risk, ambiguity, or token waste.
- It does not copy third-party text or templates.

## Update Surfaces

| Need | Update |
| --- | --- |
| User-facing explanation | `README.md` or `docs/workflow/` |
| Procedural behavior | relevant `skills/*/SKILL.md` |
| Conditional detail | one-level `references/` file |
| Repeatable check | `scripts/` plus CI |
| User-visible kit change | `CHANGELOG.md` |
| External reference drift | `upstream-sources.json`, [upstream-watch.md](upstream-watch.md), and the smallest affected owner surface |

## Project Isolation

When maintaining omyKit itself, do not inspect or edit sibling projects unless the user explicitly requests cross-project synchronization. Target projects may reveal useful patterns, but their stack, routes, credentials, ports, product rules, and business terms do not belong in the generic kit.

## Verification

After changing skills or workflow docs:

```bash
./scripts/validate-skills.sh
node ./scripts/validate-docs.mjs
node ./scripts/check-upstream-refs.mjs
git diff --check
./scripts/install-global.sh
```
