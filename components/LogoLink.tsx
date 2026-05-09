import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function LogoLink({
  className,
  footer = false,
}: {
  className?: string;
  footer?: boolean;
}) {
  return (
    <Link
      href="/"
      className={twMerge("m-0 flex w-fit p-0", className)}
      aria-label="Vai alla home page"
    >
      <Image
        className={twMerge(
          "h-13 w-19.5 object-cover object-center md:h-18.5 md:w-27",
          footer === true && "h-auto w-24.5 md:w-44.5",
        )}
        src={"/Logo-ON-SMART new.png"}
        width={108}
        height={74}
        alt="OnSmart"
        loading="eager"
      />
    </Link>
  );
}
