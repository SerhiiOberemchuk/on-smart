"use client";

import {
  GetAllCategoriesResponse,
  removeCategoryProductsById,
} from "@/app/actions/category/category-actions";
import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";
import { CategoryTypes } from "@/types/category.types";
import Image from "next/image";
import Link from "next/link";
import { use, useState, useTransition } from "react";
import { toast } from "react-toastify";
import ModalCategoryForm from "./ModalCategoryForm";

function CategoryRowActions({
  category,
  onEdit,
  onDelete,
  isDeleting,
}: {
  category: CategoryTypes;
  onEdit: (value: CategoryTypes) => void;
  onDelete: (value: Pick<CategoryTypes, "id" | "image">) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="admin-actions">
      <button
        type="button"
        onClick={() => onEdit(category)}
        className="admin-btn-secondary !px-3 !py-1.5 !text-xs"
      >
        Редагувати
      </button>

      <button
        type="button"
        onClick={() => onDelete({ id: category.id, image: category.image })}
        className="admin-btn-danger !px-3 !py-1.5 !text-xs"
        disabled={isDeleting}
      >
        {isDeleting ? "Видалення..." : "Видалити"}
      </button>
    </div>
  );
}

export default function CategoriesClientPage({
  initialDataPromise,
}: {
  initialDataPromise: GetAllCategoriesResponse;
}) {
  const initialData = use(initialDataPromise);
  const [categories, setCategories] = useState<CategoryTypes[]>(initialData.data || []);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<CategoryTypes | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isPendingDell, startTransitionDell] = useTransition();

  const openModal = (data: CategoryTypes | null = null) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = ({ id, image }: Pick<CategoryTypes, "id" | "image">) => {
    if (!confirm("Видалити цю категорію?")) return;

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
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Категорії</h1>
          <p className="admin-subtitle">Керування категоріями каталогу</p>
        </div>

        <button type="button" onClick={() => openModal(null)} className="admin-btn-primary">
          Додати категорію
        </button>
      </div>

      {categories.length ? (
        <>
          <div className="admin-table-wrap hidden lg:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Зображення</th>
                  <th>Слаг</th>
                  <th>Назва</th>
                  <th>Заголовок</th>
                  <th>Опис</th>
                  <th>Дії</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="max-w-[120px] truncate">{cat.id}</td>
                    <td>
                      <Link href={cat.image} target="_blank">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={66}
                          height={66}
                          loading="eager"
                          className="h-16 w-16 rounded-md border border-slate-600/55 object-cover"
                        />
                      </Link>
                    </td>
                    <td>{cat.category_slug}</td>
                    <td>{cat.name}</td>
                    <td className="max-w-[260px]">{cat.title_full}</td>
                    <td className="max-w-[420px]">
                      <span className="line-clamp-2 text-slate-300">{cat.description}</span>
                    </td>
                    <td>
                      <CategoryRowActions
                        category={cat}
                        onEdit={openModal}
                        onDelete={handleDelete}
                        isDeleting={isPendingDell && idToDelete === cat.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid grid-cols-1 gap-3 lg:hidden">
            {categories.map((cat) => (
              <li key={cat.id} className="admin-card admin-card-content">
                <div className="flex gap-3">
                  <Link href={cat.image} target="_blank" className="shrink-0">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={72}
                      height={72}
                      loading="eager"
                      className="h-[72px] w-[72px] rounded-md border border-slate-600/55 object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{cat.name}</p>
                    <p className="text-xs text-slate-400">{cat.category_slug}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-300">{cat.title_full}</p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-slate-300">{cat.description}</p>

                <div className="mt-3 border-t border-slate-600/45 pt-3">
                  <CategoryRowActions
                    category={cat}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    isDeleting={isPendingDell && idToDelete === cat.id}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="admin-empty">Категорій ще немає.</div>
      )}

      <ModalCategoryForm
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editData}
        onCreate={addCategory}
        onUpdate={updateCategory}
      />
    </section>
  );
}
