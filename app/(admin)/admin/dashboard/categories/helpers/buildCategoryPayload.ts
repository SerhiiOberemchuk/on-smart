import { CategoryTypes } from "@/types/category.types";

export function buildCategoryPayload({
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
}): Omit<CategoryTypes, "id"> {
  return {
    name,
    category_slug: slug,
    title_full: fullTitle,
    description,
    image,
  };
}
