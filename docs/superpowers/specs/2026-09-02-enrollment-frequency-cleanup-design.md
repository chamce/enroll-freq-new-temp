# Enrollment Frequency Cleanup Design

## Goal

Reduce clutter and make the enrollment-frequency dashboard easier to understand without intentionally changing its UI, filters, charting, melt-table, CSV export, forecast behavior, institutional wrapper, or custom deployment patches.

## Scope

### Remove proven-dead code and generated clutter

- Remove the unused file-based router and `src/pages/` scaffold.
- Remove hooks/helpers that have no imports from the active application graph.
- Remove Vite demo assets/data that are not referenced.
- Remove stale generated `docs` build output while retaining this cleanup documentation.
- Remove `static/` and `static.zip` as explicitly approved by the user.
- Remove dependencies that are only used by deleted code (`wouter`).

### Refactor active code conservatively

- Move melt-grid rendering/export and its derived grid data out of `Dashboard.jsx` into a focused component.
- Move prediction-row conversion and prediction construction into pure helpers so duplicate lookup transformations disappear from `Dashboard.jsx`.
- Replace repeated checkbox-style toggle button markup with one reusable component.
- Clean `MyLineChart.jsx` by removing historical TODO/commented experiments and its unused `yMinMax` prop; preserve its chart and legend interactions.
- Replace the render-time `usePreviousState` state-reset pattern with normal effects where possible, and simplify `useResettableState` accordingly.
- Remove debugging output and obsolete documentation comments from build utilities while preserving their behavior.

## Non-goals

- Do not redesign the dashboard.
- Do not change institutional URLs, wrapper behavior, custom fetch behavior, custom D3 CSV patching, prediction script integration, chart colors, filters, or metric semantics.
- Do not modernize library versions.
- Do not rewrite the data pipeline.

## Verification

- Add focused Node tests for extracted pure prediction/melt helpers before implementing them.
- Run those tests after each extraction.
- Run ESLint and Vite build when dependencies are available.
- Compare the active import graph after cleanup to ensure deleted files are unreachable and no active imports break.
