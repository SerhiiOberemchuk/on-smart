import { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type InputAdminStyleProps = InputHTMLAttributes<HTMLTextAreaElement> & { label_title: string };

export default function TextAreaAdminComponent(props: InputAdminStyleProps) {
  return (
    <label className={twMerge("mb-1 block", props.className)}>
      {props.label_title}
      <textarea
        className="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-white"
        {...props}
      />
    </label>
  );
}
