# Project-Local Codex Workflow Kit Setup

Language: [English](setup.md) | [简体中文](setup.zh-CN.md)

Use this guide to enable the kit inside any project.

## Codex-First Enablement

For first-time install, `$omykit` is not available yet. Ask Codex in plain language:

```text
Enable omyKit for this project from https://github.com/GnosiST/omyKit
```

Codex should clone the repository, run `./scripts/project-local.sh enable <target-project>`, report the target project's `.omykit/kit/install-manifest`, and tell you to open a fresh Codex thread when the current thread cannot refresh the skill list. Project-local enablement copies real files, does not install Codex skills as symlinks, and writes `.omykit/` plus omyKit-managed `.codex` entry points to the target project's `.git/info/exclude`.

After install, use `$omykit` for normal operation:

```text
$omykit help
$omykit 初始化项目
$omykit 改造旧项目
$omykit 开始一个需求
$omykit 开始执行：<long task>
$omykit 继续工作流
$omykit 生成看板并打开
$omykit 查看工作流状态
$omykit 升级旧工作流
$omykit 诊断工作流健康
$omykit 清理旧工作流残留
$omykit 交付检查
$omykit 查看本项目 omyKit 状态
$omykit 关闭本项目 omyKit
$omykit 启用本项目 omyKit
$omykit 更新本项目 omyKit
```

The leading `$` is part of the skill trigger, not a shell prompt.

Use `$omykit help` or `$omykit 帮助` to get the common command list inside Codex without opening the docs.

## Manual Project-Local Enablement

Use this fallback when Codex cannot operate the local shell or when you want to inspect each step:

```bash
git clone https://github.com/GnosiST/omyKit.git
cd omyKit
./scripts/project-local.sh enable /path/to/target-project
```

From an existing local checkout, inspect, disable, enable, or uninstall:

```bash
./scripts/project-local.sh status /path/to/target-project
./scripts/project-local.sh disable /path/to/target-project
./scripts/project-local.sh enable /path/to/target-project
./scripts/project-local.sh uninstall /path/to/target-project
```

`disable` removes the project Codex skill/prompt entry points while preserving `.omykit` runtime state and historical workflows. `enable` restores those entry points. `uninstall` moves `.omykit` into a local non-project archive for full removal.

Then open a fresh Codex thread and type this in Codex chat:

```text
$omykit 初始化项目
```

Project-local enablement is the normal path. It makes omyKit reversible per project while staying local-only by default through `.git/info/exclude`.

Project-local enablement copies the controller into `.omykit/kit/scripts/`, controller schemas into `.omykit/kit/schemas/`, and reusable workflow templates into `.omykit/kit/workflow-templates/`. Use `./scripts/install-global.sh` only when the user explicitly asks for a global install or the current Codex client cannot load project-local skills.

## New Project

1. Enable omyKit for the current project through Codex, or use the manual fallback.
2. Create or open the target repository.
3. Ask Codex:

```text
$omykit 初始化项目
```

4. Let Codex ask for project type, mode, runtime needs, and delivery gates when they are not clear.
5. Create project-local `AGENTS.md` and workflow docs only after the project choices are known.

## Existing Project

1. Enable omyKit for the current project through Codex, or use the manual fallback.
2. Open the existing repository.
3. Ask Codex:

```text
$omykit 改造旧项目
```

4. Review the generated project profile and keep only rules that match the existing project.

## Optional Explicit Vendor Copy

Use this only when a project explicitly needs to commit workflow skills for a team or CI environment; normal project-local enablement does not require committing these files:

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

Do not keep both a stale vendored copy and a newer project-local `.omykit/kit` copy without a reason.

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

For tracked long work:

```text
$omykit 开始执行：<task>
$omykit 继续工作流
```

For app tasks with local services:

```text
Before running middleware-dependent checks, use codex-runtime-readiness. Prefer existing Docker Compose or project scripts.
```

For completion:

```text
$omykit 交付检查
```

For tracked workflow visibility:

```text
$omykit 生成看板并打开
$omykit 查看工作流状态
```

For old workflow artifacts:

```text
$omykit 升级旧工作流
$omykit 诊断工作流健康
$omykit 清理旧工作流残留
```

Run health diagnosis before cleanup when an existing project has partially upgraded workflows, stale boards, invalid active workflow pointers, or unclear next steps. Cleanup defaults to dry-run and archives safe candidates only when explicitly applied.

## Optional MCP / Plugins

Install only what the project needs:

- CodeGraph for code maps.
- Context7 for current library docs.
- Optional local compression only for high-volume retrievable tool output, logs, RAG chunks, or conversation handoffs.
- Platform official CLIs only when the target project needs them, such as WeChat DevTools CLI for Mini Programs or native mobile/cloud provider CLIs.
- Figma or another selected design source for visual context.
- Chrome Extension or Playwright for browser checks.
- Computer Use only as local GUI fallback when no official/dedicated connector, MCP/plugin, browser automation, shell/API path, project script, or platform official CLI can complete the task.
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
- `node scripts/omykit-workflow.mjs templates validate` passes when workflow templates changed
- `node scripts/test-omykit-workflow.mjs` passes when controller scripts or schemas changed
- `node ./scripts/validate-docs.mjs` passes
- `git diff --check` passes

If official skill validation fails because local Python lacks `PyYAML`, the validation script prints disposable environment commands. Use those commands or another Python runtime that already includes the dependency.
