import { constants } from "../constants";

const { xAxisKeys } = constants;

export const referenceLineTrue = (row) => row[xAxisKeys[0]] === "0";
