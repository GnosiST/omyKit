# Delivery Gates

Use gates by artifact type. Do not run irrelevant gates.

## App / Code

- Relevant tests/type checks.
- Build/lint when shared code or packaging changed.
- Runtime readiness for middleware-dependent checks.
- Browser/app smoke for user-visible behavior.
- Version, changelog, rollback, and migration status when the change is durable or release-bound.
- Diff hygiene.

## Deck

- Slide count and outline match brief.
- No text overflow or clipping.
- Brand and image consistency.
- Export opens correctly.

## Video

- Duration, aspect ratio, frame rate, resolution.
- Audio and captions if expected.
- Key frames match storyboard.
- Export opens and plays.

## Design

- Audience/use case/brand fit.
- Responsive layout.
- Text overflow.
- Accessibility basics.
- Generated bitmap assets saved in project when referenced.

## Research / Docs

- Claims answer the research question.
- Sources are cited.
- Time-sensitive facts are dated.
- Unknowns are explicit.

## Data

- Input files and row counts identified.
- Cleaning/transforms documented.
- Formulas/charts checked.
- Export opens in target tool.

## Completion Statement

Final handoff should include:
- artifacts changed or created
- verification run
- skipped checks
- residual risk
- suggested next step when useful
