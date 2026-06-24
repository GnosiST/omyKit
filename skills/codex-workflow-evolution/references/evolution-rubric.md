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
| New external tool fills a capability gap in one task | Record `capability_gaps` and trial locally or project-locally; do not promote yet. |
| New external tool repeatedly improves outcomes across artifact classes or projects | Create an `evolution_candidate`, use a candidate branch, and require source/license/security/install/run/output evidence before promotion. |
| Stable cross-project operating rule | Add the shortest possible skill rule and mirror it in docs only if user-facing. |
| Domain-specific workflow | Create or update a repo-local skill, not generic omyKit. |

## Generic Fit Test

A lesson can enter omyKit only when all are true:

- It applies across multiple project types or artifact classes.
- It reduces future risk, waste, or ambiguity.
- It does not encode a single product, team, stack, port, credential, or business rule.
- It can be expressed as a small route, guardrail, validator, or reference row.
- It preserves user freedom when multiple valid approaches exist.
- For external tools, it has a verified upstream source, license status, installation/rollback notes, and real output evidence from at least one bounded trial.

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
| New tool or skill capability gap | `docs/workflow/tool-registry.md`, `workflow-handoff.schema.json`, scorecard coverage, then candidate branch if generic routing must change |
| Repeated workflow improvement process | `codex-workflow-evolution` |
| Human-facing explanation | `README.md` or `docs/workflow/` |
| Repeatable mechanical check | `scripts/` and CI |

## Examples

- User feedback says the workflow ran on every command -> add a control rule to route only at task boundaries.
- Broken Markdown links recur -> add a docs validator and CI, not a prose reminder only.
- A target app needs port 3007 -> keep it in that app's docs, not omyKit.
- UI skills are being stacked by default -> add same-lane selection rules and keep external projects as reference signals.
- PPT optimization needs a specialist beyond bundled tooling -> route through `deck.proposal`, record `deck_variant` and `skill_decisions`, then trial only the matching gap (`ppt-master` for native editable PPTX, `guizang-ppt-skill` for HTML deck, external templates for template direction, or a user-approved local style candidate); promote only through an evolution candidate if evidence repeats.
- A community PM skill adds a new launch checklist -> review whether omyKit needs a routing cue; do not copy the checklist or add the source to default routing by popularity alone.

## Anti-Patterns

- Adding generic release machinery to every small project.
- Promoting a sibling project's architecture into omyKit.
- Turning a current ecosystem list into a fixed doctrine.
- Updating an upstream baseline without reviewing whether anything should change.
- Duplicating the same rule in many skills instead of assigning a clear owner.
