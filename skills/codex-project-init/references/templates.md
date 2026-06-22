# Minimal Init Templates

Use these as shapes, not mandatory text.

## AGENTS.md Sections

```md
# AGENTS.md

## Project Profile
- Type:
- Primary artifacts:
- Runtime:
- Source of truth:

## Working Rules
- Keep context minimal: scan -> focus -> deep.
- Use project scripts before ad hoc commands.
- Protect user work; inspect git status before broad edits.

## Verification
- Lite:
- Standard:
- Strict:

## Tool Routing
- Code structure:
- Runtime:
- Visual/browser:
- Design assets:
- Desktop GUI:
```

## docs/workflow/project-profile.md

```md
# Project Profile

| Field | Value |
| --- | --- |
| Project type | |
| Primary artifacts | |
| Default workflow mode | |
| Spec source | |
| Runtime dependencies | |
| Delivery gates | |

## Source Of Truth

## Runtime Readiness

## Tool Registry

## Delivery Evidence
```

## docs/workflow/delivery-gates.md

Keep gates grouped by artifact type. Include command names and manual/visual checks. Do not require irrelevant gates for every task.

## .agents/skills

Create repo skills only for repeated workflows. Keep `SKILL.md` short and move artifact-type detail into one-level `references/`.
