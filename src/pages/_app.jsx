// import viteLogo from "/icons/vite.svg";
// import { useState } from "react";

import { Dashboard } from "../components/Dashboard";
// import reactLogo from "../assets/react.svg";
import "../styles/App.css";

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
