import { memo } from "react";

import { Checkbox } from "./Checkbox";

export const Dropdown = memo(({ setState, children, dataKey, values, state }) => {
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
        <DropdownItem
          isChecked={state.size === values.length}
          setState={setState}
          isAllButton={true}
          dataKey={dataKey}
          values={values}
        >
          All ({state.size + "/" + values.length})
        </DropdownItem>
        {values.map((value) => (
          <DropdownItem
            isChecked={state.has(value)}
            setState={setState}
            dataKey={dataKey}
            values={values}
            value={value}
            key={value}
          >
            {value}
          </DropdownItem>
        ))}
      </ul>
    </div>
  );
});

const DropdownItem = memo(({ isAllButton, isChecked, setState, children, dataKey, values, value }) => {
  return (
    <li onClick={() => handleDropdownItemClicked(isAllButton, dataKey, value, values, setState)}>
      <button className="dropdown-item icon-link" type="button">
        <Checkbox active={isChecked}></Checkbox>
        {children}
      </button>
    </li>
  );
});

const handleDropdownItemClicked = (clickedAllButton, key, value, values, setState) => {
  setState((state) => {
    const newState = { ...state };
    if (clickedAllButton) {
      newState[key] = newState[key].size === values.length ? new Set() : new Set(values);
    } else {
      newState[key] = new Set(newState[key]);
      const newSet = newState[key];
      newSet.has(value) ? newSet.delete(value) : newSet.add(value);
    }
    return newState;
  });
};
