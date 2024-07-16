import { constants } from "../constants";

const { yAxisOptions, totalKeys } = constants;

export const calculateDailyChange = (object, isDateKey) => {
  const sortedKeys = Object.keys(object).sort((a, b) => (isDateKey ? Date.parse(a) - Date.parse(b) : a - b));
  sortedKeys.forEach((xAxisValue, i) =>
    Object.keys(object[xAxisValue]).forEach((key) =>
      totalKeys.forEach((metric) => {
        const current = object[xAxisValue][key];

        if (i === 0) {
          current[metric + "_" + yAxisOptions[1]] = current[metric + "_" + yAxisOptions[0]];
        } else {
          const previous = object[sortedKeys[i - 1]][key];

          if (previous) {
            current[metric + "_" + yAxisOptions[1]] =
              current[metric + "_" + yAxisOptions[0]] - previous[metric + "_" + yAxisOptions[0]];
          }
        }
      }),
    ),
  );
};
