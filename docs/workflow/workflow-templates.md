# Workflow Templates

Language: [English](workflow-templates.md) | [简体中文](workflow-templates.zh-CN.md)

omyKit workflow templates define reusable task maps for the controller. They are intentionally configuration, not a second implementation path: `init` compiles template YAML into the same `.omykit/workflows/<workflow-id>/graph.json`, node cards, state, handoffs, and board projections used by the controller.

## Built-In Templates

| Template | Mode | Use |
| --- | --- | --- |
| `change.standard` | Standard | Scoped feature, refactor, documentation, or maintenance work. |
| `bugfix.standard` | Standard | Reproduce, diagnose, fix, verify, review, and deliver bug fixes. |
| `frontend-ui.strict` | Strict | Design-sensitive frontend work that needs UI direction, implementation, browser/visual QA, review, and delivery. |
| `deck.proposal` | Strict | PPT/deck work for create-from-scratch, existing-deck remake, or targeted original-template modification, with direction options, source-safe specialist selection, feedback rework, export verification, and delivery evidence. |
| `mission.orchestration` | Strict | Broad requirements that need insight, task decomposition, workflow routing, monitored execution, independent global collaboration audit, integration gates, and learning. |

Use the nearest template first. `init --template auto` selects from these templates by task brief; explicit `--template <id>` overrides auto. Do not make every task use the strictest graph; the controller is useful when state, handoff, retry, parallelism, or compact recovery matters.

## Layering

Templates live under `workflow-templates/`:

```text
workflow-templates/
  common/
    agents.yaml
    model-profiles.yaml
    runtime-profiles.yaml
    safety-limits.yaml
    scorecards/
  templates/
    change.standard.yaml
    bugfix.standard.yaml
    frontend-ui.strict.yaml
    deck.proposal.yaml
    mission.orchestration.yaml
```

Keep these layers separate:

| Layer | Edit when |
| --- | --- |
| template graph | Node order, dependencies, retry limits, joins, or handoff targets change. |
| agent set | Role names, boundaries, or expected scopes change. |
| model profile | Tier selection, tier-to-model recommendation, or node-specific model override changes. |
| runtime profile | Verification expects a different local environment or toolchain. |
| safety limits | Retry, permission, parallelism, or stop conditions change. |
| scorecard | Evidence gates should be added, removed, or tightened. |

This separation lets you add a node without rewriting model policy, adjust an agent without touching topology, and tighten evidence checks without changing execution flow.

## Commands

```bash
node scripts/omykit-workflow.mjs templates list --lang zh-CN
node scripts/omykit-workflow.mjs templates show frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs templates validate
node scripts/omykit-workflow.mjs init "Coordinate a complex release" --template auto
node scripts/omykit-workflow.mjs init "Fix checkout bug" --template bugfix.standard
node scripts/omykit-workflow.mjs init "Redesign settings page" --template frontend-ui.strict --lang zh-CN
node scripts/omykit-workflow.mjs init "Create an investor pitch deck" --template deck.proposal
node scripts/omykit-workflow.mjs init "Remake an existing quarterly deck" --template auto
node scripts/omykit-workflow.mjs init "Modify the existing deck template with one new roadmap slide" --template auto
node scripts/omykit-workflow.mjs scorecard --workflow <workflow-id>
```

Codex-first usage should still go through `$omykit`. Codex can run these commands internally and return the selected template, generated workflow path, next action, board link, scorecard result, and residual risk.

## Scorecards

Scorecards inspect recorded workflow evidence. They are not a replacement for judgment, but they prevent weak completion claims from passing silently.

Current evidence checks cover:

- terminal node handoff summaries
- intake execution options, recommendation, selected option, and confirmation before implementation
- actual work item records
- `deck.proposal` recording `deck_variant`: `create`, `remake`, or `modify`
- downstream context for passed nodes that hand off to later nodes
- changed-file summaries
- verification records and evidence paths
- communication audits for multi-agent work, including evidence independence, contradictions, scope drift, and unresolved findings
- recorded skill usage when skills were actually used
- recommended model records, model override intent for worker creation, and actual model records when execution exposes them
- source-aware token and context usage records
- `usage_observation` for unavailable token/model runtime metrics so unavailable facts are not confused with missing records
- required nodes not being failed or blocked
- subagent role/scope/task/status records
- expert task complexity requiring the frontier model tier
- board language matching workflow language unless explicitly overridden

Failed required checks are projected into the board improvement plan. Recommended checks become warnings.

## Language

Templates store English and Simplified Chinese text for names, objectives, and acceptance criteria. Board language is resolved in this order:

1. explicit `--lang`
2. workflow metadata language
3. latest handoff language
4. title-language inference

For Chinese user prompts, `$omykit` should initialize tracked workflows with `--lang zh-CN` or rely on Chinese title inference. Node details should not fall back to English when the template contains Chinese text.

## Customization Rules

- Keep templates generic. Do not put target-project ports, credentials, product rules, or stack-specific assumptions into omyKit templates.
- Add a new template when the graph topology differs meaningfully.
- Use `deck.proposal` when the artifact is a PPT, presentation, slide deck, pitch deck, or proposal deck. The template records `deck_variant` for create-from-scratch, existing-deck remake, or targeted original-template modification, then separates source/template analysis, story, direction, production, polish, verification, user feedback rework, and delivery so bundled presentation tooling, Canva, PPT Master, Guizang, and external template references can cooperate without competing for the same job.
- Use `mission.orchestration` when the task coordinates multiple workflows or worker lanes. It includes a `global-auditor` node before integration so multi-agent agreement is checked against handoff evidence instead of being accepted from worker summaries alone.
- Add or edit a scorecard when evidence expectations differ but flow stays the same. Common tracked delivery scorecards require `evolution_candidates` and `knowledge_sync`, and recommend `skill_decisions` when specialist skills are used, so workflow learning, docs/memory cleanup, and same-lane skill selection are reviewable.
- Add a runtime profile when verification setup differs but graph topology does not.
- Add a model profile when cost/quality policy or concrete model recommendation differs but node responsibilities stay the same.
- Keep third-party skill ideas as scoped references; do not copy third-party skill bodies, templates, badges, images, or branding into omyKit.
