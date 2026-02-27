"use client";

import ButtonYellow from "@/components/BattonYellow";
import { useCharacteristicStore } from "../store/useCharacteristicStore";

export default function ButtonAddCharacteristic() {
  const { openCreate } = useCharacteristicStore();

  return (
    <ButtonYellow type="button" className="admin-btn-primary w-fit !px-4 !py-2 !text-sm" onClick={openCreate}>
      Додати нову характеристику
    </ButtonYellow>
  );
}
