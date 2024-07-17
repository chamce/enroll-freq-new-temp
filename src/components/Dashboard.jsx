import { useDeferredValue, useState, useMemo } from "react";
import { csv } from "d3";

import { getStandardDeviation } from "../helpers/getStandardDeviation";
import { useResettableState } from "../hooks/useResettableState";
import { handleDataUpdated } from "../helpers/handleDataUpdated";
import { getReferenceLines } from "../helpers/getReferenceLines";
import { SingleSelectDropdown } from "./SingleSelectDropdown";
import { getFilteredData } from "../helpers/getFilteredData";
import { usePreviousState } from "../hooks/usePreviousState";
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

  // questions
  // should range of days be based on last day in chart?
  // should final enrollment numbers be based on current enrollment at last day in chart?

  const semestersDescending = [...lineDataKeySet].sort(
    (semesterA, semesterB) => Number(semesterB.split(" ")[1]) - Number(semesterA.split(" ")[1]),
  );

  const latestTerm = semestersDescending[0];

  console.log(flattenedData);

  // const dataSorted = [...flattenedData].sort(({ days: daysA }, { days: daysB }) => Number(daysA) - Number(daysB));

  const latestTermData = flattenedData.filter((object) => latestTerm in object);

  const todaysRecord = latestTermData[latestTermData.length - 1];

  const gatheredEnrollment = useMemo(
    () => gatherConfidenceIntervals({ todaysRecord, latestTerm }),
    [todaysRecord, latestTerm],
  );

  console.log(gatheredEnrollment);

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

const rangeOfDaysConstant = 61;

const getRangeOfDays = (numberOfDays) => rangeOfDaysConstant - Number(numberOfDays);

const zScoreTable = { 99: 2.576, 90: 1.645, 95: 1.96 };

const initializeArrayFrom1ToN = (length) => Array.from({ length }, (_, i) => i + 1);

const gatherConfidenceIntervals = ({ todaysRecord, latestTerm }) => {
  if (todaysRecord) {
    console.log("hhhhhhhhhhhhhhhhhhhhh", todaysRecord);

    const rows = Object.values(todaysRecord.lookup);

    const today = rows.find(({ term_desc }) => term_desc === latestTerm).days;

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

    const confidenceIntervals = confidenceIntervalRanges.map(({ percent, high, low }) => {
      return {
        data: days.map((daysElapsed) => ({
          amount: {
            predicted: enrollment + daysElapsed * average,
            max: enrollment + daysElapsed * high,
            min: enrollment + daysElapsed * low,
          },
          day: `${daysElapsed + Number(day)}`,
        })),
        percent,
      };
    });

    const gathered = {
      enrollment: {
        priorYears: past.map(({ enrollmentDifference, finalEnrollment, dailyAccrual, enrollment, term, day }) => ({
          amount: { difference: enrollmentDifference, final: finalEnrollment, current: enrollment, dailyAccrual },
          term,
          day,
        })),
        thisYear: {
          amount: { future: { confidenceIntervals, rangeOfDays }, current: enrollment },
          term,
          day,
        },
        dailyAccrual: { standardDeviation, average },
      },
    };

    return gathered;
  }
};

/*
  TODO place in new wrapper due to remote module console bug
  */
