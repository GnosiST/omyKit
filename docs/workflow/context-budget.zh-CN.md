# 上下文预算

语言：[English](context-budget.md) | [简体中文](context-budget.zh-CN.md)

omyKit 追求高质量交付，同时降低 token 浪费。

## 递进层级

```text
scan -> focus -> deep
```

## scan

用于路由：

- 根目录指令
- README/docs 索引
- manifests/package scripts
- 文件树
- CodeGraph 摘要
- 选中的 canvas/frame 元数据
- 交付物大纲

## focus

用于实现：

- 精确的 spec/change/task 文件
- 精确的源码文件和测试
- 精确的设计 frame 或 slide 范围
- 精确的库文档
- 精确的命令失败信息

## deep

只在高风险或阻塞时使用：

- 长文档
- 完整日志
- 多张截图/多个视口
- 多个外部来源
- subagent research/review

## 反浪费规则

- 不要为了窄范围变更读取所有 docs。
- 不要让 subagent 重新发现整个 repo。
- 不要加载每一种项目类型参考。
- 不要把原始日志继续向后粘贴。
- 不要把 Strict mode 用在低风险工作上。
- 不要把一次性事实写入持久指令。
