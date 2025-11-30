import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { FilterGroup } from "@/types/catalog-filter-options.types";

export const getCatalogFilters = async (): Promise<FilterGroup[]> => {
  "use cache";
  const categories = await getAllCategoryProducts();
  const brands = await getAllBrands();
  return [
    {
      param: "categoria",
      title: "Categoria",
      type: "checkbox",
      options: categories.data.map((item) => ({ value: item.category_slug, label: item.name })),
    },
    {
      param: "brand",
      title: "Brand",
      type: "checkbox",
      options: brands.data.map((item) => ({ value: item.brand_slug, label: item.name })),
    },
    {
      param: "price",
      title: "Prezzo, Euro €",
      type: "range",
      min: 1,
      max: 99999,
    },
    {
      param: "risoluzione",
      title: "Risoluzione",
      type: "checkbox",
      options: [
        { value: "2mp", label: "2MP" },
        { value: "4mp", label: "4MP" },
        { value: "5mp", label: "5MP" },
      ],
    },
  ];
};
