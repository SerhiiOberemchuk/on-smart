import Image from "next/image";
import Link from "next/link";

export default function LogoLink() {
  return (
    <Link href="/" className="m-0 flex w-fit p-0" aria-label="link a casa">
      <Image
        className="h-[52px] w-[78px] md:h-[74px] md:w-[108px]"
        src={"/logo.svg"}
        width={108}
        height={74}
        alt="logo link"
        loading="eager"
      />
    </Link>
  );
}
