# Enrollment Frequency Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Remove dead legacy code and split the active enrollment-frequency dashboard into clearer units without intentional behavior changes.

**Architecture:** Keep the current `main.jsx -> App.jsx -> Dashboard.jsx` application flow and institutional wrapper/build patches. Extract only self-contained responsibilities from `Dashboard` and `MyLineChart`, while deleting files proven unreachable from the active entry point.

**Tech Stack:** React 18, Vite 4, Recharts 2, AG Grid Community, D3, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-02-enrollment-frequency-cleanup-design.md`

## Global Constraints

- Preserve current UI and analytical behavior.
- Preserve the remote wrapper, custom fetch/D3 CSV patches, and `PredictDayToDay` integration.
- Remove `static/` and `static.zip`.
- Do not upgrade dependencies.

---

### Task 1: Remove unreachable scaffold and generated clutter

**Files:**
- Delete: `src/pages/**`, `src/container/routes.jsx`, `src/assets/react.svg`
- Delete: unused helper/hook files identified by the active import graph
- Delete: `static/`, `static.zip`, stale Vite demo output/assets
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: active entry point `/src/container/main.jsx`
- Produces: same application entry graph with no router dependency

- [x] Verify each deletion candidate has no active import.
- [x] Delete unreachable files and generated clutter.
- [x] Remove `wouter` from package metadata.
- [x] Re-run import/reference searches to verify no dangling references.

### Task 2: Extract prediction helpers

**Files:**
- Create: `src/helpers/prediction.js`
- Create: `tests/prediction.test.js`
- Modify: `src/components/Dashboard.jsx`

**Interfaces:**
- Produces: `toPredictionRows(lookup)`, `findLatestPredictionRows(data, latestTerm)`, `createPrediction(Predictor, rows, semestersDescending, weighRecent)`

- [x] Write failing tests for lookup conversion, latest-row lookup, and prediction preparation.
- [x] Run tests and verify failure because helper module does not exist.
- [x] Implement the helpers with the existing Dashboard semantics.
- [x] Run tests and verify pass.
- [x] Replace duplicate inline transformations in `Dashboard.jsx` with helpers.

### Task 3: Extract melt grid and reusable toggle button

**Files:**
- Create: `src/components/MeltGrid.jsx`
- Create: `src/components/ToggleButton.jsx`
- Create: `src/helpers/meltGrid.js`
- Create: `tests/meltGrid.test.js`
- Modify: `src/components/Dashboard.jsx`

**Interfaces:**
- Produces: `getMeltFields(xAxisSelection, semestersDescending)`, `getMeltRows(tableMelt, fields, brushIndexes)`, `createMeltColumnDefs(fields, rowData)`, `MeltGrid`, `ToggleButton`

- [x] Write failing tests for field ordering and brush slicing.
- [x] Verify tests fail before implementation.
- [x] Implement pure melt-grid helpers and make tests pass.
- [x] Move AG Grid/ref/export rendering into `MeltGrid` without changing props sent to AG Grid.
- [x] Replace repeated Dashboard checkbox-button markup with `ToggleButton`.

### Task 4: Remove render-time state side effects and clean chart code

**Files:**
- Modify: `src/components/Dashboard.jsx`
- Modify: `src/components/MyLineChart.jsx`
- Modify: `src/hooks/useResettableState.jsx`
- Delete: `src/hooks/usePreviousState.jsx` when no longer referenced

**Interfaces:**
- `useResettableState(initialState)` keeps its existing `[state, setState]` API.

- [x] Replace Dashboard's `usePreviousState` calls with targeted `useEffect` logic preserving current transitions.
- [x] Change `useResettableState` to reset from `useEffect` when `initialState` changes.
- [x] Remove unused `yMinMax` chart prop and historical commented experiments/TODOs.
- [x] Simplify equivalent conditionals without changing outputs.

### Task 5: Clean utilities/docs and verify

**Files:**
- Modify: `src/utilities/patch.js`, `src/utilities/customCsv.js`, `src/utilities/patchCsv.js`, `src/styles/App.css`, `README.md`

**Interfaces:**
- Preserve existing build patch/public path behavior and browser fetch/CSV patches.

- [x] Remove debug logging and obsolete inline setup/tutorial comments.
- [x] Remove commented CSS experiments.
- [x] Replace stock Vite README with a short project architecture/deployment note.
- [x] Run Node helper tests.
- [x] Attempt dependency installation for ESLint/Vite build; unavailable cache/network prevented a full install, so syntax was verified with `tsc --noResolve` instead.
- [x] Re-scan imports and package references for dead or dangling code.
- [x] Package the cleaned repository as a ZIP.
