"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

import ButtonYellow from "@/components/BattonYellow";
import InputAdminStyle from "../../../../InputComponent";
import ButtonXDellete from "../../../../ButtonXDellete";

import {
  getCharacteristicsByCategoryId,
  GetCharacteristicsByCategoryIdType,
} from "@/app/actions/product-characteristic/get-characteristics-by-category-id";

import {
  getProductCharacteristics,
  upsertProductCharacteristic,
  deleteProductCharacteristic,
} from "@/app/actions/product-characteristic/product-characteristic";

import { uploadFile, deleteFileFromS3 } from "@/app/actions/files/uploadFile";
import { ProductSpecificheType } from "@/db/schemas/product-specifiche.schema";
import { CategoryTypes } from "@/types/category.types";
import { getProductSpecificheById } from "@/app/actions/product-specifiche/get-product-specifiche";
import { updateOrCreateSpecifiche } from "@/app/actions/product-specifiche/update-or-create-specifiche";

type FormValues = {
  title: string;

  characteristics: {
    characteristic_id: string;
    characteristic_name: string;
    value_ids: string[];
  }[];

  characteristics_text: {
    characteristic_id: string;
    characteristic_name: string;
    value: string;
  }[];

  groups: { name: string; value: string }[];
};

const hasAnyValuesArray = (c: GetCharacteristicsByCategoryIdType) =>
  Array.isArray(c.values) && c.values.length > 0;

const hasPredefinedIds = (c: GetCharacteristicsByCategoryIdType) => c.values?.some((v) => v?.id);

function buildGroupsFromSelectCharacteristics(
  characteristics: FormValues["characteristics"],
  allChars: GetCharacteristicsByCategoryIdType[],
) {
  const groups: { name: string; value: string }[] = [];

  for (const c of characteristics) {
    if (!c.value_ids.length) continue;

    const source = allChars.find((ch) => ch.id === c.characteristic_id);
    if (!source) continue;

    const valueMap = new Map(
      source.values?.filter((v) => v?.id && v?.value).map((v) => [v!.id!, v!.value!]),
    );

    const labels = c.value_ids.map((id) => valueMap.get(id)).filter(Boolean);

    if (labels.length) {
      groups.push({
        name: c.characteristic_name,
        value: labels.join(", "),
      });
    }
  }

  return groups;
}

function buildGroupsFromTextCharacteristics(
  characteristicsText: FormValues["characteristics_text"],
) {
  return characteristicsText
    .map((c) => ({
      name: c.characteristic_name,
      value: (c.value ?? "").trim(),
    }))
    .filter((g) => g.value.length > 0);
}

