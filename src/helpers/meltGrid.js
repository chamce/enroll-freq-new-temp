export const getMeltFields = (xAxisSelection, semestersDescending) => [
  xAxisSelection,
  ...[...semestersDescending].reverse(),
];

export const getMeltRows = (tableMelt, fields, brushIndexes) => {
  const fieldSet = new Set(fields);
  const startIndex = brushIndexes.startIndex ? brushIndexes.startIndex : 0;
  const endIndex = brushIndexes.endIndex ? brushIndexes.endIndex + 1 : undefined;

  return tableMelt
    .map((row) => Object.fromEntries(Object.entries(row).filter(([field]) => fieldSet.has(field))))
    .slice(startIndex, endIndex);
};

export const createMeltColumnDefs = (fields, rowData) => {
  const valueFormatter = ({ value }) => value?.toLocaleString();

  const compareWithPreviousRow = (comparison) => ({ colDef: { field }, rowIndex, value }) =>
    rowIndex > 0 && rowData[rowIndex - 1] && comparison(value, rowData[rowIndex - 1][field]);

  const cellClassRules = {
    "bg-success-subtle": compareWithPreviousRow((value, previousValue) => value > previousValue),
    "bg-danger-subtle": compareWithPreviousRow((value, previousValue) => value < previousValue),
  };

  return fields.map((field, index) =>
    index === 0
      ? { valueFormatter, flex: 1, field }
      : { type: "numericColumn", valueFormatter, cellClassRules, flex: 2, field },
  );
};
