export const meltFn = (data, startIndex, endIndex) => {
  const melt = [];

  const fromDayZero = data.filter(({ days }) => Number(days) >= 0);

  const ifEndIndex = (index, value, key) =>
    endIndex
      ? index <= startIndex || index > endIndex
        ? 0
        : value + melt[index - 1][key]
      : index <= startIndex
      ? 0
      : value + melt[index - 1][key];

  fromDayZero.forEach(({ lookup, days, ...terms }, index) => {
    const meltedTerms = Object.fromEntries(
      Object.entries(terms).map(([key, value]) => [key, ifEndIndex(index, value, key)]),
    );

    melt.push({ lookup, days, ...meltedTerms });
  });

  return melt;
};
