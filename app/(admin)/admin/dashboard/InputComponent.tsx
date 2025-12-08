import { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type InputAdminStyleProps = InputHTMLAttributes<HTMLInputElement> & { input_title: string };

export default function InputAdminStyle(props: InputAdminStyleProps) {
  return (
    <label className={twMerge("mb-1 block", props.className)}>
      {props.input_title}
      <input
        className="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-white"
        {...props}
      />
    </label>
  );
}
