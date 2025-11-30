import { BrandTypes } from "@/types/brands.types";

export function buildBrandPayload({
  name,
  slug,
  fullTitle,
  description,
  image,
}: {
  name: string;
  slug: string;
  fullTitle: string;
  description: string;
  image: string;
}): Omit<BrandTypes, "id"> {
  return {
    name,
    brand_slug: slug,
    title_full: fullTitle,
    description,
    image,
  };
}
