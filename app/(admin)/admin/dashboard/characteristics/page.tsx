import ButtonAddCharacteristic from "./components/ButtonAddCharacteristic";
import ListCharacteristics from "./components/ListCharacteristics";
import { CharacteristicModal } from "./components/CharacteristicModal";
import { Suspense } from "react";
import { getAllCharacteristicsWithMeta } from "@/app/actions/product-characteristic/create-product-characteristic";

export default function OrderPage() {
  const get = getAllCharacteristicsWithMeta();
  return (
    <Suspense>
      <section className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title">Характеристики</h1>
            <p className="admin-subtitle">Керування шаблонами характеристик товарів</p>
          </div>
        </div>

        <Suspense fallback={<p>Завантаження...</p>}>
          <ButtonAddCharacteristic />
        </Suspense>
        <Suspense fallback={<p>Завантаження...</p>}>
          <ListCharacteristics action={get} />
        </Suspense>
        <Suspense fallback={<p>Завантаження...</p>}>
          <CharacteristicModal />
        </Suspense>
      </section>
    </Suspense>
  );
}
