import Image from "next/image";
import Link from "next/link";

export default function LogoLink() {
  return (
    <Link href="/" className="flex w-fit" aria-label="link a casa">
      <Image src={"/logo.svg"} width={50} height={50} alt="logo link" />
    </Link>
  );
}
