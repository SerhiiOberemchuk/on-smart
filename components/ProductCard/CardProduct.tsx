import { Product } from "@/types/product.type";
import Image from "next/image";
import styles from "./product-styles.module.css";
import ButtonComparison from "./ButtonComparison";
import ButtonAddToCart from "./ButtonAddToCart";
import Link from "next/link";
import TitleTooltip from "./TitleTooltip";

export default function CardProduct({
  name,
  price,
  imgSrc,
  id,
  category,
  brand,
  oldPrice,
  rating,
}: Product) {
  return (
    <article className={styles.card}>
      <header className="absolute top-0 right-0 left-0 flex items-center px-1 md:px-2 xl:px-3">
        {oldPrice && <span className="helper_XXS mr-2 bg-offerta-color px-2 py-1">offerta</span>}
        <span className="helper_XXS bg-blue px-2 py-1">in arrivo</span>
        <ButtonComparison id={id} />
      </header>
      <figure className="">
        <Link href={`/catalogo/${category}/${brand}/${id}`} aria-label={name}>
          <Image
            src={imgSrc}
            className="aspect-square object-contain object-center p-1 md:p-2 xl:p-3"
            width={310}
            height={310}
            alt={name}
          />
        </Link>
        <figcaption className="mt-2 px-1 md:mt-3 md:px-2 xl:px-3">
          <h2
            className="body_R_20 two_line_ellipsis"
            data-tooltip-id="card-title-tooltip"
            data-tooltip-content={name}
          >
            {name}
          </h2>
          <TitleTooltip id="card-title-tooltip" />
          <h3 className="helper_text my-2 text-text-grey capitalize">{category}</h3>
          <div className="flex gap-px">
            {Array.from({ length: 5 }, (_, i) => {
              console.log(rating);

              return rating >= i + 1 ? (
                <svg
                  className="size-4 xl:size-6"
                  key={i}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.81475 22L7.45551 14.9732L2 10.249L9.18624 9.62738L12.0007 3L14.8151 9.62606L22 10.2477L16.5445 14.9719L18.1866 21.9987L12.0007 18.269L5.81475 22Z"
                    fill="#FFB939"
                  />
                </svg>
              ) : (
                <svg
                  className="size-4 xl:size-6"
                  key={i}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.83262 19.2253L12.0007 16.7124L16.1687 19.2583L15.0771 14.4971L18.7489 11.3229L13.9193 10.8931L12.0007 6.39635L10.082 10.86L5.2524 11.2899L8.92425 14.4971L7.83262 19.2253ZM5.81475 22L7.45551 14.9732L2 10.249L9.18624 9.62738L12.0007 3L14.8151 9.62606L22 10.2477L16.5445 14.9719L18.1866 21.9987L12.0007 18.269L5.81475 22Z"
                    fill="#FFB939"
                  />
                </svg>
              );
            })}
          </div>
        </figcaption>
      </figure>
      <div className="mt-auto flex items-start justify-between p-1 pt-0 md:p-2 xl:p-3">
        <div className="flex h-14 flex-col">
          <span className="H3 text-red">{price.toFixed(2)} €</span>
          {oldPrice && <span className="price_clossed mt-2">{oldPrice.toFixed(2)} €</span>}
        </div>
        <ButtonAddToCart id={id} />
      </div>
    </article>
  );
}