export default function SpecificheProductAdmin({
  product_id,
  category_id,
}: {
  product_id: ProductSpecificheType["product_id"];
  category_id: CategoryTypes["id"];
}) {
  const [chars, setChars] = useState<GetCharacteristicsByCategoryIdType[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, control, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      title: "",
      characteristics: [],
      characteristics_text: [],
      groups: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "groups",
  });

  useEffect(() => {
    getCharacteristicsByCategoryId({ category_id }).then((res) => {
      if (res.data) setChars(res.data);
    });
  }, [category_id]);

  const predefinedNames = useMemo(() => {
    return new Set(chars.map((c) => c.name));
  }, [chars]);

  useEffect(() => {
    if (!product_id || !chars.length) return;

    const load = async () => {
      const [specRes, charRes] = await Promise.all([
        getProductSpecificheById(product_id),
        getProductCharacteristics(product_id),
      ]);

      const spec = specRes.data;
      const savedChars = charRes.success ? (charRes.data ?? []) : [];

      const valueMap = new Map<string, string[]>();
      savedChars.forEach((c) => valueMap.set(c.characteristic_id, c.value_ids ?? []));

      const groupMap = new Map<string, string>();
      (spec?.groups ?? []).forEach((g) => {
        if (g?.name) groupMap.set(g.name, g.value ?? "");
      });

      const selectChars = chars
        .filter((c) => hasAnyValuesArray(c) && hasPredefinedIds(c))
        .map((c) => ({
          characteristic_id: c.id,
          characteristic_name: c.name,
          value_ids: valueMap.get(c.id) ?? [],
        }));

      const textChars = chars
        .filter((c) => hasAnyValuesArray(c) && !hasPredefinedIds(c))
        .map((c) => ({
          characteristic_id: c.id,
          characteristic_name: c.name,
          value: groupMap.get(c.name) ?? "",
        }));

      reset({
        title: spec?.title ?? "",
        characteristics: selectChars,
        characteristics_text: textChars,
        groups: (spec?.groups ?? []).filter((g) => !predefinedNames.has(g.name)),
      });

      setImages(spec?.images ?? []);
    };

    load();
  }, [product_id, chars, reset, predefinedNames]);

  const onDrop = async (files: File[]) => {
    setUploading(true);
    const next = [...images];

    for (const file of files) {
      const res = await uploadFile({ file, sub_bucket: "products" });
      if (res?.fileUrl) next.push(res.fileUrl);
    }

    setImages(next);
    await updateOrCreateSpecifiche({ product_id, images: next });
    setUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const deleteImage = async (url: string) => {
    await deleteFileFromS3(url);
    const next = images.filter((i) => i !== url);
    setImages(next);
    await updateOrCreateSpecifiche({ product_id, images: next });
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      const groupsFromSelect = buildGroupsFromSelectCharacteristics(data.characteristics, chars);

      const groupsFromText = buildGroupsFromTextCharacteristics(data.characteristics_text);

      const finalGroups = [...groupsFromSelect, ...groupsFromText, ...(data.groups ?? [])];

      await updateOrCreateSpecifiche({
        product_id,
        title: data.title,
        groups: finalGroups,
        images,
      });

      for (const c of data.characteristics) {
        if (c.value_ids.length > 0) {
          await upsertProductCharacteristic({
            product_id,
            characteristic_id: c.characteristic_id,
            characteristic_name: c.characteristic_name,
            value_ids: c.value_ids,
          });
        } else {
          await deleteProductCharacteristic(product_id, c.characteristic_id);
        }
      }

      toast.success("Збережено");
    } catch (e) {
      console.error(e);
      toast.error("Помилка збереження");
    } finally {
      setLoading(false);
    }
  };

  const selectCharsUI = chars.filter((c) => hasAnyValuesArray(c) && hasPredefinedIds(c));

  const textCharsUI = chars.filter((c) => hasAnyValuesArray(c) && !hasPredefinedIds(c));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 rounded-xl border border-gray-600 p-4"
    >
      <h2 className="text-lg font-semibold">Характеристики товару</h2>

      <div {...getRootProps()} className="rounded-xl border border-dashed p-4 text-center">
        <input {...getInputProps()} />
        {uploading ? "Завантаження…" : "Перетягніть фото або клікніть"}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img} className="relative mx-auto">
              <ButtonXDellete className="absolute top-0 right-0" onClick={() => deleteImage(img)} />
              <Image src={img} alt="" width={160} height={160} />
            </div>
          ))}
        </div>
      )}

      <InputAdminStyle
        input_title="Назва секції *"
        required
        {...register("title", { required: true })}
      />

      {selectCharsUI.map((c, index) => {
        const selected = watch(`characteristics.${index}.value_ids`) ?? [];

        return (
          <fieldset key={c.id} className="rounded border p-3">
            <legend className="px-2 text-sm font-medium">
              {c.name}
              {c.is_required && <span className="ml-2 text-red-400">*</span>}
            </legend>

            <input
              type="hidden"
              {...register(`characteristics.${index}.characteristic_id`)}
              value={c.id}
            />
            <input
              type="hidden"
              {...register(`characteristics.${index}.characteristic_name`)}
              value={c.name}
            />

            <div className="flex flex-wrap items-center gap-4">
              {c.values
                .filter((v) => v?.id)
                .map((v) => {
                  const checked = selected.includes(v!.id);

                  return (
                    <label key={v!.id} className="flex items-center gap-2">
                      <input
                        type={c.is_multiple ? "checkbox" : "radio"}
                        checked={checked}
                        onChange={(e) => {
                          let next: string[];

                          if (c.is_multiple) {
                            next = e.target.checked
                              ? Array.from(new Set([...selected, v!.id]))
                              : selected.filter((id) => id !== v!.id);
                          } else {
                            next = [v!.id];
                          }

                          setValue(`characteristics.${index}.value_ids`, next, {
                            shouldValidate: true,
                          });
                        }}
                      />
                      {v!.value}
                    </label>
                  );
                })}

              {!c.is_multiple && !c.is_required && selected.length > 0 && (
                <button
                  type="button"
                  className="ml-4 text-xs text-red-400 underline"
                  onClick={() =>
                    setValue(`characteristics.${index}.value_ids`, [], {
                      shouldValidate: true,
                    })
                  }
                >
                  Очистити
                </button>
              )}
            </div>

            {c.is_required && selected.length === 0 && (
              <p className="text-sm text-red-400">Оберіть значення</p>
            )}
          </fieldset>
        );
      })}

      {textCharsUI.map((c, index) => (
        <fieldset key={c.id} className="rounded border p-3">
          <legend className="px-2 text-sm font-medium">
            {c.name}
            {c.is_required && <span className="ml-2 text-red-400">*</span>}
          </legend>

          <input
            type="hidden"
            {...register(`characteristics_text.${index}.characteristic_id`)}
            value={c.id}
          />
          <input
            type="hidden"
            {...register(`characteristics_text.${index}.characteristic_name`)}
            value={c.name}
          />

          <InputAdminStyle
            input_title="Значення"
            required={c.is_required}
            {...register(`characteristics_text.${index}.value`, {
              required: c.is_required,
            })}
          />
        </fieldset>
      ))}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Кастомні параметри</h3>

        {fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-2 gap-3">
            <InputAdminStyle
              {...register(`groups.${i}.name`, { required: true })}
              input_title="Назва"
            />
            <div className="flex items-center gap-2">
              <InputAdminStyle
                className="flex-1"
                {...register(`groups.${i}.value`, { required: true })}
                input_title="Значення"
              />
              <ButtonXDellete onClick={() => remove(i)} />
            </div>
          </div>
        ))}

        <ButtonYellow type="button" onClick={() => append({ name: "", value: "" })}>
          Додати параметр
        </ButtonYellow>
      </div>

      <ButtonYellow type="submit" disabled={loading}>
        {loading ? "Збереження…" : "Зберегти"}
      </ButtonYellow>
    </form>
  );
}
