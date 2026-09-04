# Wrapper Filter UI Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace local enrollment-frequency filter dropdown state with the Wrapper dropdown-filter API and align surrounding controls/layout with the recent retention-predictions UI.

**Architecture:** The application entry loads the newer Wrapper once through a provider. `Dashboard` consumes the Wrapper plus its dropdown-filter API, derives available filter values from source data, and keeps only enrollment-specific axis/toggle state locally. Recent-style local Dropdown and SubContainer primitives handle non-filter controls and layout.

**Tech Stack:** React 18, Vite 4, `@paciolan/remote-component`, Recharts, AG Grid, D3.

**Spec:** `docs/superpowers/specs/2026-09-02-wrapper-filter-ui-convergence-design.md`

## Global Constraints

- Preserve forecasting, chart, brushing, melt calculations, and CSV behavior.
- Preserve the custom fetch/CSV patches and `PredictDayToDay` external script.
- Keep React 18 and current chart/grid versions.
- Use Wrapper-native dropdown filtering for categorical data filters.

---

### Task 1: Characterize filter metadata and filtering behavior

**Files:**
- Create: `tests/dashboardFilters.test.js`
- Create: `src/helpers/dashboardFilters.js`
- Modify: `src/helpers/handleDataUpdated.js`

**Interfaces:**
- Produces `getAvailableValuesByField(data, fields)` and `filterDataBySelections(data, fields, isValueChecked)`.
- `handleDataUpdated(data)` continues to produce line metadata while no longer owning local filter Sets.

- [x] Write tests for sorted available values and Wrapper-style checked-value filtering.
- [x] Run tests and verify the new imports fail before implementation.
- [x] Implement the pure helpers and simplify line metadata derivation.
- [x] Run all tests and verify they pass.

### Task 2: Introduce the shared Wrapper boundary and recent UI primitives

**Files:**
- Create: `src/remote/config.js`
- Create: `src/remote/RemoteComponentContext.jsx`
- Create: `src/remote/RemoteComponentProvider.jsx`
- Create: `src/remote/useRemoteComponent.js`
- Create: `src/remote/index.js`
- Create: `src/components/MainContainer.jsx`
- Replace: `src/components/Dropdown.jsx`
- Create: `src/components/SelectDropdown.jsx`
- Move/replace entry: `src/main.jsx`
- Modify: `index.html`

**Interfaces:**
- `useRemoteComponent()` returns the loaded Wrapper component with attached APIs.
- `SelectDropdown` accepts `label`, `options`, `value`, `onChange`, and optional formatter.

- [x] Copy/adapt the provider and primitives from the retention project while keeping React-18-compatible context syntax.
- [x] Update the application entry to load the new Wrapper URL once.
- [x] Update `index.html` to point to `src/main.jsx`.

### Task 3: Migrate Dashboard filters and modernize control composition

**Files:**
- Modify: `src/components/Dashboard.jsx`
- Modify: `src/components/ToggleButton.jsx`
- Modify: `src/components/MeltGrid.jsx`
- Modify: `src/styles/App.css`

**Interfaces:**
- `Dashboard` uses `Wrapper.api.dropdownFilters.DropdownFilter` and `useDropdownFilters`.
- Local X/Y axes continue to use React state through `SelectDropdown`.

- [x] Replace local Set filter state with Wrapper filter state.
- [x] Preserve initial all-values-selected behavior when source data changes.
- [x] Split controls, filters, chart, and melt grid into recent-style subcontainers.
- [x] Keep chart and forecast inputs unchanged.

### Task 4: Remove unreachable legacy UI/filter code and verify

**Files:**
- Delete: `src/components/SingleSelectDropdown.jsx`
- Delete: `src/components/RemoteComponent.jsx`
- Delete: `src/container/Wrapper.jsx`
- Delete: `src/container/main.jsx`
- Delete: `src/helpers/getFilteredData.js`
- Delete: `src/hooks/useResettableState.jsx`
- Modify: `README.md`

**Interfaces:**
- No remaining source import may reference a deleted file.

- [x] Remove unreachable files and update documentation.
- [x] Run all Node tests.
- [x] Parse all JS/JSX source files for syntax errors.
- [x] Check relative-import integrity and unreachable source files.
- [x] Attempt a production build if dependencies are available; report environment limitations otherwise.
