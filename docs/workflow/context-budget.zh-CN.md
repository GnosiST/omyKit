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

## 压缩闸门

压缩只应该在缩小范围仍不够时使用。顺序如下：

1. 先避免加载无关内容。
2. 优先使用索引、大纲、符号地图、选中 frame 和项目摘要。
3. 让工具输出更紧凑，例如精确文件范围、`git diff --stat`、具体失败或选中的日志片段。
4. 把大输出整理成本任务的证据摘要后再继续。
5. 只有内容足够大、重复、可取回原文且来源可信时，才使用可选本地压缩。
6. 在精确代码编辑、引用、出处、安全/法律/隐私判断，或任何压缩丢失可能隐藏失败的决策前，必须回到原文。

## 可选本地压缩适用范围

可选本地压缩只适合在缩小范围仍不够时处理大型 tool outputs、JSON arrays、search results、logs、diffs、RAG chunks、长文档、会话交接和输出整形。它不应该成为 omyKit 默认依赖。

小上下文、用户最新指令、凭据或密钥、合规敏感数据、精确源码编辑、法律/医疗/金融事实、引用出处，以及任何省略 warning 会改变结果的输出，都不应使用压缩替代原文。
