import {
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  LineChart,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Brush,
  Line,
} from "recharts";
import { useDeferredValue, useEffect, useState, useMemo, memo } from "react";
import { csv } from "d3";

const dropdownKeys = ["term_desc", "level_desc", "student_type", "online"];
const xAxisKeys = ["days", "date"];
const yAxisOptions = ["each_day", "daily_change"];
const yAxisLabel = "enrollment";
const groupByKey = "term_desc";
const dateKeys = ["date"];
const yAxisKey = "_FREQ_";
const totalKeys = ["_FREQ_", "Official"];
const referenceLineTrue = (row) => row[xAxisKeys[0]] === "0";

const randomColors = [
  "#c2a344",
  "#b45ac2",
  "#6cb643",
  "#7178ca",
  "#677c37",
  "#cd4063",
  "#55b280",
  "#c06a94",
  "#4bafd0",
  "#c8683f",
];

const formatNumber = (number) => number.toLocaleString("en-US");
const formatKey = (key) =>
  key
    .split("_")
    .filter((word) => word !== "desc")
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
    .join(" ");
const handleDropdownItemClicked = (clickedAllButton, key, value, values, setState) => {
  setState((state) => {
    const newState = { ...state };
    if (clickedAllButton) {
      newState[key] = newState[key].size === values.length ? new Set() : new Set(values);
    } else {
      newState[key] = new Set(newState[key]);
      const newSet = newState[key];
      newSet.has(value) ? newSet.delete(value) : newSet.add(value);
    }
    return newState;
  });
};
const getFilteredData = (data, dropdowns) => {
  const keys = Object.keys(dropdowns);
  return data.filter((row) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = row[key];
      if (!dropdowns[key].has(value)) return false;
    }
    return true;
  });
};
const getChartData = (data, xAxisState, isDateKey) => {
  const xAxisValueMap = {};
  data.forEach((row) => {
    const xAxisValue = row[xAxisState];
    const lineValue = row[groupByKey];

    if (!(xAxisValue in xAxisValueMap)) {
      xAxisValueMap[xAxisValue] = {};
    }

    const lineValueMap = xAxisValueMap[xAxisValue];
    if (!(lineValue in lineValueMap)) {
      lineValueMap[lineValue] = { ...row };

      const thisRow = lineValueMap[lineValue];
      totalKeys.forEach((key) => (thisRow[key + "_" + yAxisOptions[0]] = 0));
    }

    const thisRow = lineValueMap[lineValue];
    totalKeys.forEach((key) => (thisRow[key + "_" + yAxisOptions[0]] += Number(row[key])));
  });

  calculateDailyChange(xAxisValueMap, isDateKey);

  return xAxisValueMap;
};
const calculateDailyChange = (object, isDateKey) => {
  const sortedKeys = Object.keys(object).sort((a, b) => (isDateKey ? Date.parse(a) - Date.parse(b) : a - b));
  sortedKeys.forEach((xAxisValue, i) =>
    Object.keys(object[xAxisValue]).forEach((key) =>
      totalKeys.forEach((metric) => {
        const current = object[xAxisValue][key];

        if (i === 0) {
          current[metric + "_" + yAxisOptions[1]] = current[metric + "_" + yAxisOptions[0]];
        } else {
          const previous = object[sortedKeys[i - 1]][key];

          if (previous) {
            current[metric + "_" + yAxisOptions[1]] =
              current[metric + "_" + yAxisOptions[0]] - previous[metric + "_" + yAxisOptions[0]];
          }
        }
      }),
    ),
  );
};
const flattenData = (isXDateKey, xAxisState, yAxisState, dataToFlatten) => {
  const sortedKeys = Object.keys(dataToFlatten).sort((a, b) => (isXDateKey ? Date.parse(a) - Date.parse(b) : a - b));
  return sortedKeys.map((xAxisValue) => {
    const lookup = dataToFlatten[xAxisValue];
    const object = { lookup };
    Object.keys(lookup).forEach((lineValue) => {
      object[lineValue] = lookup[lineValue][yAxisKey + "_" + yAxisState];
      object[xAxisState] = lookup[lineValue][xAxisState];
    });
    return object;
  });
};
const handleDataUpdated = (data) => {
  const dropdowns = {};
  const arrays = {};

  let lines = new Set();
  let lineDataKeySet = new Set();

  if (data.length > 0) {
    dropdownKeys.forEach((key) => (dropdowns[key] = new Set()));

    data.forEach((row) => {
      lines.add(row[groupByKey]);
      dropdownKeys.forEach((key) => dropdowns[key].add(row[key]));
    });

    lines = [...lines].sort();
    lines = lines.map((dataKey, index) => ({ stroke: randomColors[index], dataKey }));
    lineDataKeySet = new Set(lines.map((line) => line.dataKey));
    dropdownKeys.forEach((key) => (arrays[key] = [...dropdowns[key]].sort()));
  }

  return [dropdowns, arrays, lines, lineDataKeySet];
};
const getYDomain = (data, brushIndexes, lineDataKeySet) => {
  const { startIndex, endIndex } = brushIndexes;

  const shownData = data.slice(startIndex, endIndex + 1);

  const min = Math.min(
    ...shownData.map((object, i) =>
      Math.min(
        ...Object.keys(object)
          .filter((key) => lineDataKeySet.has(key))
          .map((key) => object[key]),
      ),
    ),
  );

  const max = Math.max(
    ...shownData.map((object, i) =>
      Math.max(
        ...Object.keys(object)
          .filter((key) => lineDataKeySet.has(key))
          .map((key) => object[key]),
      ),
    ),
  );

  return [min, max];
};
const getSign = (value) => {
  return Math.sign(value) !== -1 ? "+" : "";
};

