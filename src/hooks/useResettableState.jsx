import { useState } from "react";

import { usePreviousState } from "./usePreviousState";

export const useResettableState = (initialState) => {
  const [state, setState] = useState(initialState);

  const resetState = () => setState(initialState);

  usePreviousState(initialState, resetState);

  return [state, setState];
};
