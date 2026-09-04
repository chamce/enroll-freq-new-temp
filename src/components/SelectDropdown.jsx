import Dropdown from "./Dropdown";

export default function SelectDropdown({
  formatValue = (value) => value,
  onChange,
  options,
  value,
  label,
}) {
  return (
    <Dropdown
      renderButton={(api) => (
        <Dropdown.Button variant="light" {...api}>
          {label}: {formatValue(value)}
        </Dropdown.Button>
      )}
    >
      {(api) => (
        <Dropdown.Menu {...api}>
          {options.map((option) => (
            <Dropdown.Item
              onClick={() => onChange(option)}
              active={value === option}
              key={option}
            >
              {formatValue(option)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );
}
