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
import { useCallback, useState, memo } from "react";

import { CustomizedTooltip } from "./CustomizedTooltip";
import { formatNumber } from "../helpers/formatNumber";
import { formatKey } from "../helpers/formatKey";
import { constants } from "../constants";

export const MyLineChart = memo(
  ({
    predictionFinals,
    setBrushIndexes,
    referenceLines,
    yAxisSelection,
    xAxisSelection,
    tooltipOn,
    yMinMax,
    lines,
    data,
  }) => {
    const [activeLine, setActiveLine] = useState();

    const handleMouseEnter = (dataKey) => setActiveLine(dataKey);

    const handleMouseLeave = () => setActiveLine(null);

    const styleLine = useCallback(
      ({ dataKey }) =>
        dataKey === activeLine
          ? {
              filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))",
            }
          : null,
      [activeLine],
    );

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
                predictionFinals={predictionFinals}
                xAxisSelection={xAxisSelection}
                yAxisSelection={yAxisSelection}
                tooltipOn={tooltipOn}
              />
            }
          />
          {/* <Tooltip
                labelFormatter={(label) => formatKey(xAxisSelection) + " : " + label}
                formatter={(value, name) => [formatNumber(value), name]}
                wrapperClassName={tooltipActive ? "" : "d-none"}
              ></Tooltip> */}
          <Legend
            onMouseEnter={({ dataKey }) => handleMouseEnter(dataKey)}
            onMouseLeave={handleMouseLeave}
            verticalAlign="top"
          ></Legend>
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
            lines.map((line) => (
              <Line
                style={styleLine(line)}
                {...line}
                onMouseEnter={({ name }) => handleMouseEnter(name)}
                onMouseLeave={handleMouseLeave}
                name={line.dataKey}
                // className={`→${line.dataKey}`}
                key={line.dataKey}
                type="monotone"
                strokeWidth={2}
                dot={false}
              ></Line>
            ))}
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

const { yAxisLabel } = constants;
