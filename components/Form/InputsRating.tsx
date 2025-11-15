"use client";

import { MAX_RATING } from "@/constans";
import Image from "next/image";
import starfull from "@/assets/icons/star-full.svg";
import starempty from "@/assets/icons/star-empty.svg";
import { useState } from "react";

export default function InputsRating() {
  const [checked, setChecked] = useState<number | 0>(0);
  return (
    <div className="mb-2 flex flex-col gap-1">
      <h4 className="input_M_18">Valutazione</h4>
      <div className="flex gap-1">
        {Array.from(
          { length: MAX_RATING }, // MAX_RATING = 5
          (_, index) => (
            <label key={index} className="cursor-pointer">
              <input
                type="radio"
                required
                value={index + 1}
                name="rating"
                id={`rating${index + 1}`}
                className="sr-only"
                onChange={() => setChecked(index + 1)}
                checked={checked === index + 1}
              />
              <Image alt="empty star" src={checked >= index + 1 ? starfull : starempty} />
            </label>
          ),
        )}
      </div>
      <span className="helper_text text-text-grey">Inserisci una valutazione.</span>
    </div>
  );
}
