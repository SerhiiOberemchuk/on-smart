import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import CategoriesClientPage from "./CategoryClientPage";

export default async function CategoriesPage() {
  const res = await getAllCategoryProducts();

  return <CategoriesClientPage initialData={res.data} />;
}
