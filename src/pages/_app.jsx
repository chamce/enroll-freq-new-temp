// import viteLogo from "/icons/vite.svg";
// import { useState } from "react";

import { Dashboard } from "../components/Dashboard";
// import reactLogo from "../assets/react.svg";
import "../styles/App.css";

import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-balham.css"; // Optional Theme applied to the Data Grid

const App = ({ routes }) => {
  // const [count, setCount] = useState(0);

  return (
    <>
      <Dashboard></Dashboard>
      {/* <div>{routes}</div> */}
    </>
  );
};

export default App;
