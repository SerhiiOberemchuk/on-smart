"use server";

import { Category } from "@/types/category.types";

export async function getCategories() {
  const categories: Category[] = [
    {
      id: 1,
      categoryType: "upc",
      categoryName: "UPC",
      imageUrl: "/categories/category_card.png",
    },
    {
      id: 2,
      categoryType: "dvr-nvr",
      categoryName: "DVR/NVR",
      imageUrl: "/categories/category_card.png",
    },
    {
      id: 3,
      categoryType: "antifurto",
      categoryName: "Antifurto",
      imageUrl: "/categories/category_card.png",
    },
    {
      id: 4,
      categoryType: "cavi",
      categoryName: "Cavi",
      imageUrl: "/categories/category_card.png",
    },
    {
      id: 5,
      categoryType: "ups",
      categoryName: "UPS",
      imageUrl: "/categories/category_card.png",
    },
    {
      id: 6,
      categoryType: "hdd/ssd",
      categoryName: "HDD/SSD",
      imageUrl: "/categories/category_card.png",
    },
    {
      id: 7,
      categoryType: "alimentatori",
      categoryName: "Alimentatori",
      imageUrl: "/categories/category_card.png",
    },
    {
      id: 8,
      categoryType: "dvr-telecamere",
      categoryName: "DVR Telecamere (kit)",
      imageUrl: "/categories/category_card.png",
    },
  ];
  return categories;
}
