# Workflow Evolution Rubric

Use this rubric before promoting a lesson into omyKit.

## Promotion Thresholds

| Evidence | Action |
| --- | --- |
| One-off preference or project fact | Do not promote; keep in the target project or conversation. |
| Repeated confusion in two or more tasks | Clarify docs or prompts first. |
| Repeated routing/tool-selection miss | Update `codex-project-router`, `codex-change-workflow`, or `tool-registry`. |
| Repeated verification miss | Add a delivery gate, validation script, or CI check. |
| Referenced upstream skill/source changed | Review upstream changes; update only reusable workflow lessons, then refresh the baseline. |
| Stable cross-project operating rule | Add the shortest possible skill rule and mirror it in docs only if user-facing. |
| Domain-specific workflow | Create or update a repo-local skill, not generic omyKit. |

## Generic Fit Test

A lesson can enter omyKit only when all are true:

- It applies across multiple project types or artifact classes.
- It reduces future risk, waste, or ambiguity.
- It does not encode a single product, team, stack, port, credential, or business rule.
- It can be expressed as a small route, guardrail, validator, or reference row.
- It preserves user freedom when multiple valid approaches exist.

## Owner Map

| Lesson | Owner |
| --- | --- |
| Entry phrase, mode, or project type ambiguity | `omykit` or `codex-project-router` |
| Context over-read or unnecessary tool calls | `codex-context-budget` |
| Concrete work planning or same-lane tool choice | `codex-change-workflow` |
| Runtime dependency discovery or local services | `codex-runtime-readiness` |
| Rollback, release, history, customization | `codex-version-readiness` |
| Completion claims or artifact evidence | `codex-delivery-gate` |
| Referenced external skill/source drift | `upstream-sources.json`, `docs/workflow/upstream-watch.md`, then the smallest affected owner |
| Repeated workflow improvement process | `codex-workflow-evolution` |
| Human-facing explanation | `README.md` or `docs/workflow/` |
| Repeatable mechanical check | `scripts/` and CI |

## Examples

- User feedback says the workflow ran on every command -> add a control rule to route only at task boundaries.
- Broken Markdown links recur -> add a docs validator and CI, not a prose reminder only.
- A target app needs port 3007 -> keep it in that app's docs, not omyKit.
- UI skills are being stacked by default -> add same-lane selection rules and keep external projects as reference signals.
- `phuryn/pm-skills` adds a new launch checklist -> review whether omyKit needs a routing cue; do not copy the checklist.

## Anti-Patterns

- Adding generic release machinery to every small project.
- Promoting a sibling project's architecture into omyKit.
- Turning a current ecosystem list into a fixed doctrine.
- Updating an upstream baseline without reviewing whether anything should change.
- Duplicating the same rule in many skills instead of assigning a clear owner.
