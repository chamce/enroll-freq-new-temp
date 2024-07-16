export const getSign = (value) => {
  return Math.sign(value) !== -1 ? "+" : "";
};
