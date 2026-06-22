# Artifact Routing

Load only the section for the current deliverable.

## App / Code

- Use CodeGraph for structure and impact when available.
- Use runtime-readiness before checks requiring databases, caches, queues, object storage, browsers, or emulators.
- Use Context7 only for exact current library/API questions.
- Verify with tests/build/lint plus browser or app smoke when user-visible.

## Deck

- Start with audience, objective, narrative, slide count, brand constraints.
- Use imagegen for raster visuals; use Canva/presentations for deck construction.
- Verify rendered slides for overflow, contrast, image quality, and export.

## Video

- Start with platform, duration, aspect ratio, script, assets, export format.
- Use Remotion/ffmpeg for deterministic render when possible.
- Use Computer Use for desktop video apps or export dialogs when no API path exists.
- Verify render, duration, resolution, audio, and key frames.

## Design

- Start with audience, use case, brand personality, platform, constraints.
- Use Cowart/Figma selected context before full design docs.
- Use `frontend-design` for concrete UI creation, `ui-ux-pro-max` for UX/pattern judgment, and `design-taste-frontend` only when visual taste calibration is needed.
- For visually important frontend, choose one primary UI capability first; add narrow skills only for separate gaps such as accessibility, icons, motion, or implementation baseline checks.
- Use imagegen only for bitmap assets or visual references.
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
