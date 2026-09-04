import customCsv from "./customCsv";

if (window.d3?.csv) {
  window.d3.csv = customCsv;
} else {
  console.warn("d3.csv not found; custom CSV loading was not installed.");
}
