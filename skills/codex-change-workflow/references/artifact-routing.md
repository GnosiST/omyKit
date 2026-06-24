# Artifact Routing

Load only the section for the current deliverable.

## App / Code

- Use CodeGraph for structure and impact when available.
- Use runtime-readiness before checks requiring databases, caches, queues, object storage, browsers, or emulators.
- Use project scripts and platform official CLIs when the project targets a platform with supported automation, such as WeChat DevTools CLI for Mini Program preview/upload/build checks.
- Use Context7 only for exact current library/API questions.
- Verify with tests/build/lint plus browser or app smoke when user-visible.

## Deck

- Start with audience, objective, narrative, slide count, brand constraints.
- Use imagegen for raster visuals; use Canva/presentations for deck construction.
- When native editable PPTX quality cannot be met with bundled presentations, Canva, project templates, or existing PPT tooling, record a `capability_gaps` item and trial a high-signal deck specialist locally or project-locally before changing omyKit routing. `hugohe3/ppt-master` is a candidate for this gap, not a default dependency.
- Verify rendered slides for overflow, contrast, image quality, and export.

## Video

- Start with platform, duration, aspect ratio, script, assets, export format.
- Use Remotion/ffmpeg for deterministic render when possible.
- Use Computer Use for desktop video apps or export dialogs only when no official/dedicated connector, MCP/plugin, browser automation, shell/API path, project script, Remotion, or ffmpeg path exists.
- Verify render, duration, resolution, audio, and key frames.

## Design

- Start with audience, use case, brand personality, platform, constraints.
- Use Figma or selected design-source context before full design docs.
- Use `frontend-design` for concrete UI creation, `critique` for UX/pattern judgment, and `audit` when technical UI checks are required.
- For visually important frontend, choose one primary UI capability first; add high-signal visual specialists only for separate gaps such as taste/anti-generic judgment, complex UI/UX direction, audit, responsive adaptation, copy, hardening, onboarding, durable design-context capture, design-system extraction, motion, or GSAP implementation. Handle accessibility, metadata, icons, and performance through project-native checks and targeted code fixes unless the user explicitly requests a trusted specialist.
- Use imagegen only for bitmap assets or visual references.
- Use Computer Use for local design apps, OS dialogs, or export panels only when Figma/Canva/presentations/imagegen/browser automation/project files or another dedicated path cannot complete the task.
- Verify responsive layout, text overflow, accessibility, and visual consistency.

## Research / Docs

- Start with research question, audience, source quality, citation needs.
- Use web/current sources for volatile facts.
- For product/PM method work, add discovery, PRD, launch, pre-mortem, acceptance, or test-scenario structure without copying third-party templates.
- Verify citations, date clarity, and claims.

## Data

- Start with question, dataset, schema, output format.
- Prefer parsers and spreadsheet APIs over ad hoc text processing.
- Verify formulas, row counts, chart labels, and export.
