import { referenceLineTrue } from "./referenceLineTrue";

export const getReferenceLines = ({ xAxis, lines, data }) => {
  const set = new Set();
  data.forEach((row) =>
    Object.entries(row.lookup).forEach(
      ([group, object]) =>
        referenceLineTrue(object) && set.add(object[xAxis] + "→" + lines.find((o) => o.dataKey === group).stroke),
    ),
  );
  const uniqueXValues = new Set([...set].map((string) => string.split("→")[0]));
  if (uniqueXValues.size === 1) {
    const xValue = [...uniqueXValues][0];
    return [[xValue, "#212529"]];
  }
  return [...set].map((string) => string.split("→"));
};
