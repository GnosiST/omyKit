# Setup Codex Workflow Kit

Use this guide to install the kit into any project.

## Global Install

From this repository:

```bash
./scripts/install-global.sh
```

Then open a fresh Codex thread and use:

```text
$omykit 初始化项目
```

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
$omykit 初始化旧项目
```

4. Review the generated project profile and keep only rules that match the existing project.

## Optional Repo-Local Copy

Use this only when a project needs to vendor the workflow for a team or CI environment:

```bash
mkdir -p .agents/skills docs
cp -R /path/to/omykit/skills/* .agents/skills/
cp -R /path/to/omykit/docs/workflow docs/workflow
```

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
$omykit 初始化旧项目
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
- Cowart or Figma for visual context.
- Chrome Extension or Playwright for browser checks.
- Computer Use for local GUI workflows.
- Canva/presentations/documents/spreadsheets/imagegen/Remotion for non-code artifacts.
- GitHub/Linear/Sentry/CodeRabbit/Sonar/Chromatic for delivery and quality workflows.

## Validation

Check:

- every skill has `SKILL.md`
- frontmatter has matching `name`
- no unfinished stubs remain
- docs are generic until a project profile specializes them
- `git diff --check` passes

If official skill validation fails because local Python lacks `PyYAML`, install the dependency in a disposable environment or use a bundled runtime that includes it.
