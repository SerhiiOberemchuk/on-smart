import PricesBox from "@/components/PricesBox";
import ProductSlider from "@/components/ProductPageSections/VisualTopSection/ProductSlider";
import type { ProductType } from "@/db/schemas/product.schema";
import BundleAddToCartButton from "./BundleAddToCartButton";
import type { BundleAvailability, BundlePageData } from "./bundle-page.types";

type BundleHeroSectionProps = {
  bundle: BundlePageData;
  bundleAsProduct: ProductType;
  sliderImages: string[];
  availability: BundleAvailability;
  discountValue: number;
  discountPercent: number;
  bundleDescription: string;
  advantages: string[];
};

export default function BundleHeroSection({
  bundle,
  bundleAsProduct,
  sliderImages,
  availability,
  discountValue,
  discountPercent,
  bundleDescription,
  advantages,
}: BundleHeroSectionProps) {
  return (
    <section>
      <div className="flex flex-col items-center gap-5 pt-3 pb-6 md:container xl:flex-row xl:items-start xl:pb-3">
        <ProductSlider
          product={bundleAsProduct}
          images={sliderImages}
          brandLogo={bundle.brand_image}
          brandName={bundle.brand_name}
        />
        <div className="w-full px-4 md:px-0 xl:flex-1">
          <div className="w-full rounded-sm bg-background p-3">
            <span className="helper_text inline-flex rounded-sm bg-yellow-500 px-2 py-1 text-black">
              Kit
            </span>
            <h1 className="H3 mt-4">{bundle.nameFull}</h1>
            <p className="helper_text mt-2 text-text-grey capitalize">
              {bundle.category_name} / {bundle.brand_name}
            </p>

            <div className="mt-4">
              <PricesBox
                price={bundle.price}
                oldPrice={bundle.oldPrice}
                place="dialog-cart-product-footer"
              />
            </div>

            {discountValue > 0 ? (
              <p className="helper_text mt-2 text-yellow-500">
                Risparmi {discountValue.toFixed(2)} EUR ({discountPercent}%)
              </p>
            ) : null}

            <p className={`helper_text mt-3 ${availability.className}`}>{availability.label}</p>

            <BundleAddToCartButton
              bundleId={bundle.id}
              inStock={bundle.inStock}
              disabled={bundle.inStock <= 0 && !bundle.isOnOrder}
            />

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-text-grey md:grid-cols-2">
              <p>EAN: {bundle.ean}</p>
              <p>
                Dimensioni (cm): {bundle.lengthCm} x {bundle.widthCm} x {bundle.heightCm}
              </p>
              <p>Peso (kg): {bundle.weightKg}</p>
            </div>

            {bundleDescription ? (
              <div className="mt-4 border-t border-stroke-grey pt-4">
                <h2 className="H4">Descrizione del Kit</h2>
                <p className="text_R mt-2 whitespace-pre-line text-text-grey">{bundleDescription}</p>
              </div>
            ) : null}
          </div>
          {advantages.length > 0 ? (
            <section className="mt-4 mb-6">
              <div className="rounded-sm border border-yellow-500/40 bg-yellow-500/8 p-4 md:p-6">
                <h2 className="H4">Vantaggi del Kit</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {advantages.map((item, index) => (
                    <li key={`${item}-${index}`} className="body_R_20 flex items-start gap-2">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}
