# Retrofit Checklist

Use this to add Codex Workflow Kit to an existing project without disrupting it.

## scan

- List root files and existing docs.
- Identify project type and primary artifacts.
- Read existing agent instructions, README, docs index, package/build config, and workflow docs.
- Detect runtime scripts, Docker/Compose files, env examples, and test commands.
- Detect existing specs/plans/issues conventions.
- Check whether CodeGraph or equivalent index exists for code projects.

## Decide Missing Pieces

Add only missing pieces:
- `docs/workflow/project-profile.md`
- `docs/workflow/tool-registry.md`
- `docs/workflow/delivery-gates.md`
- repo skills in `.agents/skills/`
- reminder hooks, only if the project accepts them

## Preserve

- Existing commands and conventions.
- Existing design systems and brand docs.
- Existing deploy/runtime paths.
- Existing issue/spec tools.

## Avoid

- Moving files to fit the kit.
- Replacing a working project-specific workflow with a generic one.
- Adding strict gates to lightweight projects.
- Reading every long doc when index/README is enough.
