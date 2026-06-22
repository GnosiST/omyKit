# omyKit Commands

Use this reference only when the entry phrase is ambiguous or the user asks how to invoke omyKit.

## Primary Entries

| User phrase | Entry |
| --- | --- |
| `初始化项目`, `新项目`, `从零开始`, `start new project` | `init` |
| `初始化旧项目`, `改造旧项目`, `接入现有项目`, `retrofit` | `retrofit` |
| `开始一个需求`, `做一个功能`, `修 bug`, `重构`, `设计一个页面`, `做 PPT`, `剪视频` | `change` |
| `交付检查`, `发布前检查`, `验收`, `handoff`, `ship it` | `delivery` |

## Recommended Prompts

```text
$omykit 初始化项目
$omykit 初始化旧项目
$omykit 开始一个需求
$omykit 交付检查
```

If prompt aliases are enabled:

```text
/prompts:omykit 初始化项目
```

Ask the user to choose entry, project type, and mode only when the phrase cannot be routed safely.
