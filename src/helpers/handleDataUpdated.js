import { constants } from "../constants";

const { dropdownKeys, randomColors, groupByKey } = constants;

export const handleDataUpdated = (data) => {
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
    lines = lines.map((dataKey, index) => ({ stroke: randomColors[lines.length - 1 - index], dataKey }));
    lineDataKeySet = new Set(lines.map((line) => line.dataKey));
    dropdownKeys.forEach((key) => (arrays[key] = [...dropdowns[key]].sort()));
  }

  return [dropdowns, arrays, lines, lineDataKeySet];
};
