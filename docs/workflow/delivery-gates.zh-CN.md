# 交付门禁

语言：[English](delivery-gates.md) | [简体中文](delivery-gates.zh-CN.md)

按交付物类型使用门禁。不要运行无关门禁。

## App / Code

- 相关测试/type checks。
- 共享代码或打包变更时运行 build/lint。
- 中间件相关检查前确认 runtime readiness。
- 用户可见行为需要 browser/app smoke。
- 持久或发布相关变更需要说明 version、changelog、rollback 和 migration 状态。
- diff hygiene。

## Deck

- slide 数量和大纲匹配 brief。
- 没有文本溢出或裁切。
- 品牌和图片一致。
- 导出文件可以打开。

## Video

- 时长、宽高比、帧率、分辨率。
- 如果需要，检查音频和字幕。
- 关键帧匹配 storyboard。
- 导出文件可以打开和播放。

## Design

- 符合受众、使用场景和品牌。
- 响应式布局。
- 文本不溢出。
- 基础可访问性。
- 引用生成位图资产时，资产已保存到项目中。

## Research / Docs

- 结论回答研究问题。
- 引用了来源。
- 时效性事实标明日期。
- 明确未知项。

## Data

- 识别输入文件和行数。
- 记录清洗/转换过程。
- 检查公式/图表。
- 导出文件可在目标工具中打开。

## 完成说明

最终 handoff 应包括：

- 改动或创建的交付物
- 运行的验证
- 跳过的检查
- 剩余风险
- 当 `.omykit/workflows/` 启用时，说明 controller workflow 状态、failed/blocked 节点、handoff 证据和跳过的 required gates
- 追踪型交付的 `knowledge_sync` 状态：`completed`、`not_needed`，或带原因的 `deferred`
- 有价值时给出下一步建议

只有当 README、docs、AGENTS/CLAUDE 规则、workflow handoff 或 agent 记忆可能过期时，才使用 `neat-freak` 或等价知识同步检查。不要每个节点都运行。
