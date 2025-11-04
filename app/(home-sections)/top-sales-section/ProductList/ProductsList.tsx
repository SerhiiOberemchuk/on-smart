import CardProduct from "@/components/ProductCard/CardProduct";
import { getTopProducts } from "./action";
import styles from "./styles.module.css";
import { clsx } from "clsx";

export default async function ProductsList() {
  const products = await getTopProducts(1);
  return (
    <ul className={clsx(styles.top_products_list, "gap-3   md:gap-4 xl:gap-5")}>
      {products.map((product) => (
        <li key={product.id}>
          <CardProduct {...product} />
        </li>
      ))}
    </ul>
  );
}
