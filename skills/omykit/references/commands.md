# omyKit Commands

Use this reference only when the entry phrase is ambiguous or the user asks how to invoke omyKit.

## Primary Entries

| User phrase | Entry |
| --- | --- |
| `help`, `帮助`, `怎么用`, `有哪些命令`, `how to use omyKit` | Answer directly with concise help; do not start a workflow |
| `安装 omyKit`, `帮我安装 omyKit`, `install omyKit` | `maintenance` |
| `更新 omyKit`, `重新安装 omyKit`, `检查 omyKit 版本`, `update omyKit` | `maintenance` |
| `开始执行`, `创建并执行工作流`, `跑完整个工作流`, `推进工作流`, `continue execution` | `controller` execute |
| `创建工作流`, `初始化 workflow`, `开始追踪任务`, `create workflow` | `controller` execute unless user says skeleton only |
| `只创建工作流`, `只初始化 workflow`, `先建骨架`, `不要执行`, `skeleton only` | `controller` skeleton only |
| `使用 bugfix 模板`, `使用 UI 模板`, `查看 workflow 模板`, `templates list` | `controller` |
| `查看进度`, `工作流状态`, `下一步`, `当前节点`, `继续工作流`, `解除阻塞`, `resume workflow`, `unblock workflow` | `controller` |
| `派发计划`, `子智能体执行计划`, `并行执行计划`, `dispatch plan`, `subagent plan` | `controller` |
| `scorecard`, `验票`, `审计工作流证据`, `检查证据` | `controller` |
| `生成看板`, `打开看板`, `workflow board`, `visual board` | `controller` |
| `初始化项目`, `新项目`, `从零开始`, `start new project` | `init` |
| `初始化旧项目`, `改造旧项目`, `接入现有项目`, `retrofit` | `retrofit` |
| `开始一个需求`, `做一个功能`, `修 bug`, `重构`, `设计一个页面`, `做 PPT`, `剪视频` | `change` |
| `交付检查`, `发布前检查`, `验收`, `handoff`, `ship it` | `delivery` |
| `版本管理`, `回滚`, `历史版本`, `定制化修改`, `release readiness` | Route by task stage, then include `codex-version-readiness` |

## Recommended Prompts

These are Codex chat prompts, not shell commands.

```text
$omykit help
$omykit 帮助
$omykit 初始化项目
$omykit 改造旧项目
$omykit 开始一个需求
$omykit 开始执行：实现登录页
$omykit 创建并执行工作流：测试 MVP1 角色权限
$omykit 只创建工作流：整理发布计划
$omykit 继续工作流
$omykit 推进下一步
$omykit 派发计划
$omykit 子智能体执行计划
$omykit 解除阻塞
$omykit 阻塞已解决，继续执行
$omykit 修 bug：登录后跳转错误
$omykit 做 UI：设置页响应式优化
$omykit 做调研：对比三种数据导出方案
$omykit 交付检查
$omykit 生成看板并打开
$omykit 查看工作流状态
$omykit 更新自己
```

If prompt aliases are enabled:

```text
/prompts:omykit 初始化项目
```

Ask the user to choose entry, project type, and mode only when the phrase cannot be routed safely. When asking, always allow a custom answer.

## Controller Intent Split

| Intent | Use when | Codex behavior |
| --- | --- | --- |
| `execute` | User wants work done, continued, or advanced | Create/resume workflow, start the ready node, perform node work, write handoff, then complete/reject/block |
| `inspect` | User asks for status, next step, board, scorecard, validation, or templates | Run the direct controller command and summarize evidence |
| `skeleton_only` | User explicitly says only create/init/skeleton/no execution | Create workflow files only and return the next command |

Creating a workflow is not completion. For long tasks, Codex should keep advancing nodes until delivery passes, a real blocker needs the user, or the user explicitly asks to stop.
