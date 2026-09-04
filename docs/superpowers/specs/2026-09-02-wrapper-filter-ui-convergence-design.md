# Wrapper Filter UI Convergence Design

## Goal

Make the enrollment-frequency dashboard use the same shared Wrapper dropdown-filter API and visual control conventions as the newer retention-predictions app, without intentionally changing forecasting, brushing, chart calculations, melt calculations, or export behavior.

## Architecture

Load the newer Wrapper remote once at the application boundary with a provider, then consume the loaded Wrapper and `Wrapper.api.dropdownFilters` from the dashboard. Replace local Set-based filter state and Bootstrap data-attribute dropdowns with the Wrapper's `useDropdownFilters` / `DropdownFilter` API. Keep axis choices as local application controls, implemented with the reusable recent-style dropdown primitive.

## UI

Use small `bg-body rounded shadow-sm` subcontainers on a tertiary page background. Separate local chart controls, Wrapper-backed data filters, the chart, and melt-table actions/grid. Keep the chart itself and its interaction model unchanged.

## Cleanup

Delete the old custom multi-select filter dropdown, old single-select dropdown, local filter helper/state hook if they become unreachable, and the old direct remote-component wrapper files. Preserve the EKU custom fetch/CSV patches and external `PredictDayToDay` integration.

## Compatibility

Keep React 18 and the current chart/grid dependencies. Use the newer Wrapper remote URL and a React-18-compatible context provider (`Context.Provider`) so the host app does not need a dependency migration solely for this UI change.
