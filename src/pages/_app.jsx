import viteLogo from "/icons/vite.svg";
import { useState } from "react";

import reactLogo from "../assets/react.svg";
import "../styles/App.css";

const App = ({ routes }) => {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="text-center vstack gap-3">
        <div className="hstack gap-4 justify-content-center flex-wrap">
          <a href="https://vitejs.dev" rel="noreferrer" target="_blank">
            <img className="logo" alt="Vite logo" src={viteLogo} />
          </a>
          <a href="https://react.dev" rel="noreferrer" target="_blank">
            <img className="logo react" alt="React logo" src={reactLogo} />
          </a>
        </div>
        <div className="display-4">Vite + React</div>
        <div>
          <button onClick={() => setCount((count) => count + 1)} className="btn btn-primary btn-outset">
            count is {count}
          </button>
        </div>
        <div>
          Edit <code>src/App.jsx</code> and save to test HMR
        </div>
        <div className="read-the-docs">Click on the Vite and React logos to learn more</div>
        <div>{routes}</div>
      </div>
    </>
  );
};

export default App;
