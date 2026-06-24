# 安装 Codex Workflow Kit

语言：[English](setup.md) | [简体中文](setup.zh-CN.md)

使用本指南把套件安装到任何项目中。

## Codex-first 安装

首次安装时还没有 `$omykit`，所以直接用普通对话告诉 Codex：

```text
帮我安装 omyKit：https://github.com/GnosiST/omyKit
```

Codex 应该 clone 仓库、运行 `./scripts/install-global.sh`、返回 install manifest，并提醒你打开新的 Codex 线程刷新 skill 列表。全局安装会复制真实文件，不用 symlink 安装 Codex skills。

安装后，日常使用 `$omykit`：

```text
$omykit help
$omykit 初始化项目
$omykit 改造旧项目
$omykit 开始一个需求
$omykit 开始执行：<长任务>
$omykit 继续工作流
$omykit 生成看板并打开
$omykit 查看工作流状态
$omykit 升级旧工作流
$omykit 交付检查
$omykit 更新自己
```

开头的 `$` 是 skill 触发写法的一部分，不是 shell 提示符。

想看常用命令时，直接输入 `$omykit help` 或 `$omykit 帮助`，不需要打开文档。

## 手动全局安装

当 Codex 无法操作本地 shell，或你想逐步检查时，使用这个 fallback：

```bash
git clone https://github.com/GnosiST/omyKit.git
cd omyKit
./scripts/install-global.sh
```

从已有本地 checkout 安装：

```bash
./scripts/install-global.sh
```

然后打开新的 Codex 线程，并在 Codex 对话中输入：

```text
$omykit 初始化项目
```

全局安装是正常路径。它让可复用 workflow 留在单个项目之外，避免把通用 skill 文件复制进每个仓库。

全局安装也会把可选 workflow controller 复制到 `${CODEX_HOME:-$HOME/.codex}/omykit/scripts/`，controller schemas 复制到 `${CODEX_HOME:-$HOME/.codex}/omykit/schemas/`，并把可复用 workflow 模板复制到 `${CODEX_HOME:-$HOME/.codex}/omykit/workflow-templates/`。

## 新项目

1. 通过 Codex 全局安装 omyKit，或使用手动 fallback。
2. 创建或打开目标仓库。
3. 询问 Codex：

```text
$omykit 初始化项目
```

4. 当项目类型、模式、运行时需求和交付门禁不清楚时，让 Codex 询问。
5. 只有在项目选择明确后，才创建项目本地 `AGENTS.md` 和 workflow docs。

## 现有项目

1. 通过 Codex 全局安装 omyKit，或使用手动 fallback。
2. 打开现有仓库。
3. 询问 Codex：

```text
$omykit 改造旧项目
```

4. 审查生成的 project profile，只保留符合现有项目的规则。

## 可选 Repo-Local 副本

只有当项目需要为团队或 CI 环境 vendor workflow 时才使用：

```bash
mkdir -p .codex/skills docs
cp -R /path/to/omyKit/skills/* .codex/skills/
cp -R /path/to/omyKit/docs/workflow docs/workflow
```

非 Codex agent 请使用该 agent 的项目级 skill 目录。只有当项目工具明确把 `.agents/skills/` 映射到当前 agent 时，才把它作为中立 vendor 目录。

然后询问 Codex：

```text
$omykit 初始化项目
```

不要无理由同时保留陈旧的 repo-local 副本和较新的全局副本。

## 推荐 Codex Prompt

新项目：

```text
$omykit 初始化项目
```

现有项目：

```text
$omykit 改造旧项目
```

任意任务：

```text
$omykit 开始一个需求
```

追踪型长任务：

```text
$omykit 开始执行：<任务>
$omykit 继续工作流
```

带本地服务的应用任务：

```text
Before running middleware-dependent checks, use codex-runtime-readiness. Prefer existing Docker Compose or project scripts.
```

完成前：

```text
$omykit 交付检查
```

查看追踪型 workflow：

```text
$omykit 生成看板并打开
$omykit 查看工作流状态
```

旧 workflow 产物：

```text
$omykit 升级旧工作流
```

## 可选 MCP / Plugins

只安装项目真正需要的能力：

- CodeGraph 用于代码地图。
- Context7 用于当前库文档。
- 可选本地压缩能力只用于高容量且可取回原文的 tool output、logs、RAG chunks 或会话交接。
- 平台官方 CLI 只在目标项目需要时接入，例如小程序的微信开发者工具 CLI，或原生移动端/云厂商 CLI。
- Figma 或其他选中的设计来源用于视觉上下文。
- Chrome Extension 或 Playwright 用于浏览器检查。
- Computer Use 只作为本地 GUI fallback：没有官方/专用 connector、MCP/plugin、浏览器自动化、shell/API 路径、项目脚本或平台官方 CLI 能完成任务时才用。
- Canva/presentations/documents/spreadsheets/imagegen/Remotion 用于非代码交付物。
- GitHub/Linear/Sentry/Sonar 或项目已配置的质量工具用于交付和质量工作流。

## 版本管理准备度

对持久项目，在 init 或 retrofit 期间让 omyKit 检查版本管理准备度：

```text
$omykit 初始化项目，并检查版本管理、回滚、历史版本和定制化修改路径
```

检查应识别分支状态、remotes、tags/releases、version files、changelog 或 release notes、rollback path 和项目本地 customization points。结果应与项目风险成比例；不要给临时工作加沉重发布流程。

## 校验

检查：

- 每个 skill 都有 `SKILL.md`
- frontmatter 中有匹配的 `name`
- 每个 skill 都保留必需的 `Language` 段，用于用户语言匹配和私有思维链边界
- 没有未完成 stub
- 在 project profile 专门化之前，docs 保持通用
- 持久项目记录了 versioning 和 rollback expectations
- `./scripts/validate-skills.sh` 通过
- workflow 模板变化时，`node scripts/omykit-workflow.mjs templates validate` 通过
- controller 脚本或 schemas 变化时，`node scripts/test-omykit-workflow.mjs` 通过
- `node ./scripts/validate-docs.mjs` 通过
- `git diff --check` 通过

如果官方 skill validation 因本地 Python 缺少 `PyYAML` 而失败，validation script 会输出一次性环境命令。使用这些命令，或换用已经有该依赖的 Python runtime。
