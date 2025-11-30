"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";
import { BrandTypes } from "@/types/brands.types";
import { removeBrandById } from "@/app/actions/brands/brand-actions";
import ModalBrandForm from "./ModalBrandForm";

export default function BrandsPageClient({ brandsData }: { brandsData: BrandTypes[] }) {
  const [brands, setBrands] = useState<BrandTypes[]>(brandsData);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<BrandTypes | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openModal = (data: BrandTypes | null = null) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async ({ id, image }: Pick<BrandTypes, "id" | "image">) => {
    if (!confirm("Ви впевнені, що хочете видалити цей бренд?")) return;
    if (!id) {
      toast.error("Некоректний ID бренду");
      return;
    }
    setIdToDelete(id);
    startTransition(async () => {
      const res = await removeBrandById(id);

      if (!res.success) {
        toast.error("Помилка видалення");
        setIdToDelete(null);
        return;
      }

      await deleteFileFromS3(image);

      setBrands((prev) => prev.filter((b) => b.id !== id));
      setIdToDelete(null);
      toast.success("Бренд видалено");
    });
  };

  const addBrand = (newBrand: BrandTypes) => {
    setBrands((prev) => [...prev, newBrand]);
  };

  const updateBrand = (updated: BrandTypes) => {
    setBrands((prev) => prev.map((brand) => (brand.id === updated.id ? updated : brand)));
  };

  return (
    <div className="w-full p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Бренди</h1>

        <button
          onClick={() => openModal(null)}
          className="rounded-md bg-yellow-500 px-4 py-2 font-semibold text-black transition hover:bg-yellow-600"
        >
          Додати бренд
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-neutral-700 bg-neutral-900">
        <div className="grid grid-cols-[60px_120px_150px_150px_200px_1fr_140px] border-b border-neutral-700 bg-neutral-800 px-4 py-3 text-sm font-semibold">
          <div>ID</div>
          <div>Зображення</div>
          <div>Slug</div>
          <div>Назва</div>
          <div>Тайтл</div>
          <div>Опис</div>
          <div className="text-center">Дії</div>
        </div>

        {brands.length ? (
          brands.map((brand) => (
            <div
              key={brand.id}
              className="grid grid-cols-[60px_120px_150px_150px_200px_1fr_140px] items-center border-b border-neutral-800 px-4 py-4 text-sm"
            >
              <div className="line-clamp-1">{brand.id}</div>

              <div className="flex items-center justify-center">
                <Link href={brand.image} target="_blank" className="">
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    width={80}
                    height={80}
                    className="h-auto w-20"
                  />
                </Link>
              </div>

              <div>{brand.brand_slug}</div>
              <div>{brand.name}</div>
              <div>{brand.title_full}</div>

              <div
                className="line-clamp-2 max-w-[450px] text-neutral-400"
                title={brand.description}
              >
                {brand.description}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => openModal(brand)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Редагувати
                </button>

                <button
                  onClick={() => handleDelete({ id: brand.id, image: brand.image })}
                  className="text-red-400 hover:text-red-300"
                  disabled={isPending && idToDelete === brand.id}
                >
                  {isPending && idToDelete === brand.id ? "Видалення..." : "Видалити"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-32 items-center justify-center text-neutral-500">
            Немає брендів
          </div>
        )}
      </div>

      <ModalBrandForm
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editData}
        onCreate={addBrand}
        onUpdate={updateBrand}
      />
    </div>
  );
}
