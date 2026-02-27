import { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type InputAdminStyleProps = InputHTMLAttributes<HTMLInputElement> & { input_title: string };

export default function InputAdminStyle({
  className,
  input_title,
  type,
  ...props
}: InputAdminStyleProps) {
  const isCheckbox = type === "checkbox";
  const isFile = type === "file";

  return (
    <label
      className={twMerge("admin-field", isCheckbox && "admin-field-inline", className)}
      data-admin-input-type={type}
    >
      <span className="admin-field-label">{input_title}</span>

      <input
        type={type}
        className={twMerge(
          isCheckbox && "admin-checkbox",
          isFile && "admin-file-input",
          !isCheckbox && !isFile && "admin-input",
        )}
        {...props}
      />
    </label>
  );
}
