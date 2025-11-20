import { twMerge } from "tailwind-merge";

export function InputBlock({
  title,
  className,
  ...rest
}: { title: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={twMerge("helper_text flex flex-col gap-1", className)}>
      {title}
      <input className="border-b border-stroke-grey text-text-grey outline-0" {...rest} />
    </label>
  );
}
