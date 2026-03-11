import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import type { IncludedBundleProduct } from "./bundle-page.types";

export default function BundleTabComponents({
  includedProducts,
  className,
  onContentResize,
}: {
  includedProducts: IncludedBundleProduct[];
  className?: string;
  onContentResize?: () => void;
}) {
  if (includedProducts.length === 0) {
    return (
      <div className={twMerge("rounded-sm bg-background p-4 md:p-6", className)}>
        <h2 className="H4">Componenti del kit</h2>
        <p className="text_R mt-3 text-text-grey">
          Al momento non ci sono prodotti inclusi in questo bundle.
        </p>
      </div>
    );
  }

  return (
    <div className={twMerge("flex flex-col gap-3 md:gap-4", className)}>
      {includedProducts.map(
        ({ product, quantity, shortDescription, characteristicTitle, characteristics }) => (
          <article key={product.id} className="rounded-sm bg-background p-3 md:p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <Link
                href={`/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`}
                className="block shrink-0"
              >
                <SmartImage
                  src={product.imgSrc}
                  alt={product.nameFull}
                  width={148}
                  height={148}
                  className="aspect-square rounded-sm border border-stroke-grey object-contain p-2"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`}
                  className="H4M line-clamp-2 hover:text-yellow-500"
                >
                  {product.nameFull}
                </Link>

                <ul className="mt-3 flex flex-col gap-2">
                  <li className="text_R flex items-center justify-between px-2 py-2 odd:bg-grey-hover-stroke">
                    <span className="text-text-grey">Quantita nel kit:</span>
                    <span>x{quantity}</span>
                  </li>
                  <li className="text_R flex items-center justify-between px-2 py-2 odd:bg-grey-hover-stroke">
                    <span className="text-text-grey">EAN:</span>
                    <span>{product.ean || "-"}</span>
                  </li>
                  <li className="text_R flex items-center justify-between px-2 py-2 odd:bg-grey-hover-stroke">
                    <span className="text-text-grey">Dimensioni (cm):</span>
                    <span>
                      {product.lengthCm} x {product.widthCm} x {product.heightCm}
                    </span>
                  </li>
                  <li className="text_R flex items-center justify-between px-2 py-2 odd:bg-grey-hover-stroke">
                    <span className="text-text-grey">Peso (kg):</span>
                    <span>{product.weightKg}</span>
                  </li>
                </ul>

                <div className="mt-3 rounded-sm border border-stroke-grey p-3">
                  <h3 className="input_R_18">Descrizione nel kit</h3>
                  <p className="text_R mt-2 text-text-grey">
                    {shortDescription || "Descrizione non disponibile per questo componente."}
                  </p>
                </div>

                <details
                  className="group mt-3 rounded-sm border border-stroke-grey bg-grey-hover-stroke/40"
                  onToggle={() => onContentResize?.()}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 select-none">
                    <span className="input_R_18">
                      {characteristicTitle || "Caratteristiche prodotto"}
                    </span>
                    <span className="text-sm text-yellow-500 transition-transform duration-200 group-open:rotate-180">
                      в–ѕ
                    </span>
                  </summary>

                  <div className="border-t border-stroke-grey p-3">
                    {characteristics.length > 0 ? (
                      <ul className="flex flex-col gap-2">
                        {characteristics.map((item, index) => (
                          <li
                            key={`${product.id}-characteristic-${item.name}-${index}`}
                            className="text_R flex items-center justify-between gap-3 px-2 py-2 odd:bg-background even:bg-transparent"
                          >
                            <span className="text-text-grey">{item.name}:</span>
                            <span className="text-right uppercase">{item.value}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text_R text-text-grey">
                        Le caratteristiche di questo prodotto non sono ancora disponibili.
                      </p>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </article>
        ),
      )}
    </div>
  );
}

