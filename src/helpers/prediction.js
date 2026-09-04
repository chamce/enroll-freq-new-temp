export const toPredictionRows = (lookup = {}) =>
  Object.entries(lookup).map(([term, record]) => ({
    term,
    days_out: record?.days,
    value: record?._FREQ__each_day,
    final: record?.Official_each_day,
  }));

export const findLatestPredictionRows = (data, latestTerm) => {
  const latestPoint = [...data].reverse().find((row) => latestTerm in row);
  return toPredictionRows(latestPoint?.lookup);
};

export const createPrediction = (Predictor, rows, semestersDescending, weighRecent) => {
  if (rows.length === 0) return undefined;

  const currentTerm = semestersDescending[0];
  const lastRow = rows[rows.length - 1];

  if (lastRow.term !== currentTerm) return undefined;

  const predictorRows = rows.map((row) => (row === lastRow ? { ...row, final: null } : row));

  return new Predictor(predictorRows.filter(Boolean), {}, 3, weighRecent);
};
