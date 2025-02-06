import ReactDOM from "react-dom/client";
import React from "react";

import Wrapper from "./Wrapper.jsx";
// import Routes from "./routes.jsx";
import { Dashboard } from "../components/Dashboard.jsx";
import App from "../App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>,
);
