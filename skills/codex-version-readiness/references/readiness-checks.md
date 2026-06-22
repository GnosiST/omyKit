# Version Readiness Checks

Use the smallest applicable set.

## Repository State

- `git status --short --branch`
- remotes and default branch
- current branch naming convention
- uncommitted user changes
- protected files or generated artifacts

## History And Release Sources

- Git tags or GitHub Releases
- `CHANGELOG.md`
- `VERSION`
- package-native version (`package.json`, `pyproject.toml`, app config)
- release notes directory
- issue, PR, spec, ADR, or decision-record links

## Rollback Paths

Map rollback to artifact type:

- code: revert commit or redeploy previous build
- dependency: restore lockfile/package version
- database: backup restore, reversible migration, or down migration
- content/docs: restore previous file version
- generated assets: preserve previous export path
- global skills/tools: reinstall previous tag/ref or restore install backup
- configuration/secrets: rotate or restore documented environment values

## Customization Paths

- fork or long-lived branch
- project-local config file
- project-local `AGENTS.md`
- repo-local `.agents/skills/`
- `docs/workflow/project-profile.md`
- environment-specific settings
- plugin/skill pinning by version or commit

## Readiness Levels

| Status | Meaning | Action |
| --- | --- | --- |
| Ready | Current state, history, rollback, and customization paths are documented enough for the task. | Proceed and capture evidence. |
| Partial | Basic git history exists, but release/rollback/customization details are incomplete. | Proceed only for low-risk work; document the gap. |
| Blocked | Risky change has no credible rollback path or current state is unknown. | Ask or establish a rollback path before editing. |

## Do Not

- Do not create heavy release machinery for throwaway work.
- Do not overwrite existing branching or release conventions.
- Do not claim rollback exists when it depends on undocumented manual steps.
- Do not edit global installed skills for project customization; use fork, branch, or repo-local skills.
