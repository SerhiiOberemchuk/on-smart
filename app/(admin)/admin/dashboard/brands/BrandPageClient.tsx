"use client";

import { removeBrandById } from "@/app/actions/brands/brand-actions";
import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";
import { BrandTypes } from "@/types/brands.types";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import ModalBrandForm from "./ModalBrandForm";

function BrandRowActions({
  brand,
  onEdit,
  onDelete,
  isDeleting,
}: {
  brand: BrandTypes;
  onEdit: (value: BrandTypes) => void;
  onDelete: (value: Pick<BrandTypes, "id" | "image">) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="admin-actions">
      <button
        type="button"
        onClick={() => onEdit(brand)}
        className="admin-btn-secondary !px-3 !py-1.5 !text-xs"
      >
        Редагувати
      </button>

      <button
        type="button"
        onClick={() => onDelete({ id: brand.id, image: brand.image })}
        className="admin-btn-danger !px-3 !py-1.5 !text-xs"
        disabled={isDeleting}
      >
        {isDeleting ? "Видалення..." : "Видалити"}
      </button>
    </div>
  );
}

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
    if (!confirm("Видалити цей бренд?")) return;

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
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Бренди</h1>
          <p className="admin-subtitle">Керування брендами каталогу</p>
        </div>

        <button type="button" onClick={() => openModal(null)} className="admin-btn-primary">
          Додати бренд
        </button>
      </div>

      {brands.length ? (
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
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td className="max-w-[120px] truncate">{brand.id}</td>
                    <td>
                      <Link href={brand.image} target="_blank">
                        <Image
                          src={brand.image}
                          alt={brand.name}
                          width={66}
                          height={66}
                          className="h-16 w-16 rounded-md border border-slate-600/55 object-cover p-1"
                        />
                      </Link>
                    </td>
                    <td>{brand.brand_slug}</td>
                    <td>{brand.name}</td>
                    <td className="max-w-[260px]">{brand.title_full}</td>
                    <td className="max-w-[420px]">
                      <span className="line-clamp-2 text-slate-300">{brand.description}</span>
                    </td>
                    <td>
                      <BrandRowActions
                        brand={brand}
                        onEdit={openModal}
                        onDelete={handleDelete}
                        isDeleting={isPending && idToDelete === brand.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid grid-cols-1 gap-3 lg:hidden">
            {brands.map((brand) => (
              <li key={brand.id} className="admin-card admin-card-content">
                <div className="flex gap-3">
                  <Link href={brand.image} target="_blank" className="shrink-0">
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      width={72}
                      height={72}
                      className="h-[72px] w-[72px] rounded-md border border-slate-600/55 object-cover p-1"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{brand.name}</p>
                    <p className="text-xs text-slate-400">{brand.brand_slug}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-300">{brand.title_full}</p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-slate-300">{brand.description}</p>

                <div className="mt-3 border-t border-slate-600/45 pt-3">
                  <BrandRowActions
                    brand={brand}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    isDeleting={isPending && idToDelete === brand.id}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="admin-empty">Брендів ще немає.</div>
      )}

      <ModalBrandForm
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editData}
        onCreate={addBrand}
        onUpdate={updateBrand}
      />
    </section>
  );
}
