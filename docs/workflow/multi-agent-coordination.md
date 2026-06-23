# Multi-Agent Coordination And Workflow Intent

Language: [English](multi-agent-coordination.md) | [简体中文](multi-agent-coordination.zh-CN.md)

This document records the product intent behind omyKit, the references used, the current implementation status, and the next-stage design for Codex thread-native multi-agent coordination. It is an assessment document; it does not claim every capability is already implemented in the controller.

## User Intent

omyKit is not meant to wrap every step in a heavy process. It is meant to make complex Codex work more reliable:

- High quality: tasks are split into verifiable nodes, failures can be rejected upstream, and completion claims need evidence.
- High efficiency: simple tasks stay Lite; complex tasks use controller state, templates, scorecards, and boards only when useful.
- Minimal human babysitting: after task confirmation, Codex should keep moving; non-blocking issues are recorded, and only real blockers are escalated.
- Context and token control: each node receives only necessary context through `context-pack`, `downstream_context`, evidence summaries, and command records.
- Less long-task drift: long tasks are split into short nodes with structured handoffs instead of relying on one long chat memory.
- Parallelism and joins: workflows can run serial, parallel, fan-out, join, reject, and block paths while the board reflects real progress.
- Model fit by task: low-risk simple nodes use cheaper tiers, while design or high-risk review uses frontier tiers; actual model usage is recorded only when the runtime exposes it.
- Language adaptation: user-visible plans, questions, progress, handoffs, and boards follow the user's prompt language.
- Continuous evolution: delivery nodes capture reusable lessons, scorecards verify the review happened, and only abstracted lessons enter the generic kit.
- Source integrity: only high-signal, official, or explicitly verified references are admitted; omyKit does not copy third-party skill bodies, templates, images, badges, or branding.

The target experience is: the user says `$omykit 开始执行：<task>` in Codex, and the system handles intake, template selection, node progression, necessary multi-agent coordination, evidence records, board projection, scorecard audit, and final delivery. The user can inspect status at any time, but should not need to manually drive every node.

## User-Requested References

These sources were explicitly requested by the user for review or inspiration. omyKit only absorbs reusable workflow ideas and does not copy third-party content.

| Source | Useful idea | Current status |
| --- | --- | --- |
| Prompt chaining idea | Fixed phases, transparent intermediate artifacts, validation gates, and structured flow to improve accuracy. | Reflected in `workflow-templates/`, handoffs, scorecards, and controller state. |
| `obra/Superpowers` | Brainstorming, planning, TDD, debugging, verification, and review discipline. | Tracked and registered as execution-discipline reference, not a project-fact source. |
| `github/spec-kit` | Constitution, spec-driven development, strict durable-project flow. | Tracked for durable/Strict project signals. |
| `Fission-AI/openspec` | Proposal, delta, and archive change management. | Tracked for formal change-management signals. |
| `colbymchenry/codegraph` | Code maps, call relationships, and blast-radius analysis. | Registered; semantic code exploration is preferred when available. |
| `upstash/context7` | Current library documentation lookup. | Registered for unstable API/library usage questions. |
| `GLips/Figma-Context-MCP` | Figma frames, components, and design tokens. | Registered for real design-source context. |
| `phuryn/pm-skills` | Discovery, PRD, launch, pre-mortem, and acceptance structure. | Optional high-signal PM reference; not default routing. |
| `birobirobiro/awesome-shadcn-ui` | shadcn/ui ecosystem discovery. | Optional ecosystem reference; catalog contents are not persisted. |
| `Leonxlnx/taste-skill` | Anti-generic UI taste and brand expression. | Optional high-signal visual specialist. |
| `nextlevelbuilder/ui-ux-pro-max-skill` | High-stakes UI/UX specialist judgment. | Optional high-signal visual specialist. |
| `zhongerxin/Cowart` | Candidate source the user asked to check. | Not admitted to default registry yet; evaluate later only if it is stable, high-signal, and non-overlapping. |
| Headroom / context compression idea | Recoverable compression for large tool output, logs, and RAG chunks. | Absorbed as optional local compression principles; not a default dependency. |

