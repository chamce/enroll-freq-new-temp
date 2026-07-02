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
  ReferenceArea,
} from "recharts";
import { useState, memo } from "react";

import { CustomizedTooltip } from "./CustomizedTooltip";
import { formatNumber } from "../helpers/formatNumber";
import { formatKey } from "../helpers/formatKey";
import { constants } from "../constants";

// when mouse leaves line chart, set mouse move event to null
// way to freeze reference lines shown at last day of 2026 data
// style reference lines and add more descriptive labels
// checkbox to weight the model based on the most recent data (set weigh_recent to true) (explain what that means)
// vertical line to label where forecast starts
// keep reference line values within the y axis domain (reference line values not in actual chart data)
// checkbox to toggle forecast
// how to handle pred value overlapping with y axis tick? (glow pred value)

export const MyLineChart = memo(
  ({
    prediction,
    setBrushIndexes,
    xAxisSelection,
    yAxisSelection,
    referenceLines,
    brushStart,
    tooltipOn,
    brushEnd,
    melting,
    yMinMax,
    lines,
    data,
    onMouseMove,
  }) => {
    const [{ clicked, entered }, setState] = useState({ clicked: null, entered: null });

    const handleMouseEnter = ({ dataKey }) => setState((state) => ({ ...state, entered: dataKey }));

    const handleMouseLeave = () => setState((state) => ({ ...state, entered: null }));

    const handleClick = ({ dataKey }) =>
      setState((state) => ({ ...state, clicked: state.clicked === dataKey ? null : dataKey }));

    const isActive = (dataKey) => {
      if (clicked === null && entered === null) {
        return true;
      }

      if (entered !== null) {
        if (dataKey === entered) {
          return true;
        } else {
          return false;
        }
      }

      if (clicked !== null) {
        if (dataKey === clicked) {
          return true;
        } else {
          return false;
        }
      }
    };

    const getOpacity = ({ dataKey }) => (isActive(dataKey) ? 1 : 0.375);

    const indicateActiveLegendText = (dataKey, entry) => {
      const { color } = entry;

      const isClicked = clicked === dataKey;

      const isEntered = entered === dataKey;

      const className = [
        { string: "fw-bold", keep: isEntered },
        { string: "text-decoration-underline", keep: isClicked },
      ]
        .filter(({ keep }) => keep)
        .map(({ string }) => string)
        .join(" ");

      return (
        <span className={className} style={{ color }}>
          {dataKey}
        </span>
      );
    };

    const predTerm = prediction.term;

    const predLine = (Array.isArray(lines) ? lines : []).find(({ dataKey }) => dataKey === predTerm);

    return (
      <ResponsiveContainer height={450}>
        <LineChart
          onMouseMove={onMouseMove}
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
                isActive={isActive}
                melting={melting}
              />
            }
          />
          <Legend
            formatter={indicateActiveLegendText}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            verticalAlign="top"
          ></Legend>
          <ReferenceArea
            // fill={predLine && predLine.stroke}
            y1={prediction.lower_value}
            y2={prediction.upper_value}
          ></ReferenceArea>
          <ReferenceLine
            // segment={[
            //   { x: 0, y: prediction.upper_value },
            //   { x: 2, y: prediction.upper_value },
            // ]}
            y={prediction.upper_value}
            label={{ value: prediction.upper_value, position: "insideBottomLeft" }}
          ></ReferenceLine>
          <ReferenceLine
            // segment={[
            //   { x: 0, y: prediction.upper_value },
            //   { x: 2, y: prediction.upper_value },
            // ]}
            strokeOpacity={0}
            y={prediction.upper_value}
            label={{ value: `${prediction.term} Forecast`, position: "top" }}
          ></ReferenceLine>
          <ReferenceLine
            stroke={predLine && predLine.stroke}
            y={prediction.value}
            label={{ value: prediction.value, position: "left" }}
          ></ReferenceLine>
          <ReferenceLine
            // stroke={predLine && predLine.stroke}
            // strokeOpacity={0}
            y={prediction.lower_value}
            label={{ value: prediction.lower_value, position: "insideTopLeft" }}
          ></ReferenceLine>
          {referenceLines.map(([x, stroke], i) => (
            <ReferenceLine
              label={i === 0 ? { value: "First Day of Term", fill: "black" } : null}
              strokeOpacity={1}
              stroke={stroke}
              key={x}
              x={x}
            ></ReferenceLine>
          ))}
          {/* <Line data={[]}></Line> */}
          {Array.isArray(lines) &&
            lines.map((line) => (
              <Line
                {...line}
                strokeOpacity={getOpacity(line)}
                name={line.dataKey}
                key={line.dataKey}
                strokeWidth={2}
                type="monotone"
                dot={false}
              ></Line>
            ))}
          <Brush
            onChange={(object) => setBrushIndexes(object)}
            dataKey={xAxisSelection}
            startIndex={brushStart}
            endIndex={brushEnd}
            stroke="#8884d8"
            height={30}
          ></Brush>
        </LineChart>
      </ResponsiveContainer>
    );
  },
);

const { yAxisLabel } = constants;
