"use client";

import { use, useEffect, useState, useTransition } from "react";
import { Product } from "@/db/schemas/product-schema";
import { useForm } from "react-hook-form";
import InputAdminStyle from "../../../InputComponent";
import ButtonYellow from "@/components/BattonYellow";
import SelectComponentAdmin from "../../../SelectComponent";
import { CategoryTypes } from "@/types/category.types";
import { BrandTypes } from "@/types/brands.types";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { toast } from "react-toastify";
import { getAllBrands } from "@/app/actions/brands/brand-actions";

export default function PageProductAdmin({ dataAction }: { dataAction: Promise<Product> }) {
  const product = use(dataAction);

  const { register, setValue } = useForm<Product>({ defaultValues: product });
  const [categories, setCategories] = useState<CategoryTypes[]>([]);
  const [bradns, setBrands] = useState<BrandTypes[]>([]);

  const [isPendengCategories, startTransitionCategory] = useTransition();

  const [isPendengBrands, startTransitionBrands] = useTransition();
  useEffect(() => {
    startTransitionCategory(async () => {
      const res = await getAllCategoryProducts();
      if (!res.success) {
        toast.error("Error fetch categories");
        return;
      }
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    startTransitionBrands(async () => {
      const res = await getAllBrands();
      if (!res.success) {
        toast.error("Error fetch brands");
        return;
      }
      setBrands(res.data);
    });
  }, []);
  return (
    <div className="w-full p-3">
      <h2>Основні дані товару</h2>
      <ul className="grid grid-cols-2 gap-3 rounded-xl border border-gray-500 p-3">
        <li className="flex items-center justify-between gap-2">
          <InputAdminStyle input_title="Назва" {...register("name")} defaultValue={product.name} />
        </li>
        <li className="flex items-center justify-between gap-2">
          <InputAdminStyle
            input_title="Повна назва"
            {...register("nameFull")}
            defaultValue={product.nameFull}
          />
        </li>
        <li className="flex items-center justify-between gap-2">
          <InputAdminStyle
            input_title="Основна ціна"
            type="number"
            min={0}
            step={0.01}
            {...register("price")}
            defaultValue={product.price}
          />
        </li>
        <li className="flex items-center justify-between gap-2">
          <InputAdminStyle
            input_title="Стара ціна"
            type="number"
            min={0}
            step={0.01}
            {...register("oldPrice")}
            defaultValue={product.oldPrice || ""}
          />
        </li>
        <li className="flex items-center justify-between gap-2">
          <InputAdminStyle
            input_title="Показувати на сайті"
            type="checkbox"
            {...register("inStock")}
            checked={product.inStock}
          />
        </li>
        <li className="flex items-center justify-between gap-2">
          <InputAdminStyle
            input_title="Товар під замовлення"
            type="checkbox"
            {...register("toOrder")}
            checked={product.toOrder}
          />
        </li>
        <li className="flex items-center justify-between gap-2">
          {isPendengCategories ? (
            <p>Завантаження...</p>
          ) : (
            <SelectComponentAdmin
              selectTitle="Категорія товару"
              optionsTitle="-- Виберіть категорію --"
              options={categories.map((item) => ({
                value: item.category_slug as string,
                name: item.name,
              }))}
              required
              defaultValue={product.category_slug}
              {...register("category_slug", { required: true })}
            />
          )}{" "}
        </li>
        <li className="flex items-center justify-between gap-2">
          {isPendengBrands ? (
            <p>Завантаження...</p>
          ) : (
            <SelectComponentAdmin
              selectTitle="Бренд товару"
              optionsTitle="--Виберіть бренд--"
              options={bradns.map((item) => ({
                value: item.brand_slug as string,
                name: item.name,
              }))}
              required
              defaultValue={product.brand_slug}
              {...register("brand_slug", { required: true })}
            />
          )}
        </li>
        <ButtonYellow className="shrink-0 text-[14px] font-light">Зберегти зміни</ButtonYellow>
      </ul>
      <h2>Галерея фото</h2>
    </div>
  );
}
