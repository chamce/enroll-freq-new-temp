import { useEffect, useState } from "react";

export function usePromise(promise, initialState = []) {
  const [data, setData] = useState(initialState);

  useEffect(() => {
    if (!promise) return undefined;

    let ignore = false;
    promise.then((result) => {
      if (!ignore) setData(result);
    });

    return () => {
      ignore = true;
    };
  }, [promise]);

  return data;
}
