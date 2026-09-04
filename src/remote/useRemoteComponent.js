import { useContext } from "react";

import RemoteComponentContext from "./RemoteComponentContext";

export default function useRemoteComponent() {
  const component = useContext(RemoteComponentContext);

  if (component == null) {
    throw new Error(
      "useRemoteComponent must be used inside <RemoteComponentProvider>.",
    );
  }

  return component;
}
