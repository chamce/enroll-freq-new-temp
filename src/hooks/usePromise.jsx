import { useEffect } from "react";
import { useState } from "react";

export function usePromise(promise, initialState = []) {
  const [data, setData] = useState(initialState);
  useEffect(() => {
    if (promise) {
      let ignore = false;
      promise.then((json) => {
        if (!ignore) setData(json);
      });
      return () => {
        ignore = true;
      };
    }
  }, [promise]);
  return data;
}
