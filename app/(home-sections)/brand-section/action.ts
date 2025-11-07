"use server";

import { Brand } from "@/types/brand.types";

export async function getBrands() {
  const brands: Brand[] = [
    {
      id: 1,
      brandType: "dadvu",
      brandName: `Dadvu tecnologia `,
      imageUrl: "/brands/dadvu.png",
    },
    {
      id: 2,
      brandType: "ajax",
      brandName: "Ajax tecnologia",
      imageUrl: "/brands/ajax.png",
    },
    {
      id: 3,
      brandType: "dahua",
      brandName: "Dahua tecnologia",
      imageUrl: "/brands/dahua.png",
    },
    {
      id: 4,
      brandType: "hik-vision",
      brandName: "Hikvision",
      imageUrl: "/brands/hik-vision.png",
    },
    {
      id: 5,
      brandType: "longse",
      brandName: "Longse",
      imageUrl: "/brands/longse.png",
    },
    {
      id: 6,
      brandType: "mach-power",
      brandName: "Mach Power",
      imageUrl: "/brands/mach-power.png",
    },
    {
      id: 7,
      brandType: "njoi",
      brandName: "Njoi",
      imageUrl: "/brands/njoi.png",
    },
    {
      id: 8,
      brandType: "rtv",
      brandName: "RTV",
      imageUrl: "/brands/rtv.png",
    },
    {
      id: 9,
      brandType: "tecno",
      brandName: "Tecno",
      imageUrl: "/brands/tecno.png",
    },
    {
      id: 10,
      brandType: "uniarch",
      brandName: "Uniarch",
      imageUrl: "/brands/uniarch.png",
    },
    {
      id: 11,
      brandType: "unv",
      brandName: "UNV",
      imageUrl: "/brands/unv.png",
    },
    {
      id: 12,
      brandType: "vultech",
      brandName: "Vultech",
      imageUrl: "/brands/vultech.png",
    },
    {
      id: 13,
      brandType: "wd",
      brandName: "WD",
      imageUrl: "/brands/wd.png",
    },
  ];
  return brands;
}
