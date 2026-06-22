# Language Policy

Languages: [English](language-policy.md) | [简体中文](language-policy.zh-CN.md)

omyKit should make visible agent output readable in the user's language.

## Rule

Match user-facing language to the latest user prompt:

- Chinese prompt -> Chinese visible output.
- English prompt -> English visible output.
- Mixed prompt -> use the dominant language, unless the user explicitly asks for another language.
- Preserve code, commands, filenames, API names, proper nouns, and quoted source text in their original form.

## What Should Match

Use the selected language for:

- visible rationale summaries
- plans and status updates
- clarification questions
- assumptions and tradeoffs
- verification summaries
- final handoff
- generated project docs when the user-facing artifact is language-sensitive

## Boundary

Do not expose private chain-of-thought. When the user asks for "thinking" or "reasoning", provide a concise rationale summary, decision log, assumptions, evidence, and next steps in the user's language.

## Handoff

When language choice is ambiguous, state the assumption briefly and continue. If the user corrects the language, switch immediately for subsequent user-facing output.
