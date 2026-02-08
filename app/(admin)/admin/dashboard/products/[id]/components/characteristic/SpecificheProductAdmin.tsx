"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
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

type OrderedSelectItem = {
  kind: "select";
  characteristic_id: string;
  characteristic_name: string;
  value_ids: string[];
};

type OrderedTextItem = {
  kind: "text";
  characteristic_id: string;
  characteristic_name: string;
  value: string;
};

type OrderedItem = OrderedSelectItem | OrderedTextItem;

type CustomGroup = { name: string; value: string };

type FormValues = {
  title: string;
  ordered: OrderedItem[];
  groups: CustomGroup[];
};

const hasAnyValuesArray = (c: GetCharacteristicsByCategoryIdType) =>
  Array.isArray(c.values) && c.values.length > 0;

const hasPredefinedIds = (c: GetCharacteristicsByCategoryIdType) => c.values?.some((v) => v?.id);

function buildLabelValueFromSelectedIds(
  tpl: GetCharacteristicsByCategoryIdType | undefined,
  selectedIds: string[],
) {
  if (!tpl?.values?.length || selectedIds.length === 0) return "";
  const map = new Map(tpl.values.filter((v) => v?.id && v?.value).map((v) => [v!.id!, v!.value!]));
  return selectedIds
    .map((id) => map.get(id))
    .filter((x): x is string => Boolean(x))
    .join(", ");
}

