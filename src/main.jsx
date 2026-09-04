import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import { RemoteComponentProvider, getWrapperRemoteUrl } from "./remote";
import "./styles/App.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const wrapperUrl = getWrapperRemoteUrl();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RemoteComponentProvider url={wrapperUrl}>
      <App />
    </RemoteComponentProvider>
  </React.StrictMode>,
);
