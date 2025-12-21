"use client";
import ButtonYellow from "@/components/BattonYellow";
import { useCharacteristicStore } from "../store/useCharacteristicStore";

export default function ButtonAddCharacteristic() {
  const { openCreate } = useCharacteristicStore();
  return (
    <ButtonYellow
      type="button"
      className="fixed top-2 left-1/2 -translate-x-1/2"
      onClick={openCreate}
    >
      Додати нову характеристику
    </ButtonYellow>
  );
}
