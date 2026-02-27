import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: { name: string; value: string }[];
  selectTitle: string;
  optionsTitle: string;
};

export default function SelectComponentAdmin({
  options,
  optionsTitle,
  selectTitle,
  ...rest
}: SelectProps) {
  return (
    <label className="admin-field">
      <span className="admin-field-label">{selectTitle}</span>

      <select id={selectTitle} {...rest} className="admin-select">
        <option value="">{optionsTitle}</option>
        {options.map((item, i) => (
          <option key={i} value={item.value}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
