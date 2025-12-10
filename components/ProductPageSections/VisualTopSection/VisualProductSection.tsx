import { Product } from "@/db/schemas/product";
import ProductSlider from "./ProductSlider";
import SelectProductSection from "./SelectProductSection";

export default function VisualProductSection({ product }: { product: Product }) {
  return (
    <section>
      <div className="flex flex-col items-center gap-5 pt-3 pb-6 md:container xl:flex-row xl:items-start xl:pb-3">
        <ProductSlider product={product} />
        <SelectProductSection product={product} />
      </div>
    </section>
  );
}
