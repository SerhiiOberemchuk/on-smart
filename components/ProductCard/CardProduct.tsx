import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import TitleTooltip from "./card-components/TitleTooltip";
import { Product } from "@/types/product.types";
import HeaderProductCard from "../HeaderProductCard";
import PricesBox from "../PricesBox";
import StarsRating from "../StarsRating";
import styles from "./product-styles.module.css";
import ButtonOpenDialogAddToCart from "../ButtonOpenDialogAddToCart";

export default function CardProduct({ className, ...product }: Product & { className?: string }) {
  const { name, price, imgSrc, id, category, brand, oldPrice, rating, inStock } = product;
  return (
    <article className={clsx(styles.card, className)}>
      <HeaderProductCard oldPrice={oldPrice} inStock={inStock} id={id} />
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

          <StarsRating rating={rating} />
        </figcaption>
      </figure>
      <div className="mt-auto flex items-start justify-between p-1 pt-0 md:p-2 xl:p-3">
        <PricesBox place="main-card-product" price={price} oldPrice={oldPrice} />
        <ButtonOpenDialogAddToCart {...product} />
      </div>
    </article>
  );
}
