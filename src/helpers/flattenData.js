import { constants } from "../constants";

const { yAxisKey } = constants;

export const flattenData = (isXDateKey, xAxisState, yAxisState, dataToFlatten) => {
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
