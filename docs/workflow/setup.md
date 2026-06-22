# Setup Codex Workflow Kit

Language: [English](setup.md) | [简体中文](setup.zh-CN.md)

Use this guide to install the kit into any project.

## Global Install

From GitHub:

```bash
git clone https://github.com/GnosiST/omyKit.git
cd omyKit
./scripts/install-global.sh
```

From an existing local checkout:

```bash
./scripts/install-global.sh
```

Then open a fresh Codex thread and type this in Codex chat:

```text
$omykit 初始化项目
```

The leading `$` is part of the skill trigger, not a shell prompt.

The global install is the normal path. It keeps the reusable workflow outside individual projects and avoids copying generic skill files into every repository.

## New Project

1. Install omyKit globally.
2. Create or open the target repository.
3. Ask Codex:

```text
$omykit 初始化项目
```

4. Let Codex ask for project type, mode, runtime needs, and delivery gates when they are not clear.
5. Create project-local `AGENTS.md` and workflow docs only after the project choices are known.

## Existing Project

1. Install omyKit globally.
2. Open the existing repository.
3. Ask Codex:

```text
$omykit 改造旧项目
```

4. Review the generated project profile and keep only rules that match the existing project.

## Optional Repo-Local Copy

Use this only when a project needs to vendor the workflow for a team or CI environment:

```bash
mkdir -p .codex/skills docs
cp -R /path/to/omyKit/skills/* .codex/skills/
cp -R /path/to/omyKit/docs/workflow docs/workflow
```

For non-Codex agents, use that agent's project-level skill directory. Keep `.agents/skills/` only as a neutral vendor directory when project tooling explicitly maps it to the active agent.

Then ask Codex:

```text
$omykit 初始化项目
```

Do not keep both a stale repo-local copy and a newer global copy without a reason.

## Recommended Codex Prompt

For new projects:

```text
$omykit 初始化项目
```

For existing projects:

```text
$omykit 改造旧项目
```

For any task:

```text
$omykit 开始一个需求
```

For app tasks with local services:

```text
Before running middleware-dependent checks, use codex-runtime-readiness. Prefer existing Docker Compose or project scripts.
```

For completion:

```text
$omykit 交付检查
```

## Optional MCP / Plugins

Install only what the project needs:

- CodeGraph for code maps.
- Context7 for current library docs.
- Optional local compression only for high-volume retrievable tool output, logs, RAG chunks, or conversation handoffs.
- Figma or another selected design source for visual context.
- Chrome Extension or Playwright for browser checks.
- Computer Use for local GUI workflows.
- Canva/presentations/documents/spreadsheets/imagegen/Remotion for non-code artifacts.
- GitHub/Linear/Sentry/Sonar or project-configured quality tools for delivery and quality workflows.

## Versioning Readiness

For durable projects, ask omyKit to check versioning readiness during init or retrofit:

```text
$omykit 初始化项目，并检查版本管理、回滚、历史版本和定制化修改路径
```

The check should identify branch state, remotes, tags/releases, version files, changelog or release notes, rollback path, and project-local customization points. Keep the result proportional to the project risk; do not add heavy release process to throwaway work.

## Validation

Check:

- every skill has `SKILL.md`
- frontmatter has matching `name`
- every skill keeps the required `Language` section for user-language matching and private chain-of-thought boundaries
- no unfinished stubs remain
- docs are generic until a project profile specializes them
- versioning and rollback expectations are documented for durable projects
- `./scripts/validate-skills.sh` passes
- `node ./scripts/validate-docs.mjs` passes
- `git diff --check` passes

If official skill validation fails because local Python lacks `PyYAML`, the validation script prints disposable environment commands. Use those commands or another Python runtime that already includes the dependency.
