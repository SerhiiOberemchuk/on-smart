import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.svg";

export default function LogoLink() {
  return (
    <Link href="/" className="m-0 flex w-fit p-0" aria-label="link a casa">
      <Image
        className=""
        src={logo}
        width={108}
        // style={{ height: "auto" }}
        alt="logo link"
      />
    </Link>
  );
}
