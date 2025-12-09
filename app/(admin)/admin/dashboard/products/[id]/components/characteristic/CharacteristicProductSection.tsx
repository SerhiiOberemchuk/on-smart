import Description from "./Description";
import DocumentsProduct from "./DocumentsProduct";
import SpecificheProductAdmin from "./SpecificheProductAdmin";
import ValutazioneProduct from "./ValutazioneProduct";

export default function CharacteristicProductSection({ id }: { id: string }) {
  return (
    <section className="mt-3 flex flex-col gap-3">
      <Description id={id} />
      <SpecificheProductAdmin id={id} />
      <DocumentsProduct id={id} />
      <ValutazioneProduct id={id} />
    </section>
  );
}