const Dropdown = memo(({ setState, children, dataKey, values, state }) => {
  return (
    <div className="dropdown col">
      <button
        className="btn btn-light dropdown-toggle w-100 btn-solid d-flex align-items-center justify-content-center"
        data-bs-auto-close="outside"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        type="button"
      >
        {children}
      </button>
      <ul className="dropdown-menu overflow-y-scroll" style={{ maxHeight: 300 }}>
        <DropdownItem
          isChecked={state.size === values.length}
          setState={setState}
          isAllButton={true}
          dataKey={dataKey}
          values={values}
        >
          All ({state.size + "/" + values.length})
        </DropdownItem>
        {values.map((value) => (
          <DropdownItem
            isChecked={state.has(value)}
            setState={setState}
            dataKey={dataKey}
            values={values}
            value={value}
            key={value}
          >
            {value}
          </DropdownItem>
        ))}
      </ul>
    </div>
  );
});
const DropdownItem = memo(({ isAllButton, isChecked, setState, children, dataKey, values, value }) => {
  return (
    <li onClick={() => handleDropdownItemClicked(isAllButton, dataKey, value, values, setState)}>
      <button className="dropdown-item icon-link" type="button">
        <Checkbox active={isChecked}></Checkbox>
        {children}
      </button>
    </li>
  );
});
const SingleSelectDropdown = memo(({ children, setState, dataKeys, state }) => {
  return (
    <div className="dropdown col">
      <button
        className="btn btn-light dropdown-toggle w-100 btn-solid d-flex align-items-center justify-content-center"
        data-bs-auto-close="outside"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        type="button"
      >
        {children}
      </button>
      <ul className="dropdown-menu overflow-y-scroll" style={{ maxHeight: 300 }}>
        {dataKeys.map((dataKey) => (
          <SingleSelectDropdownItem isChecked={state === dataKey} setState={setState} dataKey={dataKey} key={dataKey}>
            {formatKey(dataKey)}
          </SingleSelectDropdownItem>
        ))}
      </ul>
    </div>
  );
});
const SingleSelectDropdownItem = memo(({ isChecked, children, setState, dataKey }) => {
  return (
    <li onClick={() => setState(dataKey)}>
      <button className="dropdown-item icon-link" type="button">
        <Checkbox active={isChecked}></Checkbox>
        {children}
      </button>
    </li>
  );
});
const MyLineChart = memo(
  ({ setBrushIndexes, referenceLines, yAxisSelection, xAxisSelection, tooltipOn, yMinMax, lines, data }) => {
    return (
      <ResponsiveContainer height={450}>
        <LineChart
          margin={{
            bottom: 0,
            right: 0,
            left: 0,
            top: 0,
          }}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3"></CartesianGrid>
          <XAxis
            label={{
              value: formatKey(xAxisSelection),
              style: { textAnchor: "middle" },
              position: "bottom",
              offset: 36.56,
              angle: 0,
            }}
            dataKey={xAxisSelection}
          ></XAxis>
          <YAxis
            label={{
              value: `${formatKey(yAxisLabel)} (${formatKey(yAxisSelection)})`,
              style: { textAnchor: "middle" },
              position: "left",
              angle: -90,
              offset: 0,
            }}
            tickFormatter={(value) => formatNumber(value)}
            domain={yMinMax}
          ></YAxis>
          <Tooltip
            content={
              <CustomizedTooltip
                yAxisSelection={yAxisSelection}
                xAxisSelection={xAxisSelection}
                tooltipOn={tooltipOn}
              />
            }
          />
          {/* <Tooltip
              labelFormatter={(label) => formatKey(xAxisSelection) + " : " + label}
              formatter={(value, name) => [formatNumber(value), name]}
              wrapperClassName={tooltipActive ? "" : "d-none"}
            ></Tooltip> */}
          <Legend verticalAlign="top"></Legend>
          {referenceLines.map(([x, stroke], i) => (
            <ReferenceLine
              label={i === 0 ? { value: "First Day of Term", fill: "black" } : null}
              strokeOpacity={1}
              stroke={stroke}
              key={x}
              x={x}
            ></ReferenceLine>
          ))}

          {Array.isArray(lines) &&
            lines.map((line) => <Line {...line} key={line.dataKey} type="monotone" strokeWidth={2} dot={false}></Line>)}
          <Brush
            onChange={(object) => setBrushIndexes(object)}
            dataKey={xAxisSelection}
            stroke="#8884d8"
            height={30}
          ></Brush>
        </LineChart>
      </ResponsiveContainer>
    );
  },
);
const CustomizedTooltip = (props) => {
  const { yAxisSelection, xAxisSelection, tooltipOn, payload } = props;
  const otherXOptions = xAxisKeys.filter((key) => key !== xAxisSelection);

  return (
    tooltipOn && (
      <div
        style={{
          boxShadow:
            "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
          fontSize: "small",
        }}
      >
        <table className="table table-success table-striped m-0">
          <thead>
            <tr>
              <th scope="col">{formatKey(groupByKey)}</th>
              <th scope="col">{formatKey(xAxisSelection)}</th>
              {otherXOptions.map((name) => (
                <th scope="col" key={name}>
                  {formatKey(name)}
                </th>
              ))}
              <th className="text-end" scope="col">
                {formatKey(yAxisLabel)}
              </th>
              <th className="text-end" scope="col">
                {formatKey(totalKeys[1])}
              </th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {payload?.map((object, i) => {
              const final = object.payload.lookup[object.dataKey][totalKeys[1] + "_" + yAxisOptions[0]];

              return (
                <tr key={i}>
                  <th style={{ color: object.color }} scope="row">
                    {object.dataKey}
                  </th>
                  <td>{object.payload[xAxisSelection]}</td>
                  {otherXOptions.map((name) => (
                    <td key={name}>{object.payload.lookup[object.dataKey][name]}</td>
                  ))}
                  <td
                    style={
                      yAxisSelection === yAxisOptions[1]
                        ? { color: Math.sign(object.value) === -1 ? "red" : "green" }
                        : {}
                    }
                    className="text-end"
                  >
                    {yAxisSelection === yAxisOptions[1]
                      ? getSign(object.value) + formatNumber(object.value)
                      : formatNumber(object.value)}
                  </td>
                  <td className="text-end">{final === 0 ? "..." : formatNumber(final)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )
  );
};
const Checkbox = ({ active }) => {
  return active ? (
    <svg
      className="bi bi-check-square-fill text-primary"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      height={16}
      width={16}
    >
      <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="bi bi-square"
      viewBox="0 0 16 16"
      fill="currentColor"
      height={16}
      width={16}
    >
      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
    </svg>
  );
};

export const Dashboard = () => {
  const [data, setData] = useState([]);
  const [zoomOn, setZoomOn] = useState(true);
  const [dropdowns, setDropdowns] = useState({});
  const [tooltipOn, setTooltipOn] = useState(true);
  const [xAxisSelection, setXAxisSelection] = useState(xAxisKeys[0]);
  const [yAxisSelection, setYAxisSelection] = useState(yAxisOptions[0]);
  const [brushIndexes, setBrushIndexes] = useState({ startIndex: 0, endIndex: 1 });

  const deferredZoomOn = useDeferredValue(zoomOn);
  const deferredTooltipOn = useDeferredValue(tooltipOn);
  const deferredDropdowns = useDeferredValue(dropdowns);
  const deferredXAxisSelection = useDeferredValue(xAxisSelection);
  const deferredYAxisSelection = useDeferredValue(yAxisSelection);

  const [initialDropdowns, arrays, lines, lineDataKeySet] = useMemo(() => handleDataUpdated(data), [data]);
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
  const yMinMax = useMemo(
    () => getYDomain(flattenedData, brushIndexes, lineDataKeySet),
    [flattenedData, brushIndexes, lineDataKeySet],
  );
  const referenceLines = useMemo(() => {
    const set = new Set();
    flattenedData.forEach((row) =>
      Object.entries(row.lookup).forEach(
        ([group, object]) =>
          referenceLineTrue(object) &&
          set.add(object[deferredXAxisSelection] + "→" + lines.find((o) => o.dataKey === group).stroke),
      ),
    );
    const uniqueXValues = new Set([...set].map((string) => string.split("→")[0]));
    if (uniqueXValues.size === 1) {
      const xValue = [...uniqueXValues][0];
      return [[xValue, "#212529"]];
    }
    return [...set].map((string) => string.split("→"));
  }, [flattenedData, deferredXAxisSelection, lines]);

  console.log(flattenedData, referenceLines);

  useEffect(() => {
    csv("data/data.csv").then(setData);
  }, []);
  useEffect(() => {
    setDropdowns(initialDropdowns);
  }, [initialDropdowns]);
  useEffect(() => {
    setBrushIndexes({ endIndex: flattenedData.length - 1, startIndex: 0 });
  }, [flattenedData]);

  return (
    <div className="vstack gap-4">
      <h1 className="text-center">
        {formatKey(yAxisLabel)} by {formatKey(deferredXAxisSelection)} & {formatKey(groupByKey)}
      </h1>
      <div className="hstack flex-wrap gap-3">
        {Object.keys(dropdowns).map((key) => (
          <Dropdown setState={setDropdowns} state={dropdowns[key]} values={arrays[key]} dataKey={key} key={key}>
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
