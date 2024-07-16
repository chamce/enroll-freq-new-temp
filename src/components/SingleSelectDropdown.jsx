import { memo } from "react";

import { formatKey } from "../helpers/formatKey";
import { Checkbox } from "./Checkbox";

export const SingleSelectDropdown = memo(({ children, setState, dataKeys, state }) => {
  return (
    <div className="dropdown col">
      <button
        className="btn btn-light dropdown-toggle w-100 btn-solid d-flex align-items-center justify-content-center"
        data-bs-auto-close="outside"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        type="button"
      >
        {children}
      </button>
      <ul className="dropdown-menu overflow-y-scroll" style={{ maxHeight: 300 }}>
        {dataKeys.map((dataKey) => (
          <SingleSelectDropdownItem isChecked={state === dataKey} setState={setState} dataKey={dataKey} key={dataKey}>
            {formatKey(dataKey)}
          </SingleSelectDropdownItem>
        ))}
      </ul>
    </div>
  );
});
const SingleSelectDropdownItem = memo(({ isChecked, children, setState, dataKey }) => {
  return (
    <li onClick={() => setState(dataKey)}>
      <button className="dropdown-item icon-link" type="button">
        <Checkbox active={isChecked}></Checkbox>
        {children}
      </button>
    </li>
  );
});