function OrderedRow({
  index,
  fieldId,
  tpl,
  control,
  register,
  setValue,
  moveUp,
  moveDown,
  isFirst,
  isLast,
}: {
  index: number;
  fieldId: string;
  tpl: GetCharacteristicsByCategoryIdType;
  control: Control<FormValues, FormValues> | undefined;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  moveUp: () => void;
  moveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const item = useWatch({ control, name: `ordered.${index}` }) as OrderedItem | undefined;

  const kind = item?.kind ?? "text";
  const isSelect = kind === "select";

  const selectedIds = (isSelect ? (item as OrderedSelectItem | undefined)?.value_ids : []) ?? [];

  return (
    <fieldset key={fieldId} className="rounded border p-3">
      <legend className="flex items-center justify-between gap-3 px-2 text-sm font-medium">
        <span>
          <span className="mr-2 text-gray-400">{index + 1}.</span>
          {tpl.name}
          {tpl.is_required && <span className="ml-2 text-red-400">*</span>}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800 disabled:opacity-40"
            onClick={moveUp}
            disabled={isFirst}
            title="Вгору"
          >
            ↑
          </button>
          <button
            type="button"
            className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800 disabled:opacity-40"
            onClick={moveDown}
            disabled={isLast}
            title="Вниз"
          >
            ↓
          </button>
        </div>
      </legend>

      <input type="hidden" {...register(`ordered.${index}.kind`)} />
      <input type="hidden" {...register(`ordered.${index}.characteristic_id`)} />
      <input type="hidden" {...register(`ordered.${index}.characteristic_name`)} />

      {isSelect ? (
        <div className="flex flex-wrap items-center gap-4">
          {(tpl.values ?? [])
            .filter((v) => v?.id)
            .map((v) => {
              const id = v!.id;
              const checked = selectedIds.includes(id);

              return (
                <label key={id} className="flex items-center gap-2">
                  <input
                    type={tpl.is_multiple ? "checkbox" : "radio"}
                    checked={checked}
                    onChange={(e) => {
                      let next: string[];

                      if (tpl.is_multiple) {
                        next = e.target.checked
                          ? Array.from(new Set([...selectedIds, id]))
                          : selectedIds.filter((x) => x !== id);
                      } else {
                        next = [id];
                      }

                      setValue(`ordered.${index}.value_ids`, next, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}
                  />
                  {v!.value}
                </label>
              );
            })}

          {!tpl.is_multiple && !tpl.is_required && selectedIds.length > 0 && (
            <button
              type="button"
              className="ml-4 text-xs text-red-400 underline"
              onClick={() =>
                setValue(`ordered.${index}.value_ids`, [], {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            >
              Очистити
            </button>
          )}

          {tpl.is_required && selectedIds.length === 0 && (
            <p className="w-full text-sm text-red-400">Оберіть значення</p>
          )}
        </div>
      ) : (
        <InputAdminStyle
          input_title="Значення"
          required={tpl.is_required}
          {...register(`ordered.${index}.value`, { required: tpl.is_required })}
        />
      )}
    </fieldset>
  );
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

  const { register, handleSubmit, reset, control, setValue } = useForm<FormValues>({
    defaultValues: { title: "", ordered: [], groups: [] },
    shouldUnregister: false,
  });

  const { fields: orderedFields, move: moveOrdered } = useFieldArray({
    control,
    name: "ordered",
  });

  const {
    fields: customFields,
    append: appendCustom,
    remove: removeCustom,
    move: moveCustom,
  } = useFieldArray({
    control,
    name: "groups",
  });

  useEffect(() => {
    getCharacteristicsByCategoryId({ category_id }).then((res) => {
      if (res.data) setChars(res.data);
    });
  }, [category_id]);

  const templateNameSet = useMemo(() => new Set(chars.map((c) => c.name)), [chars]);

  const charsById = useMemo(() => {
    const m = new Map<string, GetCharacteristicsByCategoryIdType>();
    chars.forEach((c) => m.set(c.id, c));
    return m;
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

      const selectedMap = new Map<string, string[]>();
      savedChars.forEach((c) => selectedMap.set(c.characteristic_id, c.value_ids ?? []));

      const valueByName = new Map<string, string>();
      const posByName = new Map<string, number>();
      (spec?.groups ?? []).forEach((g) => {
        if (!g?.name) return;
        valueByName.set(g.name, g.value ?? "");
        posByName.set(g.name, typeof g.position === "number" ? g.position : 0);
      });

      const base: OrderedItem[] = chars.filter(hasAnyValuesArray).map((c) => {
        if (hasPredefinedIds(c)) {
          return {
            kind: "select",
            characteristic_id: c.id,
            characteristic_name: c.name,
            value_ids: selectedMap.get(c.id) ?? [],
          };
        }
        return {
          kind: "text",
          characteristic_id: c.id,
          characteristic_name: c.name,
          value: valueByName.get(c.name) ?? "",
        };
      });

      const withSortKey = base.map((it, idx) => ({
        it,
        idx,
        key: posByName.get(it.characteristic_name) ?? 0,
      }));

      withSortKey.sort((a, b) => {
        const ak = a.key;
        const bk = b.key;
        if (!ak && !bk) return a.idx - b.idx;
        if (!ak) return 1;
        if (!bk) return -1;
        return ak - bk;
      });

      const ordered = withSortKey.map((x) => x.it);

      const custom = (spec?.groups ?? [])
        .filter((g) => g?.name && !templateNameSet.has(g.name))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((g) => ({
          name: g.name ?? "",
          value: g.value ?? "",
        }));

      reset({
        title: spec?.title ?? "",
        ordered,
        groups: custom,
      });

      setImages(spec?.images ?? []);
    };

    load();
  }, [product_id, chars, reset, templateNameSet]);

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
      const groupsFromOrdered = data.ordered.map((it, idx) => {
        const tpl = charsById.get(it.characteristic_id);

        const value =
          it.kind === "select"
            ? buildLabelValueFromSelectedIds(tpl, it.value_ids)
            : (it.value ?? "").trim();

        return { name: it.characteristic_name, value, position: idx + 1 };
      });

      const customGroupsClean = (data.groups ?? [])
        .map((g) => ({ name: (g.name ?? "").trim(), value: (g.value ?? "").trim() }))
        .filter((g) => g.name.length > 0 && g.value.length > 0)
        .map((g, i) => ({
          name: g.name,
          value: g.value,
          position: groupsFromOrdered.length + i + 1,
        }));

      const finalGroups = [...groupsFromOrdered, ...customGroupsClean];

      await updateOrCreateSpecifiche({
        product_id,
        title: data.title,
        groups: finalGroups,
        images,
      });

      for (const it of data.ordered) {
        if (it.kind !== "select") continue;

        const ids = it.value_ids ?? [];
        if (ids.length > 0) {
          await upsertProductCharacteristic({
            product_id,
            characteristic_id: it.characteristic_id,
            characteristic_name: it.characteristic_name,
            value_ids: ids,
          });
        } else {
          await deleteProductCharacteristic(product_id, it.characteristic_id);
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

  const getTpl = (id: string) => charsById.get(id);

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

      {orderedFields.map((f, index) => {
        const characteristicId = (f as unknown as { characteristic_id: string }).characteristic_id;
        const tpl = getTpl(characteristicId);
        if (!tpl) return null;

        return (
          <OrderedRow
            key={f.id}
            fieldId={f.id}
            index={index}
            tpl={tpl}
            control={control}
            register={register}
            setValue={setValue}
            moveUp={() => index > 0 && moveOrdered(index, index - 1)}
            moveDown={() => index < orderedFields.length - 1 && moveOrdered(index, index + 1)}
            isFirst={index === 0}
            isLast={index === orderedFields.length - 1}
          />
        );
      })}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium">Кастомні параметри</h3>

          <ButtonYellow type="button" onClick={() => appendCustom({ name: "", value: "" })}>
            Додати параметр
          </ButtonYellow>
        </div>

        {customFields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-[1fr_1fr_120px] items-end gap-3">
            <InputAdminStyle
              {...register(`groups.${i}.name`, { required: true })}
              input_title="Назва"
            />
            <InputAdminStyle
              {...register(`groups.${i}.value`, { required: true })}
              input_title="Значення"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800 disabled:opacity-40"
                onClick={() => i > 0 && moveCustom(i, i - 1)}
                disabled={i === 0}
                title="Вгору"
              >
                ↑
              </button>
              <button
                type="button"
                className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800 disabled:opacity-40"
                onClick={() => i < customFields.length - 1 && moveCustom(i, i + 1)}
                disabled={i === customFields.length - 1}
                title="Вниз"
              >
                ↓
              </button>

              <ButtonXDellete onClick={() => removeCustom(i)} />
            </div>
          </div>
        ))}
      </div>

      <ButtonYellow type="submit" disabled={loading}>
        {loading ? "Збереження…" : "Зберегти"}
      </ButtonYellow>
    </form>
  );
}
