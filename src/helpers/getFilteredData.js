export const getFilteredData = (data, dropdowns) => {
  const keys = Object.keys(dropdowns);
  return data.filter((row) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = row[key];
      if (!dropdowns[key].has(value)) return false;
    }
    return true;
  });
};
