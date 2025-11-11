import { Product } from "@/types/product.types";
import ProductSlider from "./ProductSlider";
import SelectProductSection from "./SelectProductSection";

export default function VisualProductSection({ product }: { product: Product }) {
  return (
    <section>
      <div className="flex flex-col gap-5 pt-3 pb-6 md:container xl:flex-row xl:pb-3">
        <ProductSlider product={product} />
        <SelectProductSection product={product} />
      </div>
    </section>
  );
}
