import ButtonAddCharacteristic from "./components/ButtonAddCharacteristic";
import ListCharacteristics from "./components/ListCharacteristics";
import { CharacteristicModal } from "./components/CharacteristicModal";
import { Suspense } from "react";
import { getAllCharacteristicsWithMeta } from "@/app/actions/product-characteristic/create-product-characteristic";

export default function OrderPage() {
  const get = getAllCharacteristicsWithMeta();
  return (
    <Suspense>
      <div className="p-3">
        <Suspense fallback={<p>Loading...</p>}>
          <ButtonAddCharacteristic />
        </Suspense>
        <Suspense fallback={<p>Loading...</p>}>
          <ListCharacteristics action={get} />
        </Suspense>
        <Suspense fallback={<p>Loading...</p>}>
          <CharacteristicModal />
        </Suspense>
      </div>
    </Suspense>
  );
}
