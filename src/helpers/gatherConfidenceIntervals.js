import { initializeArrayFrom1ToN } from "./initializeArrayFrom1ToN";
import { getStandardDeviation } from "./getStandardDeviation";
import { getRangeOfDays } from "./getRangeOfDays";
import { getAverage } from "./getAverage";

const zScoreTable = { 99: 2.576, 90: 1.645, 95: 1.96 };

export const gatherConfidenceIntervals = ({ xAxisSelection, todaysRecord, latestTerm }) => {
  if (todaysRecord) {
    const rows = Object.values(todaysRecord.lookup);

    const row = rows.find(({ term_desc }) => term_desc === latestTerm);

    const today = row.days;

    const todaysDate = row.date.replace("-", "/") + "/" + row.term_desc.split(" ")[1];

    const rangeOfDays = getRangeOfDays(today);

    const problemData = rows.map(
      ({ Official_each_day: finalEnrollment, _FREQ__each_day: enrollment, term_desc: term, days: day }) => {
        const enrollmentDifference = finalEnrollment - enrollment;

        const dailyAccrual = enrollmentDifference / rangeOfDays;

        return {
          enrollmentDifference,
          finalEnrollment,
          dailyAccrual,
          enrollment,
          term,
          day,
        };
      },
    );

    const past = problemData.filter(({ term }) => term !== latestTerm);

    const dailyAccrualValues = past.map(({ dailyAccrual }) => dailyAccrual);

    const average = getAverage(...dailyAccrualValues);

    const standardDeviation = getStandardDeviation(...dailyAccrualValues);

    const confidenceIntervalRanges = Object.entries(zScoreTable).map(([percent, zScore]) => {
      const change = standardDeviation * zScore;

      const high = average + change;

      const low = average - change;

      return {
        percent,
        zScore,
        change,
        high,
        low,
      };
    });

    const futureRecord = problemData.find(({ term }) => term === latestTerm);

    const { enrollment, term, day } = futureRecord;

    const days = initializeArrayFrom1ToN(rangeOfDays);

    const object = {};

    days.forEach((daysElapsed) => {
      const moment = `${daysElapsed + Number(day)}`;

      const start = new Date(todaysDate);

      start.setDate(start.getDate() + daysElapsed);

      const dateString = start.toLocaleDateString(undefined, {
        month: "2-digit",
        year: "numeric",
        day: "2-digit",
      });

      const date = dateString.split("/")[0] + "-" + dateString.split("/")[1];

      const point = { [term]: enrollment + daysElapsed * average, predicted: [term] };

      const areas = Object.fromEntries(
        confidenceIntervalRanges.map(({ percent, high, low }) => {
          return [percent, [enrollment + daysElapsed * low, enrollment + daysElapsed * high]];
        }),
      );

      const id = xAxisSelection === "days" ? moment : date;

      object[id] = { days: moment, date, ...point, ...areas };
    });

    return object;
  }
};
