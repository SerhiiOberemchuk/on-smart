"use server";

import { Product } from "@/types/product.types";

export async function getTopProducts() {
  // console.log({ getTopProductsPage: page });

  // const res = await fetch(`${process.env.API_URL}/products?filter=top&page=${page}`, {
  //   headers: {
  //     Authorization: `Bearer ${process.env.API_TOKEN}`,
  //   },
  //   next: { revalidate: 60 * 30 }, // ISR (оновлення раз на 30 хв)
  // });

  // if (!res.ok) throw new Error("Failed to load top products");
  // const products: { title: string; id: string; name: string }[] = await res.json();
  const products: Product[] = Array.from({ length: 20 }, (_, i) => {
    const product: Product = {
      id: `${i + 1}`,
      name: `Distributore automatico di sapone ${i + 1 + 5077951546454545 * i}`,
      category: "telecamere" + i,
      description: `Distributore automatico di sapone${i + 1}`,
      price: (i + 1) * 12.9,
      imgSrc: "/products/product.png",
      brand: "OnSmart" + i,
      quantity: 1 + i,
      rating: Number((5).toFixed()),
      inStock: i % 3 === 0 ? 0 : 10,
      images: ["/products/category1.avif", "/products/product.png"],
    };
    if (i % 2 === 0) {
      product.oldPrice = 5 * i + 1;
    }
    return product;
  });

  return products;
}
