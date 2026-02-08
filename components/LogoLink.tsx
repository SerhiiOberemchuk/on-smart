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
    <Link href="/" className={twMerge("m-0 flex w-fit p-0", className)} aria-label="link a casa">
      <Image
        className={twMerge(
          footer === false && "h-[52px] w-[78px] md:h-[74px] md:w-[108px]",
          footer === true && "h-auto w-[98px] md:w-[178px]",
        )}
        src={"/logo.svg"}
        width={108}
        height={74}
        alt="logo link"
        loading="eager"
      />
    </Link>
  );
}
