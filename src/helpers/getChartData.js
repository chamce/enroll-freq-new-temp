import { calculateDailyChange } from "./calculateDailyChange";
import { constants } from "../constants";

const { yAxisOptions, groupByKey, totalKeys } = constants;

export const getChartData = (data, xAxisState, isDateKey) => {
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
