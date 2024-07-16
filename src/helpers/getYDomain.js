export const getYDomain = (data, brushIndexes, lineDataKeySet) => {
  const { startIndex, endIndex } = brushIndexes;

  const shownData = data.slice(startIndex, endIndex + 1);

  const min = Math.min(
    ...shownData.map((object, i) =>
      Math.min(
        ...Object.keys(object)
          .filter((key) => lineDataKeySet.has(key))
          .map((key) => object[key]),
      ),
    ),
  );

  const max = Math.max(
    ...shownData.map((object, i) =>
      Math.max(
        ...Object.keys(object)
          .filter((key) => lineDataKeySet.has(key))
          .map((key) => object[key]),
      ),
    ),
  );

  return [min, max];
};
