import {
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  LineChart,
  Tooltip,
  Legend,
  Brush,
  YAxis,
  XAxis,
  Line,
} from "recharts";
import { memo } from "react";

import { formatNumber } from "../helpers/formatNumber";
import { formatKey } from "../helpers/formatKey";
import { getSign } from "../helpers/getSign";
import { constants } from "../constants";

export const MyLineChart = memo(
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

const { yAxisOptions, groupByKey, yAxisLabel, xAxisKeys, totalKeys } = constants;

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
