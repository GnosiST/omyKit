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
| `使用 bugfix 模板`, `使用 UI 模板`, `使用 PPT 模板`, `查看 workflow 模板`, `templates list` | `controller` |
| `查看进度`, `工作流状态`, `下一步`, `当前节点`, `继续工作流`, `解除阻塞`, `resume workflow`, `unblock workflow` | `controller` |
| `工作流列表`, `切换工作流`, `使用这个 workflow`, `active workflow`, `list workflows` | `controller` |
| `查看编排计划`, `自动编排`, `orchestration plan`, `next action` | `controller` |
| `升级旧工作流`, `迁移历史工作流`, `upgrade workflows`, `migrate workflows` | `controller` |
| `诊断工作流健康`, `检查工作流健康`, `旧项目健康检查`, `doctor`, `workflow health` | `controller` |
| `清理旧工作流残留`, `清理无用 workflow 产物`, `cleanup residue`, `cleanup workflows` | `controller` |
| `交接包`, `上下文包`, `给子智能体的包`, `context pack`, `handoff packet` | `controller` diagnostic; Codex normally generates this internally |
| `记录后台命令`, `记录日志`, `record run`, `background command` | `controller` diagnostic; Codex normally records this internally when recovery needs it |
| `派发计划`, `子智能体执行计划`, `并行执行计划`, `dispatch plan`, `subagent plan` | `controller` diagnostic; automatic orchestration chooses this internally |
| `记录分工`, `记录 agent`, `Agent 通讯录`, `thread assignment`, `assign agent` | `controller` diagnostic; Codex records assignments after real workers exist |
| `scorecard`, `验票`, `审计工作流证据`, `检查证据` | `controller` |
| `生成看板`, `打开看板`, `workflow board`, `visual board` | `controller` |
| `初始化项目`, `新项目`, `从零开始`, `start new project` | `init` |
| `初始化旧项目`, `改造旧项目`, `接入现有项目`, `retrofit` | `retrofit` |
| `开始一个需求`, `做一个功能`, `修 bug`, `重构`, `设计一个页面`, `做 PPT`, `生成 PPT`, `重制 PPT`, `修改 PPT`, `生成提案 deck`, `制作路演 PPT`, `做汇报幻灯片`, `剪视频` | `change` |
| `交付检查`, `发布前检查`, `验收`, `handoff`, `ship it` | `delivery` |
| `收尾`, `整理文档`, `同步知识`, `知识同步`, `neat-freak`, `tidy docs`, `sync up` | `delivery` knowledge sync |
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
$omykit 查看工作流列表
$omykit 切换工作流：<workflow-id>
$omykit 解除阻塞
$omykit 阻塞已解决，继续执行
$omykit 升级旧工作流
$omykit 诊断工作流健康
$omykit 修复工作流健康
$omykit 清理旧工作流残留
$omykit 修 bug：登录后跳转错误
$omykit 做 UI：设置页响应式优化
$omykit 做 PPT：融资路演提案
$omykit 生成 PPT：年度复盘汇报
$omykit 重制 PPT：把旧版季度汇报升级成客户提案
$omykit 修改 PPT：沿用原模板新增产品路线图一页
$omykit 生成提案 deck：新产品发布方案
$omykit 做调研：对比三种数据导出方案
$omykit 交付检查
$omykit 收尾：同步文档和记忆
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
| `execute` | User wants work done, continued, or advanced | Create/resume workflow, run automatic orchestration, start or dispatch ready work internally, perform node work, write handoff, then complete/reject/block |
| `inspect` | User asks for status, next step, board, scorecard, validation, or templates | Run the direct controller command and summarize evidence |
| `skeleton_only` | User explicitly says only create/init/skeleton/no execution | Create workflow files only and return the next command |

## Canonical Controller Commands

Use this table as the single command taxonomy; other docs may list aliases, but these are the stable controller actions.

| Need | Codex chat | Terminal fallback |
| --- | --- | --- |
| Create and keep executing | `$omykit 开始执行：<任务>` | `node scripts/omykit-workflow.mjs init "<任务>"` then loop `resume/orchestrate/work/handoff/complete` |
| Create skeleton only | `$omykit 只创建工作流：<任务>` | `node scripts/omykit-workflow.mjs init "<任务>"` |
| Resume accurately after interruption | `$omykit 继续工作流` | `node scripts/omykit-workflow.mjs resume` then `node scripts/omykit-workflow.mjs orchestrate` |
| Pick among multiple workflows | `$omykit 查看工作流列表` / `$omykit 切换工作流：<id>` | `node scripts/omykit-workflow.mjs workflows` / `workflows use <id>` |
| Show automatic orchestration decision | `$omykit 下一步` / `$omykit 查看编排计划` | `node scripts/omykit-workflow.mjs orchestrate --json` |
| Upgrade old workflow artifacts | `$omykit 升级旧工作流` | `node scripts/omykit-workflow.mjs upgrade --all` |
| Diagnose workflow health | `$omykit 诊断工作流健康` | `node scripts/omykit-workflow.mjs doctor --lang zh-CN` |
| Safely repair health issues | `$omykit 修复工作流健康` | `node scripts/omykit-workflow.mjs doctor --fix --lang zh-CN` |
| Review/archive cleanup candidates | `$omykit 清理旧工作流残留` | `node scripts/omykit-workflow.mjs cleanup --dry-run`, then `cleanup --apply` only after review |
| View evidence board | `$omykit 生成看板并打开` | `node scripts/omykit-workflow.mjs board --open` |

Creating a workflow is not completion. For long tasks, Codex should keep advancing nodes until delivery passes, a real blocker needs the user, or the user explicitly asks to stop. `dispatch-plan`, `context-pack`, `assign`, and `record-run` remain available as controller primitives, but they are not normal user choices.
