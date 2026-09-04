# Enrollment Frequency Dashboard

Interactive day-to-day enrollment dashboard with historical term comparisons, filters, forecasts, melt analysis, and CSV export.

## Application structure

- `src/main.jsx` loads the shared EKU Wrapper once and registers AG Grid modules.
- `src/components/Dashboard.jsx` orchestrates chart state, Wrapper-backed filters, forecasting, and melt mode.
- `src/components/MyLineChart.jsx` renders the Recharts visualization and brush interactions.
- `src/components/MeltGrid.jsx` renders the melt-analysis AG Grid and CSV export.
- `src/helpers/dashboardFilters.js` contains the pure filter-list and filter-application logic used with the Wrapper dropdown-filter API.
- `src/helpers/prediction.js` prepares data for the external `PredictDayToDay` predictor.
- `src/helpers/meltGrid.js` prepares melt-table rows and columns.
- `src/remote/` owns loading and sharing the remote Wrapper component.

## Shared Wrapper filters

The dashboard uses `Wrapper.api.dropdownFilters` for these categorical filters:

- Term
- Level
- Student Type
- Online
- Learner Age

X Axis and Y Axis are application settings rather than data filters, so they use the local reusable dropdown primitive.

## External/runtime integrations

The project intentionally preserves several institutional integrations:

- Remote Wrapper: `https://irserver2.eku.edu/libraries/remote/r19-wrapper.cjs`
- `PredictDayToDay.js` loaded by `index.html`
- Custom D3/CSV fetch patching under `src/utilities/`

## Scripts

```bash
npm run dev
npm test
npm run lint
npm run build
```

`npm run build` retains the project's custom deployment/build behavior.
