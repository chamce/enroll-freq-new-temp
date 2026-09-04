import { constants } from "../constants/index.js";

const { randomColors, groupByKey } = constants;

export const handleDataUpdated = (data) => {
  const lineKeys = [...new Set(data.map((row) => row[groupByKey]))].sort();
  const lines = lineKeys.map((dataKey, index) => ({
    stroke: randomColors[lineKeys.length - 1 - index],
    dataKey,
  }));

  return {
    lines,
    lineDataKeySet: new Set(lines.map((line) => line.dataKey)),
  };
};
