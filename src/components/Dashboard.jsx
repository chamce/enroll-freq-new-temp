import { useDeferredValue, useCallback, useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { csv } from "d3";

import { getReferenceLines } from "../helpers/getReferenceLines";
import { handleDataUpdated } from "../helpers/handleDataUpdated";
import { useResettableState } from "../hooks/useResettableState";
import { SingleSelectDropdown } from "./SingleSelectDropdown";
import { usePreviousState } from "../hooks/usePreviousState";
import { getFilteredData } from "../helpers/getFilteredData";
import { getChartData } from "../helpers/getChartData";
import { flattenData } from "../helpers/flattenData";
import { formatKey } from "../helpers/formatKey";
import { usePromise } from "../hooks/usePromise";
import { MyLineChart } from "./MyLineChart";
import { meltFn } from "../helpers/meltFn";
import { constants } from "../constants";
import { Dropdown } from "./Dropdown";
import { Checkbox } from "./Checkbox";
import Wrapper from "../container/Wrapper";

const { yAxisOptions, groupByKey, yAxisLabel, xAxisKeys, dateKeys, url } = constants;

const promise = csv(url);

const Predict = window.PredictDayToDay;

// console.log(Predict);

// let dat = [
//   { term: "F22", days_out: -64, value: 9390, final: 14324 },
//   { term: "F23", days_out: -64, value: 10571, final: 15008 },
//   { term: "F24", days_out: -64, value: 11717, final: 15673 },
//   { term: "F25", days_out: -64, value: 11952, final: 15969 },
//   { term: "F26", days_out: -64, value: 11905, final: null },
// ];

//  const dp = new Predict(dat, (stdev = 3), (weigh_recent = false));
// console.log("dp.final=", dp.final);

export const Dashboard = () => {
  const data = usePromise(promise);
  const [tooltipOn, setTooltipOn] = useState(true);
  const [meltFromZero, setMeltFromZero] = useState(true);
  const [xAxisSelection, setXAxisSelection] = useState(xAxisKeys[0]);
  const [yAxisSelection, setYAxisSelection] = useState(yAxisOptions[0]);
  const [brushIndexes, setBrushIndexes] = useState({ startIndex: 0, endIndex: 1 });

  const gridRef = useRef();

  const onBtnExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);

  usePreviousState(yAxisSelection, () => {
    if (yAxisSelection === "melt") {
      setXAxisSelection("days");
    }
  });

  usePreviousState(xAxisSelection, () => {
    if (xAxisSelection === "date" && yAxisSelection === "melt") {
      setYAxisSelection("each_day");
    }
  });

  const deferredTooltipOn = useDeferredValue(tooltipOn);
  const deferredXAxisSelection = useDeferredValue(xAxisSelection);
  const deferredYAxisSelection = useDeferredValue(yAxisSelection);

  const [initialDropdowns, dropdownArrays, lines, lineDataKeySet] = useMemo(() => handleDataUpdated(data), [data]);

  const [dropdowns, setDropdowns] = useResettableState(initialDropdowns);

  const deferredDropdowns = useDeferredValue(dropdowns);

  const filteredData = useMemo(() => getFilteredData(data, deferredDropdowns), [data, deferredDropdowns]);

  const chartData = useMemo(
    () => getChartData(filteredData, deferredXAxisSelection, dateKeys.includes(deferredXAxisSelection)),
    [filteredData, deferredXAxisSelection],
  );

  const flattenedData = useMemo(
    () =>
      flattenData(
        dateKeys.includes(deferredXAxisSelection),
        deferredXAxisSelection,
        deferredYAxisSelection === "melt" ? "daily_change" : deferredYAxisSelection,
        chartData,
      ),
    [deferredXAxisSelection, deferredYAxisSelection, chartData],
  );

  const semestersDescending = [...lineDataKeySet].sort(
    (semesterA, semesterB) => Number(semesterB.split(" ")[1]) - Number(semesterA.split(" ")[1]),
  );

  const referenceLines = useMemo(
    () => getReferenceLines({ xAxis: deferredXAxisSelection, data: flattenedData, lines }),
    [flattenedData, deferredXAxisSelection, lines],
  );

  const meltStart = brushIndexes.startIndex === undefined || meltFromZero ? 0 : brushIndexes.startIndex;

  const tableMelt = useMemo(
    () => meltFn(flattenedData, meltStart, brushIndexes.endIndex),
    [flattenedData, meltStart, brushIndexes.endIndex],
  );

  const shouldMelt = deferredXAxisSelection === "days" && deferredYAxisSelection === "melt";

  const chartDataset = shouldMelt ? tableMelt : flattenedData;

  const [brushing, setBrushing] = useState(false);

  const [lockedData, setLockedData] = useState(chartDataset);

  usePreviousState(chartDataset, () => !brushing && setLockedData(chartDataset));

  usePreviousState(brushing, (prevBrushing) => prevBrushing && setLockedData(chartDataset));

  const updateBrushIndexes = () => setBrushIndexes({ startIndex: undefined, endIndex: undefined });

  usePreviousState(flattenedData, updateBrushIndexes);

  const fields = useMemo(
    () => new Set([deferredXAxisSelection, ...[...semestersDescending].reverse()]),
    [deferredXAxisSelection, semestersDescending],
  );

  const rowData = useMemo(
    () =>
      tableMelt
        .map((object) => Object.fromEntries(Object.entries(object).filter(([field]) => fields.has(field))))
        .slice(
          brushIndexes.startIndex ? brushIndexes.startIndex : 0,
          brushIndexes.endIndex ? brushIndexes.endIndex + 1 : undefined,
        ),
    [tableMelt, fields, brushIndexes.startIndex, brushIndexes.endIndex],
  );

  usePreviousState(shouldMelt, () => setMeltFromZero(true));

  const colDefs = useMemo(() => {
    if (!shouldMelt) return [];

    const valueFormatter = ({ value }) => value?.toLocaleString();

    const colorCellBgGreen = (params) => {
      const {
        colDef: { field },
        rowIndex,
        value,
      } = params;

      if (rowIndex > 0) {
        return rowData[rowIndex - 1] && value > rowData[rowIndex - 1][field];
      }
    };

    const colorCellBgRed = (params) => {
      const {
        colDef: { field },
        rowIndex,
        value,
      } = params;

      if (rowIndex > 0) {
        return rowData[rowIndex - 1] && value < rowData[rowIndex - 1][field];
      }
    };

    const cellClassRules = {
      "bg-success-subtle": colorCellBgGreen,
      "bg-danger-subtle": colorCellBgRed,
    };

    return [...fields].map((field, index) =>
      index === 0
        ? { valueFormatter, flex: 1, field }
        : { type: "numericColumn", valueFormatter, cellClassRules, flex: 2, field },
    );
  }, [rowData, fields, shouldMelt]);

  const onPointerDownCapture = (e) => {
    if (
      [...e.target.parentElement.classList].includes("recharts-brush-traveller") ||
      [...e.target.classList].includes("recharts-brush-slide")
    ) {
      setBrushing(true);
    }
  };

  const onPointerUpCapture = () => setBrushing(false);

  const [mouseMoveEvent, setMouseMoveEvent] = useState(null);

  const activePayload =
    mouseMoveEvent && Array.isArray(mouseMoveEvent.activePayload) ? mouseMoveEvent.activePayload : [];

  const arr = activePayload.map(({ name, payload: { lookup } }) => {
    const obj = lookup[name];

    const [term, days_out, value, final] = [name, obj?.days, obj?._FREQ__each_day, obj?.Official_each_day];

    return { term, days_out, value, final };
  });

  const prediction = getPrediction(arr, semestersDescending);

  const onMouseMove = (e) => setMouseMoveEvent(e);

  return (
    <Wrapper
      heading={`${formatKey(yAxisLabel)} by ${formatKey(deferredXAxisSelection)} & ${formatKey(groupByKey)}`}
      onPointerUpCapture={onPointerUpCapture}
    >
      <div className="hstack flex-wrap gap-3 text-nowrap">
        {Object.keys(dropdowns).map((key) => (
          <Dropdown values={dropdownArrays[key]} setState={setDropdowns} state={dropdowns[key]} dataKey={key} key={key}>
            {formatKey(key)}
          </Dropdown>
        ))}
        <SingleSelectDropdown setState={setXAxisSelection} state={xAxisSelection} dataKeys={xAxisKeys}>
          X Axis
        </SingleSelectDropdown>
        <SingleSelectDropdown setState={setYAxisSelection} dataKeys={yAxisOptions} state={yAxisSelection}>
          Y Axis
        </SingleSelectDropdown>
        <div className="col">
          <button
            className="btn btn-light btn-solid icon-link d-flex justify-content-center align-items-center w-100"
            onClick={() => setTooltipOn((condition) => !condition)}
            data-bs-auto-close="outside"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            type="button"
          >
            <Checkbox active={tooltipOn}></Checkbox>
            Tooltip
          </button>
        </div>
        {shouldMelt && (
          <div className="col">
            <button
              className="btn btn-light btn-solid icon-link d-flex justify-content-center align-items-center w-100"
              onClick={() => setMeltFromZero((condition) => !condition)}
              data-bs-auto-close="outside"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              type="button"
            >
              <Checkbox active={meltFromZero}></Checkbox>
              Melt from day 0
            </button>
          </div>
        )}
      </div>
      <div onPointerDownCapture={onPointerDownCapture}>
        <MyLineChart
          onMouseMove={onMouseMove}
          brushStart={shouldMelt ? brushIndexes.startIndex : undefined}
          brushEnd={shouldMelt ? brushIndexes.endIndex : undefined}
          referenceLines={shouldMelt ? [] : referenceLines}
          yAxisSelection={deferredYAxisSelection}
          xAxisSelection={deferredXAxisSelection}
          setBrushIndexes={setBrushIndexes}
          yMinMax={["dataMin", "auto"]}
          tooltipOn={deferredTooltipOn}
          melting={shouldMelt}
          data={lockedData}
          lines={lines}
          prediction={prediction && !isNaN(prediction.final.value) ? prediction.final : {}}
        ></MyLineChart>
      </div>
      <div></div>
      {shouldMelt && (
        <div>
          <button className="btn btn-success" onClick={onBtnExport} type="button">
            Download CSV export file
          </button>
        </div>
      )}
      {shouldMelt && (
        <div className="ag-theme-balham" style={{ height: 500 }}>
          <AgGridReact columnDefs={colDefs} rowData={rowData} ref={gridRef} />
        </div>
      )}
    </Wrapper>
  );
};

const getPrediction = (arr, semestersDescending) => {
  if (arr.length > 0) {
    const last = arr[arr.length - 1];

    if (last.term === semestersDescending[0]) {
      const newArr = arr.map((el) => {
        if (el === last) {
          return { ...last, final: null };
        }

        return el;
      });

      return new Predict(newArr);
    }
  }
};
