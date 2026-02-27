import Description from "./Description";
import DocumentsProduct from "./DocumentsProduct";
import SpecificheProductAdmin from "./SpecificheProductAdmin";
import ValutazioneProduct from "./ValutazioneProduct";

export default function CharacteristicProductSection({
  id,
  category_id,
}: {
  id: string;
  category_id: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <Description id={id} />
      <SpecificheProductAdmin product_id={id} category_id={category_id} />
      <DocumentsProduct id={id} />
      <ValutazioneProduct id={id} />
    </section>
  );
}
