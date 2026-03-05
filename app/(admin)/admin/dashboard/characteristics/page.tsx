import {
  getAllCharacteristicsWithMeta,
  type GetAllCharacteristicsWithMetaResponse,
} from "@/app/actions/product-characteristic/create-product-characteristic";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import ButtonAddCharacteristic from "./components/ButtonAddCharacteristic";
import { CharacteristicModal } from "./components/CharacteristicModal";
import ListCharacteristics from "./components/ListCharacteristics";

export default function CharacteristicsPage() {
  const characteristicsPromise: GetAllCharacteristicsWithMetaResponse =
    getAllCharacteristicsWithMeta();

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Характеристики</h1>
          <p className="admin-subtitle">Керування шаблонами характеристик товарів</p>
        </div>
      </div>

      <Suspense fallback={<Spiner />}>
        <ButtonAddCharacteristic />
      </Suspense>
      <Suspense fallback={<Spiner />}>
        <ListCharacteristics dataPromise={characteristicsPromise} />
      </Suspense>
      <Suspense fallback={<Spiner />}>
        <CharacteristicModal />
      </Suspense>
    </section>
  );
}
