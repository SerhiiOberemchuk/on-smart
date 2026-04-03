import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import TitleTooltip from "./card-components/TitleTooltip";
import HeaderProductCard from "../HeaderProductCard";
import PricesBox from "../PricesBox";
import StarsRating from "../StarsRating";
import styles from "./product-styles.module.css";
import ButtonOpenDialogAddToCart from "../ButtonOpenDialogAddToCart";
import { ProductType } from "@/db/schemas/product.schema";
import clsx from "clsx";

export default function CardProduct({
  className,
  ...product
}: ProductType & { className?: string }) {
  const {
    name,
    price,
    imgSrc,
    id,
    category_slug,
    brand_slug,
    slug,
    oldPrice,
    rating,
    inStock,
    isOnOrder,
    nameFull,
    productType,
  } = product;
  const titleTooltipId = `card-title-tooltip-${id}`;
  const isBundle = productType === "bundle";
  const productHref = isBundle
    ? `/catalogo/${category_slug}/${brand_slug}/bundle/${slug}`
    : `/catalogo/${category_slug}/${brand_slug}/${slug}`;

  return (
    <article className={clsx(styles.card, className)}>
      <HeaderProductCard oldPrice={oldPrice} inStock={inStock} isOnOrder={isOnOrder} id={id} />
      <figure className="">
        <Link href={productHref} aria-label={name} prefetch={false}>
          <SmartImage
            src={imgSrc}
            className="aspect-square object-contain object-center p-1 md:p-2 xl:p-3"
            width={310}
            height={310}
            alt={name}
          />
        </Link>
        <figcaption className="relative mt-2 px-1 md:mt-3 md:px-2 xl:px-3">
          {isBundle && (
            <span className="helper_XXS absolute -top-1/5 left-0 w-fit rounded-sm border border-yellow-500 bg-yellow-500 px-2 py-1 tracking-wide text-white uppercase">
              Kit
            </span>
          )}
          <h2
            className="body_R_20 line-clamp-3 min-h-[72px]"
            data-tooltip-id={titleTooltipId}
            data-tooltip-content={nameFull}
          >
            {name}
          </h2>
          <TitleTooltip id={titleTooltipId} />
          <h3 className="helper_text my-2 text-text-grey capitalize">{category_slug}</h3>

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

