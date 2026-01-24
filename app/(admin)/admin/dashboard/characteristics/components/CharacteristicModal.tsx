"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";

import ButtonYellow from "@/components/BattonYellow";
import InputAdminStyle from "../../InputComponent";
import SelectComponentAdmin from "../../SelectComponent";
import ButtonXDellete from "../../ButtonXDellete";

import { useCharacteristicStore } from "../store/useCharacteristicStore";

import { CategoryTypes } from "@/types/category.types";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";

import { ProductCharacteristicType } from "@/db/schemas/product_characteristic.schema";
import { ProductCharacteristicValuesType } from "@/db/schemas/product_characteristic_values.schema";

import {
  createCharacteristic,
  getCharacteristicById,
  updateCharacteristic,
} from "@/app/actions/product-characteristic/create-product-characteristic";

import { createProductCharacteristicValues } from "@/app/actions/product-characteristic/create-product-characteristic-values";

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
          toast.error("Помилка створення характеристики");
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
          toast.error("Помилка оновлення характеристики");
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
    <div onClick={closeModal} className="fixed inset-0 z-50 overflow-y-auto bg-black/80 py-6">
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto w-[95%] max-w-3xl rounded-xl border border-gray-600 bg-black p-6"
      >
        <ButtonXDellete className="fixed top-4 right-4" onClick={closeModal}>
          ✕
        </ButtonXDellete>

        <h2 className="mb-6 text-xl font-semibold">
          {mode === "create" ? "Нова характеристика" : "Редагування характеристики"}
        </h2>

        {loading ? (
          <p className="text-center text-gray-400">Завантаження…</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputAdminStyle
              input_title="Назва характеристики"
              {...register("name", { required: true })}
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <InputAdminStyle
                type="checkbox"
                {...register("in_filter")}
                input_title="Для фільтрації"
              />
              <InputAdminStyle
                type="checkbox"
                {...register("is_required")}
                input_title="Обовʼязкова"
              />
              <InputAdminStyle
                type="checkbox"
                {...register("is_multiple")}
                input_title="Мультивибір"
              />
            </div>

            <SelectComponentAdmin
              selectTitle="Категорія"
              optionsTitle="-- Виберіть категорію --"
              options={[
                { name: "🌐 Універсальна (для всіх товарів)", value: "" },
                ...categories.map((c) => ({
                  name: c.name,
                  value: c.id,
                })),
              ]}
              {...register("category_id", {
                setValueAs: (v) => (v === "" ? null : v),
              })}
            />

            <div className="space-y-3 rounded-lg border border-neutral-700 p-4">
              <p className="font-medium">Можливі значення</p>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`values.${index}.value`)}
                    className="flex-1 rounded bg-neutral-800 p-2 text-white"
                    placeholder="Напр. 4 MP"
                  />
                  <button type="button" onClick={() => remove(index)} className="px-2 text-red-400">
                    ✕
                  </button>
                </div>
              ))}

              <ButtonYellow type="button" onClick={() => append({ value: "", id: "" })}>
                + Додати значення
              </ButtonYellow>
            </div>

            <div className="flex justify-end pt-4">
              <ButtonYellow disabled={loading} type="submit">
                {mode === "create" ? "Створити" : "Зберегти"}
              </ButtonYellow>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
