"use server";

import { Category } from "@/types/category.type";

export async function getCategories() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    categoryType: "telecamere",
    categoryName: `Telecamere di sicurezza ${i + 1}`,
    imageUrl: "/products/завантаження.avif",
  })) satisfies Category[];
}
