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
  useActiveTooltipDataPoints,
} from "recharts";
import { memo, useEffect, useState } from "react";

import { CustomizedTooltip } from "./CustomizedTooltip";
import { getHoverLookup } from "../helpers/getHoverLookup";
import { formatNumber } from "../helpers/formatNumber";
import { formatKey } from "../helpers/formatKey";
import { constants } from "../constants";

const { yAxisLabel } = constants;

const getNiceMax = (value) => {
  if (value <= 0) return 0;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 2.5) return 2.5 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
};

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
    lines,
    data,
    onHoverLookupChange,
    bestPrediction,
  }) => {
    const [{ clicked, entered }, setLegendState] = useState({ clicked: null, entered: null });

    const handleMouseEnter = ({ dataKey }) =>
      setLegendState((state) => ({ ...state, entered: dataKey }));

    const handleMouseLeave = () => setLegendState((state) => ({ ...state, entered: null }));

    const handleClick = ({ dataKey }) =>
      setLegendState((state) => ({ ...state, clicked: state.clicked === dataKey ? null : dataKey }));

    const isActive = (dataKey) => {
      if (entered !== null) return dataKey === entered;
      if (clicked !== null) return dataKey === clicked;
      return true;
    };

    const getOpacity = ({ dataKey }) => (isActive(dataKey) ? 1 : 0.375);

    const formatLegendText = (dataKey, entry) => {
      const className = [
        entered === dataKey ? "fw-bold" : "",
        clicked === dataKey ? "text-decoration-underline" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <span className={className} style={{ color: entry.color }}>
          {dataKey}
        </span>
      );
    };

    const predictionLine = (Array.isArray(lines) ? lines : []).find(({ dataKey }) => dataKey === prediction.term);
    const numericValues = data.flatMap((row) => Object.values(row).filter((value) => typeof value === "number"));
    const activePrediction = Object.keys(prediction).length === 0 ? bestPrediction : prediction;
    const contextualMax = Math.max(...numericValues, activePrediction.upper_value);
    const yDomain = ["dataMin", getNiceMax(contextualMax)];

    return (
      <ResponsiveContainer height={450}>
        <LineChart
          margin={{ bottom: 0, right: 0, left: 0, top: 0 }}
          data={data}
        >
          <HoverLookupObserver onChange={onHoverLookupChange} />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            label={{
              value: formatKey(xAxisSelection),
              style: { textAnchor: "middle" },
              position: "bottom",
              offset: 36.56,
              angle: 0,
            }}
            dataKey={xAxisSelection}
          />
          <YAxis
            label={{
              value: `${formatKey(yAxisLabel)} (${formatKey(yAxisSelection)})`,
              style: { textAnchor: "middle" },
              position: "left",
              angle: -90,
              offset: 0,
            }}
            tickFormatter={formatNumber}
            domain={yDomain}
          />
          <Tooltip
            content={
              <CustomizedTooltip
                yAxisSelection={yAxisSelection}
                xAxisSelection={xAxisSelection}
                tooltipOn={tooltipOn}
                melting={melting}
              />
            }
          />
          <Legend
            formatter={formatLegendText}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            verticalAlign="top"
          />
          <ReferenceArea y1={prediction.lower_value} y2={prediction.upper_value} />
          <ReferenceLine
            y={prediction.upper_value}
            label={{
              className: "outlined-text",
              value: prediction.upper_value?.toLocaleString(),
              position: "insideBottomLeft",
            }}
          />
          <ReferenceLine
            strokeOpacity={0}
            y={prediction.upper_value}
            label={{ value: `${prediction.term} Forecast`, position: "top" }}
          />
          <ReferenceLine
            stroke={predictionLine?.stroke}
            y={prediction.value}
            label={{
              className: "outlined-text",
              value: prediction.value?.toLocaleString(),
              position: "left",
            }}
          />
          <ReferenceLine
            y={prediction.lower_value}
            label={{
              className: "outlined-text",
              value: prediction.lower_value?.toLocaleString(),
              position: "insideTopLeft",
            }}
          />
          <ReferenceLine
            label={{
              value: "First Day of Forecast",
              fill: "black",
              angle: -90,
              style: { textAnchor: "middle" },
              position: "left",
            }}
            strokeOpacity={1}
            stroke="#212529"
            x="-100"
          />
          {referenceLines.map(([x, stroke], index) => (
            <ReferenceLine
              label={
                index === 0
                  ? {
                      value: "First Day of Term",
                      fill: "black",
                      angle: -90,
                      style: { textAnchor: "middle" },
                      position: "left",
                    }
                  : null
              }
              strokeOpacity={1}
              stroke={stroke}
              key={x}
              x={x}
            />
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
              />
            ))}
          <Brush
            onChange={setBrushIndexes}
            dataKey={xAxisSelection}
            startIndex={brushStart}
            endIndex={brushEnd}
            stroke="#8884d8"
            height={30}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  },
);


const HoverLookupObserver = ({ onChange }) => {
  const activeDataPoints = useActiveTooltipDataPoints();
  const lookup = getHoverLookup(activeDataPoints);

  useEffect(() => {
    onChange(lookup);
  }, [lookup, onChange]);

  return null;
};
