"use server";

import { cacheLife, cacheTag } from "next/cache";

export type BrandPageProps = { brandName: string; logo: string; description: string[] };

export async function getBrandInfo(brand: string): Promise<BrandPageProps> {
  "use cache";
  cacheTag("brand-info");
  cacheLife({ expire: 3600 });
  const findBrand = {
    logo: "/brands/njoi.png",
    brandName: brand,
    description: [
      "Il marchio NJOY propone soluzioni innovative per la sicurezza domestica e professionale.Dalle telecamere di videosorveglianza ai sistemi di allarme e ai dispositivi smart, ogni prodotto NJOY è progettato per offrire massima affidabilità, facilità d`uso e tecnologia all`avanguardia.",
      "Grazie a NJOY puoi monitorare, proteggere e gestire i tuoi spazi in modo intelligente, migliorando la sicurezza e il comfort della tua casa o del tuo ufficio. Scegli NJOY — la tecnologia che rende la tua vita più sicura e connessa.",
      "Grazie a NJOY puoi monitorare, proteggere e gestire i tuoi spazi in modo intelligente, migliorando la sicurezza e il comfort della tua casa o del tuo ufficio. Scegli NJOY — la tecnologia che rende la tua vita più sicura e connessa.",
    ],
  };
  return findBrand;
}
