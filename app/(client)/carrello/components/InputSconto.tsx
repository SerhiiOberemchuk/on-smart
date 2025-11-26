"use client";
import Image from "next/image";
import icon_coupon from "@/assets/icons/icon_coupon.svg";
import icon_arrov from "@/assets/icons/arrow-top.svg";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export default function InputSconto() {
  const [isOpenInput, setIsOpenInput] = useState(false);
  return (
    <div className="flex flex-col gap-2 transition-all duration-300">
      <label
        htmlFor="carello-sconto"
        onClick={() => setIsOpenInput((prev) => !prev)}
        className="input_M_18 flex cursor-pointer items-center gap-2 hover:text-yellow-500"
      >
        <Image src={icon_coupon} alt="coupon icon" />
        <span>Codici sconto (opzionale) </span>
        <Image
          src={icon_arrov}
          alt="arrow icon"
          className={twMerge(
            "ml-auto rotate-x-180 transition-all duration-300",
            isOpenInput && "rotate-x-0",
          )}
        />
      </label>

      <div
        className={twMerge(
          "max-h-0 w-full overflow-hidden transition-all duration-300",
          isOpenInput && "max-h-40",
        )}
      >
        <input
          id="carello-sconto"
          name="sconto"
          type="text"
          className="w-full border-b border-white p-3 text-white outline-0 placeholder:text-white"
        />
      </div>
    </div>
  );
}
