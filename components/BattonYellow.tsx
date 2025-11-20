import { twMerge } from "tailwind-merge";

export default function ButtonYellow({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={twMerge(
        "btn rounded-sm bg-yellow-500 px-4 py-2 text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
