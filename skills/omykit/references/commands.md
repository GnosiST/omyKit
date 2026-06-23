# omyKit Commands

Use this reference only when the entry phrase is ambiguous or the user asks how to invoke omyKit.

## Primary Entries

| User phrase | Entry |
| --- | --- |
| `安装 omyKit`, `帮我安装 omyKit`, `install omyKit` | `maintenance` |
| `更新 omyKit`, `重新安装 omyKit`, `检查 omyKit 版本`, `update omyKit` | `maintenance` |
| `创建工作流`, `初始化 workflow`, `开始追踪任务`, `create workflow` | `controller` |
| `使用 bugfix 模板`, `使用 UI 模板`, `查看 workflow 模板`, `templates list` | `controller` |
| `查看进度`, `工作流状态`, `下一步`, `继续工作流`, `resume workflow` | `controller` |
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
$omykit 初始化项目
$omykit 改造旧项目
$omykit 开始一个需求
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
