import { useCallback, useState } from "react";

import { constants } from "../constants";

export const useActiveLegendItem = () => {
  const [{ isLastItemActive, history }, setState] = useState({
    isLastItemActive: false,
    history: [],
  });

  const onMouseEnter = useCallback(
    ({ dataKey }) =>
      setState(({ history: dataKeys }) => ({
        history: [...dataKeys.filter((key) => key !== dataKey), dataKey],
        isLastItemActive: true,
      })),
    [],
  );

  const onMouseLeave = useCallback(() => setState(({ history }) => ({ isLastItemActive: false, history })), []);
  const lastHistoryItem = history[history.length - 1];

  const activeLegendItem = isLastItemActive ? lastHistoryItem : null;

  const styleLine = useCallback(
    ({ dataKey }) =>
      dataKey === activeLegendItem
        ? {
            filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))",
          }
        : null,
    [activeLegendItem],
  );

  return {
    activeLegendItemHistory: history,
    activeLegendItem,
    onMouseEnter,
    onMouseLeave,
    styleLine,
  };
};

const { dropShadowStyle } = constants;
