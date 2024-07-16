export const formatKey = (key) =>
  key
    .split("_")
    .filter((word) => word !== "desc")
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
    .join(" ");
