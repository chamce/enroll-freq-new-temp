import ReactDOM from "react-dom/client";
import React from "react";

import Wrapper from "./Wrapper.jsx";
import Routes from "./routes.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Wrapper>
      <Routes></Routes>
    </Wrapper>
  </React.StrictMode>,
);
