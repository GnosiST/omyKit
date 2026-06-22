---
name: codex-project-retrofit
description: Retrofit an existing project with a Codex-centered workflow layer. Use when adding Codex Workflow Kit to a maintained repository, legacy project, design folder, deck project, video project, or data/research workspace without disrupting existing structure.
---

# Codex Project Retrofit

Add Codex Workflow Kit to an existing project without rewriting the project.

## Language

Match user-facing language to the latest user prompt. Use that language for visible rationale summaries, plans, questions, progress notes, and handoff. Do not expose private chain-of-thought; provide concise reasoning summaries and evidence instead.

## Workflow

1. Apply `codex-context-budget`; start in `scan`.
2. Inspect existing files: `AGENTS.md`/`CLAUDE.md`, `README.md`, package/build config, docs index, specs/plans, runtime scripts, Docker/Compose files, version/changelog/release files.
3. Produce a project profile:
   - project type and artifacts
   - current commands and gates
   - existing source-of-truth docs
   - required middleware and local runtime setup
   - versioning, rollback, and customization readiness
   - missing workflow pieces
4. Add only missing pieces:
   - Link existing rules instead of duplicating them.
   - Put workflow docs under `docs/workflow/`.
   - Put repeatable Codex behavior under the active project-level skill directory, such as `.codex/skills/` for Codex.
   - Add versioning docs only when existing branch/release/rollback conventions are absent or unclear.
5. Invoke `codex-version-readiness` when branch, release, rollback, history lookup, or customization conventions are unclear.
6. For app/code projects, check CodeGraph availability before architecture or impact claims. If not initialized, record that limitation and use targeted reads.
7. Leave business docs and code untouched unless the user explicitly asks for product changes.

## Output

Create or update `docs/workflow/project-profile.md` and a short handoff note listing what changed and what remains optional.

Read [retrofit-checklist.md](references/retrofit-checklist.md) for inspection details.
