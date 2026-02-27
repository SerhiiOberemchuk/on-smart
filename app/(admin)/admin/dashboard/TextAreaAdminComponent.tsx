import { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type InputAdminStyleProps = InputHTMLAttributes<HTMLTextAreaElement> & { label_title: string };

export default function TextAreaAdminComponent({
  className,
  label_title,
  ...props
}: InputAdminStyleProps) {
  return (
    <label className={twMerge("admin-field", className)}>
      <span className="admin-field-label">{label_title}</span>
      <textarea className="admin-textarea" {...props} />
    </label>
  );
}
