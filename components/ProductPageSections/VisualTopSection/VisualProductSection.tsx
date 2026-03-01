import { ProductType } from "@/db/schemas/product.schema";
import ProductSlider from "./ProductSlider";
import SelectProductSection from "./SelectProductSection";

export default function VisualProductSection({
  product,
  images,
  brandLogo,
  brandName,
  variantsProduct,
}: {
  product: ProductType;
  images: string[];
  brandLogo: string;
  brandName: string;
  variantsProduct: ProductType[] | null;
}) {
  return (
    <section>
      <div className="flex flex-col items-center gap-5 pt-3 pb-6 md:container xl:flex-row xl:items-start xl:pb-3">
        <ProductSlider
          product={product}
          images={images}
          brandLogo={brandLogo}
          brandName={brandName}
        />
        <SelectProductSection product={product} variantsProduct={variantsProduct} />
      </div>
    </section>
  );
}
