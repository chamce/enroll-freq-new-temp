import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { csv } from "d3";

import { constants } from "../constants";
import {
  filterDataBySelections,
  getAvailableValuesByField,
} from "../helpers/dashboardFilters";
import { flattenData } from "../helpers/flattenData";
import { formatKey } from "../helpers/formatKey";
import { getChartData } from "../helpers/getChartData";
import { getReferenceLines } from "../helpers/getReferenceLines";
import { handleDataUpdated } from "../helpers/handleDataUpdated";
import { meltFn } from "../helpers/meltFn";
import {
  createPrediction,
  findLatestPredictionRows,
  toPredictionRows,
} from "../helpers/prediction";
import { usePromise } from "../hooks/usePromise";
import { useRemoteComponent } from "../remote";
import MainContainer from "./MainContainer";
import { MeltGrid } from "./MeltGrid";
import { MyLineChart } from "./MyLineChart";
import SelectDropdown from "./SelectDropdown";
import { ToggleButton } from "./ToggleButton";

const {
  yAxisOptions,
  dropdownKeys,
  groupByKey,
  yAxisLabel,
  xAxisKeys,
  dateKeys,
  url,
} = constants;

const { SubContainer } = MainContainer;
const dataPromise = csv(url);
const Predictor = window.PredictDayToDay;

