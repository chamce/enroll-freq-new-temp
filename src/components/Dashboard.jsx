import { useDeferredValue, useState, useMemo } from "react";
import { csv } from "d3";

import { initializeArrayFrom1ToN } from "../helpers/initializeArrayFrom1ToN";
import { getStandardDeviation } from "../helpers/getStandardDeviation";
import { handleDataUpdated } from "../helpers/handleDataUpdated";
import { getReferenceLines } from "../helpers/getReferenceLines";
import { useResettableState } from "../hooks/useResettableState";
import { SingleSelectDropdown } from "./SingleSelectDropdown";
import { getFilteredData } from "../helpers/getFilteredData";
import { usePreviousState } from "../hooks/usePreviousState";
import { getRangeOfDays } from "../helpers/getRangeOfDays";
import { getChartData } from "../helpers/getChartData";
import { flattenData } from "../helpers/flattenData";
import { getAverage } from "../helpers/getAverage";
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
  const [predictOn, setPredictOn] = useState(true);
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

  const semestersDescending = [...lineDataKeySet].sort(
    (semesterA, semesterB) => Number(semesterB.split(" ")[1]) - Number(semesterA.split(" ")[1]),
  );

  const latestTerm = semestersDescending[0];

  // const dataSorted = [...flattenedData].sort(({ days: daysA }, { days: daysB }) => Number(daysA) - Number(daysB));

  const latestTermData = flattenedData.filter((object) => latestTerm in object);

  const todaysRecord = latestTermData[latestTermData.length - 1];

  const futureData = useMemo(() => gatherConfidenceIntervals({ todaysRecord, latestTerm }), [todaysRecord, latestTerm]);

  const allData = useMemo(
    () =>
      deferredYAxisSelection === "each_day" && predictOn
        ? flattenedData.map(({ days, ...rest }) => ({ days, ...rest, ...futureData[days] }))
        : flattenedData,
    [flattenedData, futureData, deferredYAxisSelection, predictOn],
  );

  const updateBrushIndexes = () => setBrushIndexes({ endIndex: allData.length - 1, startIndex: 0 });

  usePreviousState(allData, updateBrushIndexes);

  const yMinMax = useMemo(
    () => getYDomain(allData, brushIndexes, lineDataKeySet),
    [allData, brushIndexes, lineDataKeySet],
  );

  const referenceLines = useMemo(
    () => getReferenceLines({ xAxis: deferredXAxisSelection, data: allData, lines }),
    [allData, deferredXAxisSelection, lines],
  );

  const predictionFinals = useMemo(() => {
    const array = allData.filter((element) => "predicted" in element);

    const last = array[array.length - 1];

    const finals = {};

    last && last.predicted.forEach((key) => (finals[key] = last[key]));

    return finals;
  }, [allData]);

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
        <div className="col">
          <button
            className="btn btn-light btn-solid icon-link d-flex justify-content-center align-items-center w-100"
            onClick={() => setPredictOn((condition) => !condition)}
            data-bs-auto-close="outside"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            type="button"
          >
            <Checkbox active={predictOn}></Checkbox>
            Predict
          </button>
        </div>
      </div>
      <MyLineChart
        yMinMax={deferredZoomOn ? yMinMax : [0, "auto"]}
        xAxisSelection={deferredXAxisSelection}
        yAxisSelection={deferredYAxisSelection}
        predictionFinals={predictionFinals}
        setBrushIndexes={setBrushIndexes}
        referenceLines={referenceLines}
        tooltipOn={deferredTooltipOn}
        data={allData}
        lines={lines}
      ></MyLineChart>
    </div>
  );
};

const zScoreTable = { 99: 2.576, 90: 1.645, 95: 1.96 };

const gatherConfidenceIntervals = ({ todaysRecord, latestTerm }) => {
  if (todaysRecord) {
    const rows = Object.values(todaysRecord.lookup);

    const row = rows.find(({ term_desc }) => term_desc === latestTerm);

    const today = row.days;

    const todaysDate = row.date.replace("-", "/") + "/" + row.term_desc.split(" ")[1];

    const rangeOfDays = getRangeOfDays(today);

    const problemData = rows.map(
      ({ Official_each_day: finalEnrollment, _FREQ__each_day: enrollment, term_desc: term, days: day }) => {
        const enrollmentDifference = finalEnrollment - enrollment;

        const dailyAccrual = enrollmentDifference / rangeOfDays;

        return {
          enrollmentDifference,
          finalEnrollment,
          dailyAccrual,
          enrollment,
          term,
          day,
        };
      },
    );

    const past = problemData.filter(({ term }) => term !== latestTerm);

    const dailyAccrualValues = past.map(({ dailyAccrual }) => dailyAccrual);

    const average = getAverage(...dailyAccrualValues);

    const standardDeviation = getStandardDeviation(...dailyAccrualValues);

    const confidenceIntervalRanges = Object.entries(zScoreTable).map(([percent, zScore]) => {
      const change = standardDeviation * zScore;

      const high = average + change;

      const low = average - change;

      return {
        percent,
        zScore,
        change,
        high,
        low,
      };
    });

    const futureRecord = problemData.find(({ term }) => term === latestTerm);

    const { enrollment, term, day } = futureRecord;

    const days = initializeArrayFrom1ToN(rangeOfDays);

    const object = {};

    days.forEach((daysElapsed) => {
      const moment = `${daysElapsed + Number(day)}`;

      const start = new Date(todaysDate);

      start.setDate(start.getDate() + daysElapsed);

      const dateString = start.toLocaleDateString(undefined, {
        month: "2-digit",
        year: "numeric",
        day: "2-digit",
      });

      const date = dateString.split("/")[0] + "-" + dateString.split("/")[1];

      const point = { [term]: enrollment + daysElapsed * average, predicted: [term] };

      const areas = Object.fromEntries(
        confidenceIntervalRanges.map(({ percent, high, low }) => {
          return [percent, [enrollment + daysElapsed * low, enrollment + daysElapsed * high]];
        }),
      );

      object[moment] = { days: moment, date, ...point, ...areas };
    });

    return object;
  }
};

/*
  TODO place in new wrapper due to remote module console bug
  */
