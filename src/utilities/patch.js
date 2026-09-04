import { buildConfig } from "./buildConfig";
import { d3CDNPlugin } from "./d3CDNPlugin";

export const patch = (configB = {}) => {
  const configA = { plugins: [d3CDNPlugin], ...buildConfig };
  return deepMerge(configA, configB, concatFn);
};

const deepMerge = (a, b, mergeValue) =>
  [...new Set([...Object.keys(a), ...Object.keys(b)])].reduce(
    (result, key) => ({
      ...result,
      [key]: mergeValue(key, a[key], b[key]),
    }),
    {},
  );

const concatFn = (key, a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);

  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    return deepMerge(a, b, concatFn);
  }

  return b ?? a;
};
