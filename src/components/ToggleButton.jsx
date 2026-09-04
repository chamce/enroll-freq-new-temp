import { Checkbox } from "./Checkbox";

export const ToggleButton = ({
  active,
  setActive,
  children,
  className = "",
  tooltip,
}) => (
  <button
    className={`${className} btn btn-light bg-gradient icon-link`.trim()}
    onClick={() => setActive((value) => !value)}
    data-tooltip={tooltip}
    aria-pressed={active}
    type="button"
  >
    <Checkbox active={active} />
    {children}
  </button>
);
