import { useId } from "react";
import { twMerge } from "tailwind-merge";

export function InputBlock({
  title,
  className,
  ...rest
}: { title: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const inputId = rest.id ?? generatedId;

  return (
    <label htmlFor={inputId} className={twMerge("helper_text flex flex-col gap-1", className)}>
      {title}
      <input id={inputId} className="border-b border-stroke-grey text-text-grey outline-0" {...rest} />
    </label>
  );
}