## Additional References Added By omyKit

These sources were added during maintenance to cover platform, tool, and delivery infrastructure.

| Source | Useful idea | Current status |
| --- | --- | --- |
| OpenAI Codex subagents docs | Parallel subagents, model selection, context pollution/rot risks, explicit triggering. | Influenced `dispatch-plan`, context packs, and orchestrator-observer design. |
| OpenAI Codex app threads/worktrees docs | Multiple threads, background work, worktree isolation, and handoff to local. | Candidate for the next thread-native coordination backend. |
| OpenAI Codex + Agents SDK docs | Heavier multi-agent pipelines with handoffs, guardrails, and traces. | Useful for a heavier external orchestrator path, not the default lightweight skill path. |
| Anthropic `frontend-design` | Official frontend UI creation direction. | Registered as the main UI creation capability. |
| Impeccable skills | Critique, audit, adapt, clarify, harden, onboard, extract, and optimize lanes. | Registered as narrow UI/UX specialists. |
| GSAP skills / Motion | Animation implementation and motion systems. | Used only when GSAP or explicit motion work is in scope. |
| Docker / Moby / Playwright / GitHub MCP / Linear / Sentry / SonarQube / OpenAI CUA sample | Runtime, browser verification, work tracking, observability, quality gates, and GUI fallback. | Platform or mature infrastructure references used by task fit. |

## Current Implementation Assessment

| Requirement | Current implementation | Assessment |
| --- | --- | --- |
| Do not run workflow on every step | `omykit` routes only at intake, scope/risk change, or delivery. | Mostly satisfied. |
| Long tasks continue after workflow creation | Skills and docs require the `start -> work -> handoff -> complete/reject/block -> resume` loop. | Rules exist; real execution still depends on the active Codex turn. |
| Reusable templates | `change.standard`, `bugfix.standard`, `frontend-ui.strict`, with topology, agent, model, runtime, safety, and scorecard layers. | Direction is right; template set is still small. |
| Structured handoff | Schema, validation, `downstream_context`, work items, evidence, skills, model, token/context, and timing. | Relatively complete. |
| Subagent parallelism | `dispatch-plan` emits ready nodes, worker profile, model recommendation, and context pack. | Planning and recording exist; automatic dispatch is not owned by the controller. |
| Multi-thread / worktree agents | `dispatch-plan --surface`, `assign`, `assignments.jsonl`, Agent Roster, handoff coverage scorecard, and write-scope scorecard exist. | Recording and audit exist; the controller still does not create threads/worktrees by itself. |
| Low-context continuation | `active-workflow`, `context-pack`, `downstream_context`, and `commands/commands.jsonl`. | Solid base; missing thread-aware resume packets. |
| Board | Shows tasks, evidence, skills, models, token/context, timing, commands, handoff packets, and improvement actions. | Upgraded into a task tracker, but not a realtime scheduler. |
| Task-fit model choice | Model profiles recommend `fast`, `standard`, `frontier`, and concrete models. | Recommendations and records exist; actual switching depends on Codex runtime support. |
| Token/context/time records | Handoffs and board support source-aware records. | Supported, but not every internal Codex metric can be auto-collected. |
| Self-evolution | Delivery `evolution_candidates`, scorecards, and `codex-workflow-evolution`. | Closed loop exists; more real task data should drive template upgrades. |

Conclusion: omyKit has moved from a set of skill instructions to a workflow kit made of skills, a lightweight controller, YAML templates, scorecards, and a board. It satisfies most core requirements. The largest missing piece is that execution is still centered on the current main thread plus subagents; Codex app independent threads and worktrees are not yet first-class controller execution surfaces.

## Feasibility Of Codex Multi-Thread Coordination

Codex now supports two distinct multi-agent surfaces:

