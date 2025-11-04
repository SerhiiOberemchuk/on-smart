import { Product } from "@/types/product.type";
import Image from "next/image";
import styles from "./product-styles.module.css";
import ButtonComparison from "./ButtonComparison";
import ButtonAddToCart from "./ButtonAddToCart";
import Link from "next/link";

export default function CardProduct({
  name,
  price,
  imgSrc,
  id,
  category,
  brand,
  oldPrice,
}: Product) {
  return (
    <article className={styles.card}>
      <header className="absolute top-0 right-0 left-0 flex items-center px-1 md:px-2 xl:px-3">
        <span className="helper_XXS mr-2 bg-offerta-color px-2 py-1">offerta</span>
        <span className="helper_XXS bg-blue px-2 py-1">in arrivo</span>
        <ButtonComparison id={id} />
      </header>
      <figure className="">
        <Link href={`/catalogo/${category}/${brand}/${id}`} aria-label={name}>
          <Image src={imgSrc} className="p-1 md:p-2 xl:p-3" width={310} height={310} alt={name} />
        </Link>
        <figcaption className="mt-2 px-1 md:mt-3 md:px-2 xl:px-3">
          <h2 className="body_R_20">{name}</h2>{" "}
          <h3 className="helper_text my-2 text-text-grey capitalize">{category}</h3>
          <span>top</span>
        </figcaption>
      </figure>
      <div className="mt-5 flex items-start justify-between p-1 pt-0 md:mt-6 md:p-2 xl:mt-10 xl:p-3">
        <div className="flex flex-col">
          <span className="H3 text-red">{price.toFixed(2)} €</span>
          {oldPrice && <span className="price_clossed mt-2">{oldPrice.toFixed(2)} €</span>}
        </div>
        <ButtonAddToCart id={id} />
      </div>
    </article>
  );
}
