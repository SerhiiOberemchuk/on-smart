import Image from "next/image";
import Link from "next/link";
import carello from "@/assets/icons/carrello.svg";

export default function Cart() {
  return (
    <Link href={"/carrello"} className="relative flex gap-2.5 px-4 py-2">
      <div className="absolute grid h-3 w-3 place-content-center place-items-center rounded-full bg-yellow-500 text-[6px] font-medium text-black">
        <span className="text-center">5</span>
      </div>
      <Image src={carello} width={24} alt="Carrello" title="Carrello" />

      <span className="text-[20px] font-semibold">Carrello</span>
    </Link>
  );
}
