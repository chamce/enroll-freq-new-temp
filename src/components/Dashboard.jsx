import { useDeferredValue, useState, useMemo } from "react";
import { csv } from "d3";

import { getReferenceLines } from "../helpers/getReferenceLines";
import { handleDataUpdated } from "../helpers/handleDataUpdated";
import { useResettableState } from "../hooks/useResettableState";
import { SingleSelectDropdown } from "./SingleSelectDropdown";
import { usePreviousState } from "../hooks/usePreviousState";
import { getFilteredData } from "../helpers/getFilteredData";
import { getChartData } from "../helpers/getChartData";
import { flattenData } from "../helpers/flattenData";
import { getYDomain } from "../helpers/getYDomain";
import { formatKey } from "../helpers/formatKey";
import { usePromise } from "../hooks/usePromise";
import { MyLineChart } from "./MyLineChart";
import { constants } from "../constants";
import { Checkbox } from "./Checkbox";
import { Dropdown } from "./Dropdown";

const { yAxisOptions, groupByKey, yAxisLabel, xAxisKeys, dateKeys, url } = constants;

const promise = csv(url);

export const Dashboard = () => {
  const data = usePromise(promise);
  const [zoomOn, setZoomOn] = useState(true);
  const [tooltipOn, setTooltipOn] = useState(true);
  const [xAxisSelection, setXAxisSelection] = useState(xAxisKeys[0]);
  const [yAxisSelection, setYAxisSelection] = useState(yAxisOptions[0]);
  const [brushIndexes, setBrushIndexes] = useState({ startIndex: 0, endIndex: 1 });

  const deferredZoomOn = useDeferredValue(zoomOn);
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
      flattenData(dateKeys.includes(deferredXAxisSelection), deferredXAxisSelection, deferredYAxisSelection, chartData),
    [deferredXAxisSelection, deferredYAxisSelection, chartData],
  );

  const updateBrushIndexes = () => setBrushIndexes({ endIndex: flattenedData.length - 1, startIndex: 0 });

  usePreviousState(flattenedData, updateBrushIndexes);

  const yMinMax = useMemo(
    () => getYDomain(flattenedData, brushIndexes, lineDataKeySet),
    [flattenedData, brushIndexes, lineDataKeySet],
  );

  const referenceLines = useMemo(
    () => getReferenceLines({ xAxis: deferredXAxisSelection, data: flattenedData, lines }),
    [flattenedData, deferredXAxisSelection, lines],
  );

  // console.log(chartData, flattenedData);

  return (
    <div className="vstack gap-4">
      <h1 className="text-center">
        {formatKey(yAxisLabel)} by {formatKey(deferredXAxisSelection)} & {formatKey(groupByKey)}
      </h1>
      <div className="hstack flex-wrap gap-3">
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
        <div className="col">
          <button
            className="btn btn-light btn-solid icon-link d-flex justify-content-center align-items-center w-100"
            onClick={() => setZoomOn((condition) => !condition)}
            data-bs-auto-close="outside"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            type="button"
          >
            <Checkbox active={zoomOn}></Checkbox>
            Zoom
          </button>
        </div>
      </div>
      <MyLineChart
        yMinMax={deferredZoomOn ? yMinMax : [0, "auto"]}
        yAxisSelection={deferredYAxisSelection}
        xAxisSelection={deferredXAxisSelection}
        setBrushIndexes={setBrushIndexes}
        referenceLines={referenceLines}
        tooltipOn={deferredTooltipOn}
        data={flattenedData}
        lines={lines}
      ></MyLineChart>
    </div>
  );
};

/*
  TODO place in new wrapper due to remote module console bug
  */
