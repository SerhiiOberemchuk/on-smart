import { SelectHTMLAttributes } from "react";
// import { ulid } from "ulid";

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
  // const idhtmlFor = ulid();
  return (
    <div className="flex w-full flex-col text-white">
      <label htmlFor={selectTitle}>{selectTitle}</label>
      <select
        id={selectTitle}
        {...rest}
        className="rounded border border-neutral-700 bg-neutral-800 p-2.5"
      >
        <option value="">{optionsTitle}</option>
        {options.map((item, i) => (
          <option key={i} value={item.value}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
