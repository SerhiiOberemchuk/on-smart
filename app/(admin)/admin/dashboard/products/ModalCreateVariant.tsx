"use client";

import { createProductVariant } from "@/app/actions/product/create-product-variant";
import { uploadFile } from "@/app/actions/files/uploadFile";
import ButtonYellow from "@/components/BattonYellow";
import { ProductType } from "@/db/schemas/product.schema";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import ButtonXDellete from "../ButtonXDellete";
import { FILE_MAX_SIZE } from "../categories/ModalCategoryForm";
import InputAdminStyle from "../InputComponent";

export default function ModalAddVariant({
  parent,
  isOpen,
  onClose,
}: {
  parent: ProductType;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [nameFull, setNameFull] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [inStock, setInStock] = useState(0);
  const [isOnOrder, setToOrder] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const f = e.target.files[0];

    if (f.size > FILE_MAX_SIZE) {
      toast.error("Файл перевищує 2 МБ");
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
      toast.error("Додайте зображення");
      return;
    }

    if (!nameFull.trim() || !name.trim()) {
      toast.error("Заповніть назву варіанта");
      return;
    }

    try {
      setIsSubmitting(true);

      const upload = await uploadFile({ file, sub_bucket: "products" });
      if (!upload.fileUrl) {
        toast.error("Помилка завантаження зображення");
        return;
      }

      const res = await createProductVariant({
        parentId: parent.id,
        newData: {
          name,
          nameFull,
          price: price || "0",
          oldPrice: oldPrice || null,
          inStock,
          isOnOrder,
          imgSrc: upload.fileUrl,
          category_id: parent.category_id,
        },
      });

      if (!res.success) {
        toast.error(res.error ?? "Помилка створення варіанта");
        return;
      }

      toast.success("Варіант створено");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Помилка створення варіанта");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal max-w-4xl">
        <div className="admin-modal-header">
          <h2 className="text-base font-semibold">Додати варіант до {parent.nameFull}</h2>
          <ButtonXDellete className="h-8 w-8" onClick={onClose} />
        </div>

        <div className="admin-modal-content space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative mb-2 w-fit">
                  <ButtonXDellete
                    onClick={() => {
                      setImagePreview(null);
                      setFile(null);
                    }}
                    className="absolute top-2 right-2 h-8 w-8"
                  />
                  <Image
                    src={imagePreview}
                    width={260}
                    height={260}
                    alt="Попередній перегляд"
                    className="aspect-square rounded-md border border-slate-600/55 object-cover"
                  />
                </div>
              ) : null}

              <InputAdminStyle type="file" input_title="Головне зображення" accept="image/*" onChange={handleFileUpload} />
            </div>

            <div className="space-y-4">
              <div className="admin-grid-2">
                <InputAdminStyle
                  input_title="Назва варіанта"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <InputAdminStyle
                  input_title="Повна назва варіанта"
                  value={nameFull}
                  onChange={(e) => setNameFull(e.target.value)}
                  required
                />
              </div>

              <div className="admin-grid-3">
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
                  input_title="Кількість в наявності"
                  type="number"
                  min={0}
                  value={inStock}
                  onChange={(e) => setInStock(Number(e.target.value))}
                />
              </div>

              <InputAdminStyle
                type="checkbox"
                input_title="Під замовлення"
                checked={isOnOrder}
                onChange={(e) => setToOrder(e.target.checked)}
              />
            </div>
          </div>

          <div className="admin-actions justify-end border-t border-slate-600/45 pt-3">
            <ButtonYellow className="admin-btn-primary !px-4 !py-2 !text-sm" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? "Створення..." : "Створити варіант"}
            </ButtonYellow>
          </div>
        </div>
      </div>
    </div>
  );
}
