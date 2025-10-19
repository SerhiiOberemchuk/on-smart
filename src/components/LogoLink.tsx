import Image from "next/image";
import Link from "next/link";

export default function LogoLink() {
  return (
    <Link href="/" className="flex w-fit m-0 p-0" aria-label="link a casa">
      <Image
        className="h-auto"
        src={"/logo.svg"}
        width={50}
        height={34.7}
        alt="logo link"
        priority
      />
    </Link>
  );
}
