import Image from "next/image";
import icon from "@/assets/icons/icon_search.svg";

export default function SearchMobile() {
  return (
    <button type="button" className="p-3 sm:hidden" aria-label="Cerca">
      <Image src={icon} alt="Cerca" aria-hidden />
    </button>
  );
}
