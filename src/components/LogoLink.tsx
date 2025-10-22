import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.svg";

export default function LogoLink() {
  return (
    <Link href="/" className="flex w-fit m-0 p-0" aria-label="link a casa">
      <Image
        className=""
        src={logo}
        width={50}
        // style={{ height: "auto" }}
        alt="logo link"
      />
    </Link>
  );
}