| Surface | Good for | Avoid for |
| --- | --- | --- |
| In-session subagents | Parallel exploration, review, test analysis, and short independent tasks that should be summarized in one response. | Long background work, tasks the user should inspect or continue later, or conflict-prone code edits. |
| Background threads / worktrees | Long tasks, isolated branches, write isolation, background execution, and later handoff to local validation. | Small tasks, tightly shared context, or multiple agents editing the same file set. |

Feasibility is high. The current Codex app tool surface can list, read, message, create, hand off, pin, archive, and rename threads. Official Codex docs also describe parallel threads, worktrees, and subagents.

Necessity is medium-high for omyKit's goals:

1. Main-thread context pollution: logs, exploration, and intermediate failures can stay in worker threads.
2. Write isolation: worktrees let multiple workers operate without overwriting each other.
3. Long-task continuation: each worker thread keeps its own history while the controller reads only structured summaries and handoffs.

It should not replace subagents. The recommended design is a dual backend:

- `subagent` backend: short, lightweight, read-heavy, same-turn consolidation.
- `thread_worktree` backend: long, heavier, write-heavy, independently reviewable or background work.

## Agent Roster Design

The "contact list" should be split into template and runtime layers:

| Layer | File / field | Content |
| --- | --- | --- |
| Template layer | `workflow-templates/common/agents.yaml` | Stable roles such as planner, researcher, coder, tester, reviewer, delivery, UX designer, and visual QA. |
| Node layer | graph / node card | Suggested role, model tier, execution surface, write scope, and handoff target for the node. |
| Runtime layer | `state.json` / `ledger.jsonl` / `assignments.jsonl` | Actual Codex thread, subagent, worktree, model, start/end time, and evidence path. |
| Handoff layer | `handoffs/*.json` | Real outputs, `downstream_context`, evidence, usage, skill/model records. |

Runtime `assignments.jsonl` record shape:

```json
{
  "agent_id": "coder-ui-01",
  "role": "frontend-coder",
  "execution_surface": "thread_worktree",
  "thread_id": "runtime-provided",
  "project_scope": "current repository",
  "write_scope": ["src/ui/**", "tests/ui/**"],
  "model_tier": "standard",
  "context_pack": "context-packs/04-implement.json",
  "handoff_required": "handoffs/04-implement-to-05-visual-qa.json",
  "status": "running"
}
```

## Implemented First Slice

1. `dispatch-plan --surface auto|subagent|thread|worktree|main` emits a recommended execution surface for ready nodes.
2. `assign` writes `.omykit/workflows/<id>/assignments.jsonl` with `thread_id`, worktree, worker, model, scope, status, context pack, and handoff path.
3. The board includes an Agent Roster with each agent's role, surface, thread/worktree, nodes, and status counts.
4. Scorecards check assignment handoff coverage and active write-scope conflicts.
5. Compact recovery now includes `assignments.jsonl` before context packs, so the orchestrator can recover the roster first.

## Remaining Optimization Roadmap

1. Integrate Codex app thread tools so explicit background/thread requests can create bounded threads or worktrees.
2. Add helpers that pull thread summaries and write them back into structured handoffs without loading full worker history into the main thread.
3. Extend the board into a richer Thread Map with thread status, last message, handoff return, and human-intervention nodes.
4. Keep write-heavy parallelism conservative: by default, do not let two background threads edit the same file set unless write scopes are disjoint or worktrees isolate them.
5. Strengthen resume: after compact, the main controller reads active workflow, assignments, context pack, thread summaries, and only then decides which thread to continue or hand off locally.

## What Not To Do

- Do not let the controller create unlimited background threads automatically; thread creation must be explicit user intent or an explicit `$omykit` command.
- Do not let multiple threads share unconstrained write scope.
- Do not put runtime thread ids or worktree paths into generic templates.
- Do not make Headroom-style compression proxies default dependencies; keep recoverable compression optional.
- Do not admit low-signal or unverified sources into the default registry.

## Next Step

The next useful implementation is the actual Codex app thread backend: when the user explicitly authorizes background/independent threads, the orchestrator creates a thread/worktree, sends the node context pack as the start message, records the returned summary as a handoff, and writes thread id, worktree path, and final status back into `assignments.jsonl`.
