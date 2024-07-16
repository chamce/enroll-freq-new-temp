import { useState } from "react";

export const usePreviousState = (value, doSomething) => {
  const [previousValue, setPreviousValue] = useState(value);

  if (previousValue !== value) {
    setPreviousValue(value);

    typeof doSomething === "function" && doSomething(previousValue);
  }
};
