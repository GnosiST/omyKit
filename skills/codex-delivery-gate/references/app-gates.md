# App Gates

Choose gates by risk and touched surface.

## Minimum Evidence

- Relevant tests or type checks.
- Build/lint when packaging or shared code changed.
- Runtime readiness status for required middleware.
- Browser/app smoke for user-visible behavior.
- Diff hygiene such as whitespace checks.

## Runtime

- Confirm required services are running or unavailable.
- Prefer project scripts/Compose over ad hoc containers.
- State skipped middleware-dependent checks.

## Visual

- Use in-app browser or Playwright for localhost/public web.
- Use Chrome Extension when signed-in Chrome profile or project policy requires it.
- Use Computer Use for local GUI apps such as mobile devtools or emulators when no dedicated tool is available.

## Handoff

Report commands run, results, browser/visual checks, skipped checks, residual risk, and artifact paths.
