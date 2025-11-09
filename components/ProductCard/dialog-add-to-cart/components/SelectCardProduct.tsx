// import Image from "next/image";
// import { twMerge } from "tailwind-merge";
// import PricesBox from "@/components/PricesBox";
// import styles from "../../ProductCard.module.css";

// export default function SelectCardProduct() {
//   return (
//     <label
//       key={variant.id}
//       htmlFor={variant.id}
//       className={twMerge("body_R_20 ml-1 p-3 xl:ml-4", styles.label_variant)}
//     >
//       <input
//         disabled={variant.inStock === 0}
//         type="radio"
//         id={variant.id}
//         name="Product variant"
//         value={variant.id}
//         checked={selectedProduct?.id === variant.id}
//         onChange={() => setSelectedProduct(variant)}
//         className="sr-only"
//       />
//       <Image
//         src={variant.imgSrc || variant.images?.[0] || "/logo.svg"}
//         alt={variant.name}
//         width={80}
//         height={80}
//         className="h-10 w-10 object-contain object-center lg:h-20 lg:w-20"
//       />
//       <span className="pointer-events-none line-clamp-1">{variant.name}</span>
//       <PricesBox
//         oldPrice={variant.oldPrice}
//         place="dialog-cart-product-variant"
//         price={variant.price}
//         className="pointer-events-none ml-auto flex-col"
//       />
//     </label>
//   );
// }
