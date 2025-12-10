"use client";

import { useState } from "react";
import InputAdminStyle from "../InputComponent";
import ButtonYellow from "@/components/BattonYellow";
import ButtonXDellete from "../ButtonXDellete";
import Image from "next/image";
import { toast } from "react-toastify";
import { uploadFile } from "@/app/actions/files/uploadFile";
import { createVariant } from "@/app/actions/product/create-variant";
import { FILE_MAX_SIZE } from "../categories/ModalCategoryForm";

export default function ModalAddVariant({
  parent,
  isOpen,
  onClose,
}: {
  parent: { id: string; slug: string };
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [nameFull, setNameFull] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [inStock, setInStock] = useState(0);
  const [toOrder, setToOrder] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const f = e.target.files[0];

    if (f.size > FILE_MAX_SIZE) {
      toast.error("Розмір файлу перевищує 2 МБ");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(f);

    setFile(f);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!file) {
      toast.error("Додайте фото");
      return;
    }
    if (!nameFull.trim() || !name.trim()) {
      toast.error("Введіть назву варіанту");
      return;
    }

    try {
      setIsSubmitting(true);

      const upload = await uploadFile({ file, sub_bucket: "products" });
      if (!upload.fileUrl) {
        toast.error("Помилка завантаження фото");
        return;
      }

      const res = await createVariant({
        parentId: parent.id,
        newData: {
          name,
          nameFull,
          price: price || "0",
          oldPrice: oldPrice || null,
          inStock,
          toOrder,
          imgSrc: upload.fileUrl,
        },
      });

      if (!res.success) {
        toast.error(res.error ?? "Помилка створення варіанту");
        return;
      }

      toast.success("Варіант створено");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Помилка створення");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-opacity-70 fixed inset-0 z-50 flex h-screen w-full items-start justify-center overflow-y-auto bg-black p-10">
      <div className="relative w-[90%] max-w-[900px] rounded-xl bg-background p-6 shadow-lg">
        <ButtonXDellete className="absolute top-4 right-4" onClick={onClose} />

        <h2 className="mb-5 text-xl font-semibold">Додати варіант до товару</h2>

        <div className="grid grid-cols-3 gap-6">
          <div>
            {imagePreview && (
              <div className="relative mb-4 w-fit">
                <ButtonXDellete
                  onClick={() => {
                    setImagePreview(null);
                    setFile(null);
                  }}
                  className="absolute top-0 right-0"
                />
                <Image
                  src={imagePreview}
                  width={260}
                  height={260}
                  alt="preview"
                  className="aspect-square rounded-md object-cover"
                />
              </div>
            )}

            <InputAdminStyle
              type="file"
              input_title="Головне фото"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <InputAdminStyle
              input_title="Назва варіанту"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <InputAdminStyle
              input_title="Повна назва варіанту"
              value={nameFull}
              onChange={(e) => setNameFull(e.target.value)}
              required
            />

            <InputAdminStyle
              input_title="Ціна"
              type="number"
              step="0.01"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <InputAdminStyle
              input_title="Стара ціна"
              type="number"
              min={0}
              step="0.01"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
            />

            <InputAdminStyle
              input_title="Дозволено до замовлення"
              type="number"
              min={0}
              value={inStock}
              onChange={(e) => setInStock(Number(e.target.value))}
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={toOrder}
                onChange={(e) => setToOrder(e.target.checked)}
              />
              Під замовлення
            </label>
          </div>
        </div>

        <ButtonYellow className="mt-6 w-full" disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "Створення..." : "Створити варіант"}
        </ButtonYellow>
      </div>
    </div>
  );
}