export const Dashboard = () => {
  const Wrapper = useRemoteComponent();
  const { DropdownFilter, useDropdownFilters } = Wrapper.api.dropdownFilters;

  const data = usePromise(dataPromise);
  const [tooltipOn, setTooltipOn] = useState(true);
  const [forecastOn, setForecastOn] = useState(false);
  const [weighRecent, setWeighRecent] = useState(true);
  const [meltFromZero, setMeltFromZero] = useState(true);
  const [xAxisSelection, setXAxisSelection] = useState(xAxisKeys[0]);
  const [yAxisSelection, setYAxisSelection] = useState(yAxisOptions[0]);
  const [brushIndexes, setBrushIndexes] = useState({
    startIndex: 0,
    endIndex: 1,
  });
  const [brushing, setBrushing] = useState(false);
  const [hoverLookup, setHoverLookup] = useState(null);

  useEffect(() => {
    if (yAxisSelection === "melt") setXAxisSelection("days");
  }, [yAxisSelection]);

  useEffect(() => {
    if (xAxisSelection === "date") {
      setYAxisSelection((current) =>
        current === "melt" ? "each_day" : current,
      );
    }
  }, [xAxisSelection]);

  const deferredTooltipOn = useDeferredValue(tooltipOn);
  const deferredXAxisSelection = useDeferredValue(xAxisSelection);
  const deferredYAxisSelection = useDeferredValue(yAxisSelection);

  const availableValuesByField = useMemo(
    () => getAvailableValuesByField(data, dropdownKeys),
    [data],
  );

  const dropdownFilters = useDropdownFilters({ availableValuesByField });

  useEffect(() => {
    for (const field of dropdownKeys) {
      const values = availableValuesByField[field] ?? [];
      dropdownFilters.uncheckEverything(field);
      dropdownFilters.setValuesChecked({ field, values, checked: true });
    }
  }, [
    availableValuesByField,
    dropdownFilters.setValuesChecked,
    dropdownFilters.uncheckEverything,
  ]);

  const filteredData = useMemo(
    () =>
      filterDataBySelections(
        data,
        dropdownKeys,
        dropdownFilters.isValueChecked,
      ),
    [
      data,
      dropdownFilters.filtersState,
      dropdownFilters.isValueChecked,
    ],
  );

  const { lines, lineDataKeySet } = useMemo(
    () => handleDataUpdated(data),
    [data],
  );

  const chartData = useMemo(
    () =>
      getChartData(
        filteredData,
        deferredXAxisSelection,
        dateKeys.includes(deferredXAxisSelection),
      ),
    [filteredData, deferredXAxisSelection],
  );

  const flattenedData = useMemo(
    () =>
      flattenData(
        dateKeys.includes(deferredXAxisSelection),
        deferredXAxisSelection,
        deferredYAxisSelection === "melt"
          ? "daily_change"
          : deferredYAxisSelection,
        chartData,
      ),
    [deferredXAxisSelection, deferredYAxisSelection, chartData],
  );

  const semestersDescending = useMemo(
    () =>
      [...lineDataKeySet].sort(
        (semesterA, semesterB) =>
          Number(semesterB.split(" ")[1]) -
          Number(semesterA.split(" ")[1]),
      ),
    [lineDataKeySet],
  );

  const referenceLines = useMemo(
    () =>
      getReferenceLines({
        xAxis: deferredXAxisSelection,
        data: flattenedData,
        lines,
      }),
    [flattenedData, deferredXAxisSelection, lines],
  );

  const meltStart =
    brushIndexes.startIndex === undefined || meltFromZero
      ? 0
      : brushIndexes.startIndex;

  const tableMelt = useMemo(
    () => meltFn(flattenedData, meltStart, brushIndexes.endIndex),
    [flattenedData, meltStart, brushIndexes.endIndex],
  );

  const shouldMelt =
    deferredXAxisSelection === "days" && deferredYAxisSelection === "melt";
  const chartDataset = shouldMelt ? tableMelt : flattenedData;
  const [lockedData, setLockedData] = useState(chartDataset);

  useEffect(() => {
    if (!brushing) setLockedData(chartDataset);
  }, [chartDataset, brushing]);

  useEffect(() => {
    setBrushIndexes({ startIndex: undefined, endIndex: undefined });
  }, [flattenedData]);

  useEffect(() => {
    setMeltFromZero(true);
  }, [shouldMelt]);

  const onPointerDownCapture = (event) => {
    const targetClasses = event.target.classList;
    const parentClasses = event.target.parentElement?.classList;

    if (
      parentClasses?.contains("recharts-brush-traveller") ||
      targetClasses.contains("recharts-brush-slide")
    ) {
      setBrushing(true);
    }
  };

  const hoverRows = toPredictionRows(hoverLookup ?? {});
  const hoverDaysOut = hoverRows[0]?.days_out ?? null;

  const latestTerm = semestersDescending[0];
  const latestRows = findLatestPredictionRows(lockedData, latestTerm);
  const latestDaysOut = latestRows[0]?.days_out ?? null;

  const freezePrediction = !forecastOn;
  const forecastActive = freezePrediction || hoverLookup !== null;
  const predictionRows =
    Number(hoverDaysOut) > Number(latestDaysOut) || freezePrediction
      ? latestRows
      : hoverRows;

  const prediction = forecastActive
    ? createPrediction(
        Predictor,
        predictionRows,
        semestersDescending,
        weighRecent,
      )
    : null;
  const bestPrediction = createPrediction(
    Predictor,
    latestRows,
    semestersDescending,
    weighRecent,
  );

  const shouldPredict =
    xAxisSelection === "days" && yAxisSelection === "each_day";
  const note = bestPrediction ? bestPrediction.notes.join(" ") : "";

  const renderDropdownFilter = (field) => (
    <DropdownFilter
      availableValues={availableValuesByField[field] ?? []}
      filters={dropdownFilters}
      label={formatKey(field)}
      className="d-grid flex-fill"
      field={field}
      key={field}
    />
  );

  return (
    <Wrapper
      heading={`${formatKey(yAxisLabel)} by ${formatKey(
        deferredXAxisSelection,
      )} & ${formatKey(groupByKey)}`}
      onPointerUpCapture={() => setBrushing(false)}
    >
      <SubContainer className="d-flex flex-wrap gap-2">
        <SelectDropdown
          formatValue={formatKey}
          onChange={setXAxisSelection}
          value={xAxisSelection}
          options={xAxisKeys}
          label="X Axis"
        />
        <SelectDropdown
          formatValue={formatKey}
          onChange={setYAxisSelection}
          value={yAxisSelection}
          options={yAxisOptions}
          label="Y Axis"
        />
        <ToggleButton active={tooltipOn} setActive={setTooltipOn}>
          Tooltip
        </ToggleButton>
        {shouldPredict && (
          <>
            <ToggleButton active={forecastOn} setActive={setForecastOn}>
              Hover forecast
            </ToggleButton>
            <ToggleButton
              active={weighRecent}
              setActive={setWeighRecent}
              className="my-tooltip"
              tooltip={note}
            >
              Weigh recent terms more
            </ToggleButton>
          </>
        )}
        {shouldMelt && (
          <ToggleButton active={meltFromZero} setActive={setMeltFromZero}>
            Melt from day 0
          </ToggleButton>
        )}
      </SubContainer>

      <SubContainer className="d-flex flex-wrap gap-2">
        {dropdownKeys.map(renderDropdownFilter)}
      </SubContainer>

      <SubContainer>
        <div onPointerDownCapture={onPointerDownCapture}>
          <MyLineChart
            onHoverLookupChange={setHoverLookup}
            brushStart={shouldMelt ? brushIndexes.startIndex : undefined}
            brushEnd={shouldMelt ? brushIndexes.endIndex : undefined}
            referenceLines={shouldMelt ? [] : referenceLines}
            yAxisSelection={deferredYAxisSelection}
            xAxisSelection={deferredXAxisSelection}
            setBrushIndexes={setBrushIndexes}
            tooltipOn={deferredTooltipOn}
            melting={shouldMelt}
            data={lockedData}
            lines={lines}
            prediction={
              shouldPredict && prediction && !isNaN(prediction.final.value)
                ? prediction.final
                : {}
            }
            bestPrediction={
              shouldPredict && bestPrediction ? bestPrediction.final : {}
            }
          />
        </div>
      </SubContainer>

      {shouldMelt && (
        <MeltGrid
          brushIndexes={brushIndexes}
          semestersDescending={semestersDescending}
          tableMelt={tableMelt}
          xAxisSelection={deferredXAxisSelection}
        />
      )}
    </Wrapper>
  );
};
