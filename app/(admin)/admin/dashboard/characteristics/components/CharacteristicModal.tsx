"use client";

import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import {
  createCharacteristic,
  getCharacteristicById,
  updateCharacteristic,
} from "@/app/actions/product-characteristic/create-product-characteristic";
import { createProductCharacteristicValues } from "@/app/actions/product-characteristic/create-product-characteristic-values";
import ButtonYellow from "@/components/BattonYellow";
import { ProductCharacteristicType } from "@/db/schemas/product_characteristic.schema";
import { ProductCharacteristicValuesType } from "@/db/schemas/product_characteristic_values.schema";
import { CategoryTypes } from "@/types/category.types";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ButtonXDellete from "../../ButtonXDellete";
import InputAdminStyle from "../../InputComponent";
import SelectComponentAdmin from "../../SelectComponent";
import { useCharacteristicStore } from "../store/useCharacteristicStore";

export type CharacteristicFormValues = Omit<ProductCharacteristicType, "id"> & {
  category_id: string | null;
  values: Pick<ProductCharacteristicValuesType, "value" | "id">[];
};

export function CharacteristicModal() {
  const { isModal, mode, editingId, closeModal } = useCharacteristicStore();

  const [categories, setCategories] = useState<CategoryTypes[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, reset } = useForm<CharacteristicFormValues>({
    defaultValues: {
      name: "",
      in_filter: 0,
      is_required: false,
      is_multiple: false,
      category_id: null,
      values: [{ value: "", id: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "values",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getAllCategoryProducts();
      if (res.success) setCategories(res.data);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (mode !== "update" || !editingId) return;

    const fetch = async () => {
      setLoading(true);
      const res = await getCharacteristicById(editingId);

      if (!res.success || !res.data) {
        toast.error("Не вдалося завантажити характеристику");
        setLoading(false);
        return;
      }

      reset({
        name: res.data.name,
        in_filter: res.data.in_filter,
        is_required: res.data.is_required,
        is_multiple: res.data.is_multiple,
        category_id: res.data.category_id ?? "",
        values: res.data.values.length ? res.data.values : [{ value: "", id: "" }],
      });

      setLoading(false);
    };

    fetch();
  }, [mode, editingId, reset]);

  const onSubmit = async (data: CharacteristicFormValues) => {
    setLoading(true);

    try {
      if (mode === "create") {
        const res = await createCharacteristic({
          name: data.name,
          in_filter: data.in_filter,
          is_multiple: data.is_multiple,
          is_required: data.is_required,
          category_id: data.category_id || null,
        });

        if (!res.success || !res.id) {
          toast.error("Не вдалося створити характеристику");
          setLoading(false);
          return;
        }

        await Promise.all(
          data.values
            .filter((v) => v.value.trim() !== "")
            .map((v) =>
              createProductCharacteristicValues({
                value: v.value,
                characteristic_id: res.id,
              }),
            ),
        );

        toast.success("Характеристику створено");
      }

      if (mode === "update" && editingId) {
        const res = await updateCharacteristic(editingId, {
          name: data.name,
          in_filter: data.in_filter,
          is_multiple: data.is_multiple,
          is_required: data.is_required,
          category_id: data.category_id || null,
          values: data.values,
        });

        if (!res.success) {
          toast.error("Не вдалося оновити характеристику");
          setLoading(false);
          return;
        }

        toast.success("Характеристику оновлено");
      }

      reset();
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error("Невідома помилка");
    } finally {
      setLoading(false);
    }
  };

  if (!isModal) return null;

  return (
    <div onClick={closeModal} className="admin-modal-overlay">
      <div onClick={(e) => e.stopPropagation()} className="admin-modal max-w-3xl">
        <div className="admin-modal-header">
          <h2 className="text-base font-semibold">
            {mode === "create" ? "Нова характеристика" : "Редагувати характеристику"}
          </h2>
          <ButtonXDellete className="h-8 w-8" onClick={closeModal} />
        </div>

        <div className="admin-modal-content">
          {loading ? (
            <p className="text-center text-sm text-slate-400">Завантаження...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputAdminStyle
                input_title="Назва характеристики"
                {...register("name", { required: true })}
                required
              />

              <div className="admin-grid-3">
                <InputAdminStyle type="checkbox" {...register("in_filter")} input_title="Використовувати у фільтрах" />
                <InputAdminStyle type="checkbox" {...register("is_required")} input_title="Обов'язкова" />
                <InputAdminStyle type="checkbox" {...register("is_multiple")} input_title="Кілька значень" />
              </div>

              <SelectComponentAdmin
                selectTitle="Категорія"
                optionsTitle="-- Виберіть категорію --"
                options={[
                  { name: "Універсальна (для всіх категорій)", value: "" },
                  ...categories.map((c) => ({
                    name: c.name,
                    value: c.id,
                  })),
                ]}
                {...register("category_id", {
                  setValueAs: (v) => (v === "" ? null : v),
                })}
              />

              <div className="admin-card admin-card-content space-y-3">
                <p className="text-sm font-semibold text-slate-100">Можливі значення</p>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      {...register(`values.${index}.value`)}
                      className="admin-input"
                      placeholder="Наприклад: 4 MP"
                    />
                    <ButtonXDellete type="button" className="h-8 w-8" onClick={() => remove(index)} />
                  </div>
                ))}

                <ButtonYellow type="button" className="admin-btn-secondary w-fit !text-xs" onClick={() => append({ value: "", id: "" })}>
                  Додати значення
                </ButtonYellow>
              </div>

              <div className="admin-actions justify-end">
                <ButtonYellow disabled={loading} type="submit" className="admin-btn-primary !px-4 !py-2 !text-sm">
                  {mode === "create" ? "Створити" : "Зберегти"}
                </ButtonYellow>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
