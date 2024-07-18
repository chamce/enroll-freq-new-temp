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
import { useState, memo } from "react";

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
                isActive={isActive}
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
            stroke="#8884d8"
            height={30}
          ></Brush>
        </LineChart>
      </ResponsiveContainer>
    );
  },
);

const { yAxisLabel } = constants;
