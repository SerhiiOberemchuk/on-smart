import { Product } from "@/db/schemas/product";

export const allProducts: Product[] = [
  {
    id: "1",
    brand_slug: "Mach Power",
    name: "Telecamera IP Wi-Fi Full HD",
    nameFull: "Telecamera IP Wi-Fi con visione notturna, audio bidirezionale e app mobile.",
    category_slug: "telecamere",
    price: "59.9",
    oldPrice: "79.9",
    imgSrc: "/products/product.png",
    rating: "5",
    inStock: 5,
    slug: "Telecamera-IP-Wi-Fi-con-visione-notturna-audio-bidirezionale-e-app-mobile",
    variants: ["o1", "o2", "o3"],
    toOrder: false,
    hasVariants: false,
    parent_product_id: null,
  },
  {
    id: "2",
    brand_slug: "Uniview",
    name: "Telecamera da Esterno 4 MP",
    nameFull: "Telecamera di sicurezza 4 MP con visione IR 30 m e scocca impermeabile IP67.",
    category_slug: "telecamere",
    price: "119.9",
    oldPrice: "139.9",
    imgSrc: "/products/product.png",
    rating: "4",
    inStock: 2,
    slug: "Telecamera_di_sicurezza_4_MP",
    toOrder: false,
    hasVariants: false,
    parent_product_id: null,
    variants: [],
  },
];

// ========== 2. Інші товари ==========
export const otherProducts: Product[] = allProducts.map((p, i) => ({
  ...p,
  id: `o${i + 1}`,
  price: (Number(p.price) * 0.9).toFixed(2),
  name: `${p.name} – Variant`,
  inStock: p.inStock + 10,
}));

// ========== 3. Рекомендовані ==========
export const recomedProducts: Product[] = allProducts.map((p, i) => ({
  ...p,
  id: `r${i + 1}`,
  rating: Math.min(5, Number(p.rating) + 0.5).toString(),
  oldPrice: p.price + 20,
  price: p.price + 10,
  name: `${p.name} – Reccomended`,
}));
