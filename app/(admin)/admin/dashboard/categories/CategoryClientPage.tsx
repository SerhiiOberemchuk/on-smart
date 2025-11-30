"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

import ModalCategoryForm from "./ModalCategoryForm";
import { CategoryTypes } from "@/types/category.types";
import { removeCategoryProductsById } from "@/app/actions/category/category-actions";
import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";

export default function CategoriesClientPage({ initialData }: { initialData: CategoryTypes[] }) {
  const [categories, setCategories] = useState<CategoryTypes[]>(initialData || []);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<CategoryTypes | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isPendingDell, startTransitionDell] = useTransition();

  const openModal = (data: CategoryTypes | null = null) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = ({ id, image }: Pick<CategoryTypes, "id" | "image">) => {
    if (!confirm("Ви впевнені, що хочете видалити цю категорію?")) return;
    if (!id) {
      toast.error("Некоректний ID категорії");
      return;
    }
    setIdToDelete(id);
    startTransitionDell(async () => {
      const res = await removeCategoryProductsById(id);

      if (!res.success) {
        toast.error("Помилка видалення");
        setIdToDelete(null);
        return;
      }

      await deleteFileFromS3(image);

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setIdToDelete(null);
      toast.success("Категорію видалено");
    });
  };

  const addCategory = (newCat: CategoryTypes) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (updated: CategoryTypes) => {
    setCategories((prev) => prev.map((cat) => (cat.id === updated.id ? updated : cat)));
  };

  return (
    <div className="w-full p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Категорії</h1>

        <button
          onClick={() => openModal(null)}
          className="rounded-md bg-yellow-500 px-4 py-2 font-semibold text-black transition hover:bg-yellow-600"
        >
          Додати категорію
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

        {categories.length ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="grid grid-cols-[60px_120px_150px_150px_200px_1fr_140px] items-center border-b border-neutral-800 px-4 py-4 text-sm [&>div]:p-2"
            >
              <div className="line-clamp-1">{cat.id}</div>

              <div>
                <Link href={cat.image} target="_blank" className="">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded object-cover"
                  />
                </Link>
              </div>

              <div>{cat.category_slug}</div>
              <div>{cat.name}</div>
              <div className="line-clamp-2">{cat.title_full}</div>

              <div className="line-clamp-2 max-w-[450px] text-neutral-400" title={cat.description}>
                {cat.description}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => openModal(cat)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Редагувати
                </button>

                <button
                  onClick={() => handleDelete({ id: cat.id, image: cat.image })}
                  className="text-red-400 hover:text-red-300"
                  disabled={isPendingDell && idToDelete === cat.id}
                >
                  {isPendingDell && idToDelete === cat.id ? "Видалення..." : "Видалити"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-32 items-center justify-center text-neutral-500">
            Немає категорій
          </div>
        )}
      </div>

      <ModalCategoryForm
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editData}
        onCreate={addCategory}
        onUpdate={updateCategory}
      />
    </div>
  );
}
