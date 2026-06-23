---
description: Start, explain, or operate omyKit workflow
argument-hint: help | 帮助 | 初始化项目 | 改造旧项目 | 开始一个需求 | 生成看板 | 查看进度 | 查看模板 | scorecard 验票 | 交付检查 | 更新自己
---

Use $omykit with these user arguments:

$ARGUMENTS

Match user-facing language to the user's prompt. Use concise reasoning summaries instead of private chain-of-thought.

For non-help tasks, run the omyKit intake decision gate before implementation or controller state changes: summarize goal, route, execution shape or template, and material assumptions. If the deliverable, target project, success criteria, risk boundary, runtime constraint, workflow mode, controller need, or template choice is unclear, ask 1-3 concise questions first.

If the arguments are clear, infer safe defaults, state assumptions, and proceed without extra confirmation. When asking, offer suggested choices if useful and allow a custom answer.

If the arguments ask for help, usage, commands, or "怎么用", answer directly with concise omyKit usage groups. Do not start a workflow or run controller commands unless the user also asks for a concrete action.

Use the workflow at task boundaries and meaningful phase changes, not for every individual action.
