---
name: codex-workflow-evolution
description: Evolve omyKit workflow rules from evidence without copying project-specific habits into the generic kit. Use when repeated user feedback, missed routing, stale docs, tool-selection ambiguity, upstream reference changes, verification gaps, or delivery retrospectives suggest omyKit skills, docs, validators, or tool registry rules should improve.
---

# Codex Workflow Evolution

Improve workflow rules only when evidence shows the generic kit should change.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

## Control

Use this at learning boundaries: after delivery, retrospectives, repeated friction, explicit user feedback, stale workflow docs, upstream reference changes, or validation gaps. Do not run it for every task or use it to import target-project facts into omyKit.

## Workflow

1. Apply `codex-context-budget`; start in `scan`.
2. Gather evidence: user feedback, repeated failure, missed gate, stale docs, upstream watch output, validation output, or a concrete workflow gap.
   - For controller workflows, include repeated invalid handoffs, retry loops, missing node types, unclear reject targets, or durable state that failed to support continuation.
   - For tracked workflows, read delivery-node `evolution_candidates`; an empty array means the delivery was reviewed and no durable lesson was found.
   - For missing tool or skill capability, read `capability_gaps`; a candidate tool must have source, license, install/run, real-output, and security/permission evidence before any generic omyKit routing change.
3. Classify the lesson:
   - project-local -> target project `AGENTS.md`, docs, or repo-local skills
   - generic omyKit -> omyKit skills, docs, validators, or tool registry
   - volatile ecosystem -> current source link or reference signal only
   - one-off -> no durable change
4. Run the abstraction test: useful across project types, no product secrets, no stack-specific assumptions, lower future waste/risk, and small enough for skill context.
5. Pick the smallest update surface:
   - wording/docs for explanation gaps
   - `SKILL.md` for procedural routing changes
   - `references/` for conditional detail
   - script/CI for repeatable validation
   - `CHANGELOG.md` for user-visible kit changes
6. Close the candidate loop:
   - `generic_omykit` + passes abstraction test -> update the smallest owner surface, then mark the outcome as promoted in the delivery/evolution evidence.
   - `project_local`, `one_off`, `volatile_ecosystem`, or failed abstraction test -> record why it was not promoted.
   - Candidate external tool -> trial locally or project-locally first; use a candidate branch for omyKit changes; do not push directly to mainline unless the owner explicitly approved the maintenance change after verification.
7. Verify with `validate-skills`, docs link checks, diff hygiene, and targeted forward tests when the rule is substantial.
8. Verify project-local enablement after skill or prompt changes; use global install only when explicitly requested or when the client cannot load project-local skills.

For referenced external skill repositories, read [upstream-watch.md](../../docs/workflow/upstream-watch.md) and use `node ./scripts/check-upstream-refs.mjs`. Treat upstream changes as review signals, not automatic doctrine.

## Guardrails

- Do not mention or inspect sibling projects during omyKit maintenance unless the user explicitly requests cross-project sync.
- Do not promote one user's project-specific stack, ports, credentials, product rules, or naming into the generic kit.
- Do not copy third-party skill bodies, templates, resource lists, images, badges, or branding.
- Do not add a new skill when a short rule, reference row, validator, or docs update solves the repeated gap.
- Do not promote a candidate tool by stars alone; require observed quality improvement, bounded scope, license/source review, and a rollback path.

## Output

Return:

```text
Evidence:
Lesson type:
Owner:
Update surface:
Why generic:
Verification:
Promotion status:
Not promoted:
```

Read [evolution-rubric.md](references/evolution-rubric.md) before changing omyKit itself.
