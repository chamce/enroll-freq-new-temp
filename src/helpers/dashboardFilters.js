export const getAvailableValuesByField = (data, fields) =>
  Object.fromEntries(
    fields.map((field) => [
      field,
      [...new Set(data.map((row) => row[field]))].sort(),
    ]),
  );

export const filterDataBySelections = (data, fields, isValueChecked) =>
  data.filter((row) =>
    fields.every((field) =>
      isValueChecked({ field, value: row[field] }),
    ),
  );
