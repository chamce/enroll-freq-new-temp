import { formatNumber } from "../helpers/formatNumber";
import { formatKey } from "../helpers/formatKey";
import { getSign } from "../helpers/getSign";
import { constants } from "../constants";

const { yAxisOptions, groupByKey, yAxisLabel, xAxisKeys, totalKeys } = constants;

export const CustomizedTooltip = (props) => {
  const { predictionFinals, xAxisSelection, yAxisSelection, tooltipOn, payload, melting } = props;

  const otherXOptions = xAxisKeys.filter((key) => key !== xAxisSelection);

  return (
    tooltipOn && (
      <div
        style={{
          boxShadow:
            "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
          fontSize: "small",
        }}
      >
        <table className="table table-success table-striped m-0">
          <thead>
            <tr>
              <th scope="col">{formatKey(groupByKey)}</th>
              <th scope="col">{formatKey(xAxisSelection)}</th>
              {otherXOptions.map((name) => (
                <th scope="col" key={name}>
                  {formatKey(name)}
                </th>
              ))}
              <th className="text-end" scope="col">
                {formatKey(yAxisLabel)}
              </th>
              {melting && (
                <th className="text-end" scope="col">
                  Melt
                </th>
              )}
              <th className="text-end" scope="col">
                {formatKey(totalKeys[1])}
              </th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {payload?.map((object, i) => {
              const { payload: objectPayload, dataKey, value, color } = object;

              const dataRow = objectPayload.lookup[dataKey];

              const freqEachDay = dataRow._FREQ__each_day;

              const roundedValue = Math.round(value);

              const isPredicted = "predicted" in objectPayload && objectPayload.predicted.includes(dataKey);

              const officialPrediction = isPredicted ? predictionFinals[dataKey] : "...";

              const final = !dataRow ? officialPrediction : dataRow[totalKeys[1] + "_" + yAxisOptions[0]];

              const roundedFinal = Math.round(final);

              const enrollment =
                yAxisSelection === yAxisOptions[1]
                  ? getSign(roundedValue) + formatNumber(roundedValue)
                  : formatNumber(roundedValue);

              const enrollmentContent = melting ? formatNumber(Math.round(freqEachDay)) : enrollment;

              return (
                <tr className={isPredicted ? "table-warning" : ""} key={i}>
                  <th style={{ color }} scope="row">
                    {dataKey}
                  </th>
                  <td>{objectPayload[xAxisSelection]}</td>
                  {otherXOptions.map((name) => (
                    <td key={name}>{!dataRow ? (isPredicted ? objectPayload[name] : "...") : dataRow[name]}</td>
                  ))}
                  <td
                    style={
                      yAxisSelection === yAxisOptions[1]
                        ? { color: Math.sign(roundedValue) === -1 ? "red" : "green" }
                        : {}
                    }
                    className={`text-end`}
                  >
                    {enrollmentContent}
                  </td>
                  {melting && <td className={`text-end`}>{formatNumber(roundedValue)}</td>}
                  <td className={`text-end`}>{roundedFinal === 0 ? "..." : formatNumber(roundedFinal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )
  );
};
