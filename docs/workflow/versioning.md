# Versioning Readiness

Use this guide to check whether a target project can be changed, reviewed, customized, and rolled back safely. omyKit should surface gaps; it should not force a release process that does not fit the project.

## Target Project Checklist

Check these in `init`, `retrofit`, significant `change`, and `delivery` work:

- Git repository exists and has a known current branch.
- Working tree state is visible before broad edits.
- Remote repository is configured when collaboration or publishing is expected.
- Branching convention is documented, or a safe default is proposed.
- Release/version source exists when the project ships durable artifacts:
  - package/app version (`package.json`, `pyproject.toml`, app config, etc.)
  - `VERSION`
  - `CHANGELOG.md`
  - release notes directory
  - GitHub Releases or tags
- Rollback path is known for the artifact:
  - revert commit
  - redeploy previous release
  - restore database backup
  - reverse migration
  - restore previous generated artifact
  - reinstall previous skill/package version
- Customization path is clear:
  - fork or branch
  - project-local config
  - project-local `AGENTS.md`
  - repo-local `.agents/skills/`
  - environment-specific settings
- Historical lookup is practical:
  - tags/releases
  - changelog entries
  - commit messages
  - issue/PR links
  - archived specs or decision records

## Mode Guidance

| Mode | Required versioning posture |
| --- | --- |
| `Lite` | Know current git status and avoid destructive edits. Mention if no rollback path exists. |
| `Standard` | Use a branch or clear commit scope. Record changed artifacts and verification. Add changelog/release note when user-facing behavior changes. |
| `Strict` | Require explicit rollback plan before risky changes. Check migrations, data backup, deployment rollback, version bump, release notes, and traceable PR/issue/spec links. |

## Init Guidance

For a new target project, create or recommend:

- initial git repository if absent
- branch naming convention
- `CHANGELOG.md` or release notes path for durable projects
- `VERSION` or package-native version source when releases are expected
- rollback expectations in `docs/workflow/delivery-gates.md`
- customization boundary in `AGENTS.md` or `docs/workflow/project-profile.md`

Do not add release machinery to throwaway drafts, one-off documents, or low-risk experiments unless the user asks.

## Retrofit Guidance

For an existing target project, inspect before proposing changes:

- current branch and dirty files
- remotes and default branch
- tags/releases/changelog/version files
- existing CI/release/deploy scripts
- migration and backup strategy
- project-local skills/config overrides
- existing contribution or branching rules

Preserve existing conventions. If versioning is weak, document the gap and propose the smallest useful next step.

## Change Guidance

Before a meaningful change:

- check `git status`
- identify whether the change needs a branch, issue, spec, changelog, or version bump
- avoid destructive migrations/resets without an explicit rollback path
- keep customizations in project-owned files instead of editing global installed tools

After the change:

- report changed files
- report verification evidence
- state whether rollback is a simple revert or needs special handling
- update changelog/release notes only when the project convention calls for it

## Delivery Guidance

Before saying work is ready, capture:

- current branch and whether there are uncommitted changes
- verification commands and results
- artifact paths or release outputs
- skipped checks and residual risk
- rollback path
- whether version/changelog/tag/release note updates are required

## omyKit Repository Versioning

For this repository itself:

- `VERSION` is the current omyKit version.
- `CHANGELOG.md` records user-visible changes.
- Git tags mark released versions. Use `vMAJOR.MINOR.PATCH`.
- Global installs write a manifest under `${CODEX_HOME:-$HOME/.codex}/omykit/install-manifest`.
- Global installs keep backups under `${CODEX_HOME:-$HOME/.codex}/omykit/backups/`.

Install current working tree:

```bash
./scripts/install-global.sh
```

Install a historical omyKit git ref:

```bash
./scripts/install-ref.sh v0.1.0
./scripts/install-ref.sh main
./scripts/install-ref.sh <commit-sha>
```

Restore a previous global omyKit install:

```bash
./scripts/rollback-global.sh latest
./scripts/rollback-global.sh <backup-directory-name>
```

Inspect installed omyKit:

```bash
cat "${CODEX_HOME:-$HOME/.codex}/omykit/install-manifest"
```

## Copyright And Customization

When customizing omyKit or a target project:

- prefer original project-owned instructions over copied third-party text
- keep third-party skill/project references as links or routing guidance
- preserve license and attribution if any substantial third-party content is vendored
- record upstream version or commit when vendoring skills into a project
