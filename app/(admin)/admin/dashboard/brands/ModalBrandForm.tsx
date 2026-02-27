"use client";

import { createBrand, updateBrandById } from "@/app/actions/brands/brand-actions";
import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";
import ButtonYellow from "@/components/BattonYellow";
import { BrandTypes } from "@/types/brands.types";
import slugify from "@sindresorhus/slugify";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { buildBrandPayload } from "./helpers/buildBrandPayload";
import { uploadBrandImage } from "./helpers/uploadBrandImage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BrandTypes | null;
  onCreate: (data: BrandTypes) => void;
  onUpdate: (data: BrandTypes) => void;
}

const FILE_MAX_SIZE = 2 * 1024 * 1024;

export default function ModalBrandForm({
  isOpen,
  onClose,
  initialData,
  onCreate,
  onUpdate,
}: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [fullTitle, setFullTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isPendingCreate, startTransitionCreate] = useTransition();
  const [isPendingUpdate, startTransitionUpdate] = useTransition();

  const cleanStates = () => {
    setName("");
    setSlug("");
    setFullTitle("");
    setDescription("");
    setImage("");
    setFileToUpload(null);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.brand_slug);
      setFullTitle(initialData.title_full);
      setDescription(initialData.description);
      setImage(initialData.image);
      return;
    }

    cleanStates();
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return;
    }
    document.body.style.overflow = "auto";
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    if (file.size > FILE_MAX_SIZE) {
      toast.error("Файл перевищує 2 МБ");
      return;
    }

    setFileToUpload(file);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!name || !slug || !description || !fullTitle) {
      toast.warning("Заповніть усі поля");
      return;
    }

    if (!fileToUpload) {
      toast.warning("Завантажте зображення");
      return;
    }

    startTransitionCreate(async () => {
      const imageUrl = await uploadBrandImage(fileToUpload);
      if (!imageUrl) return;

      const payload = buildBrandPayload({
        name,
        slug,
        fullTitle,
        description,
        image: imageUrl,
      });

      const created = await createBrand(payload);
      if (!created.success) {
        toast.error("Помилка створення бренду");
        return;
      }

      onCreate({ ...payload, id: created.brandId });
      toast.success("Бренд створено");
      cleanStates();
      onClose();
    });
  };

  const handleUpdate = async () => {
    if (!initialData) return;

    let finalImage = image;
    startTransitionUpdate(async () => {
      if (fileToUpload) {
        await deleteFileFromS3(initialData.image);
        const newImageUrl = await uploadBrandImage(fileToUpload);
        if (!newImageUrl) return;
        finalImage = newImageUrl;
      }

      const payload = buildBrandPayload({
        name,
        slug,
        fullTitle,
        description,
        image: finalImage,
      });

      const updated = await updateBrandById({
        ...payload,
        id: initialData.id,
      });

      if (!updated.success) {
        toast.error("Помилка оновлення");
        return;
      }

      onUpdate({ id: initialData.id, ...payload });
      toast.success("Бренд оновлено");
      cleanStates();
      onClose();
    });
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal max-w-2xl">
        <div className="admin-modal-header">
          <h2 className="text-base font-semibold">{initialData ? "Редагувати бренд" : "Новий бренд"}</h2>
        </div>

        <div className="admin-modal-content space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Зображення (макс. 2 МБ)</label>

            {image ? (
              <Image
                src={image}
                alt="Бренд"
                width={164}
                height={164}
                className="mb-3 h-auto w-40 rounded border border-slate-600/55 p-2"
              />
            ) : null}

            <input type="file" accept="image/*" onChange={handleFileUpload} className="admin-file-input" />

            {fileToUpload ? (
              <p
                className={clsx(
                  "mt-1 text-xs text-emerald-300",
                  fileToUpload.size > FILE_MAX_SIZE / 2 && "text-yellow-300",
                  fileToUpload.size > FILE_MAX_SIZE && "text-red-400",
                )}
              >
                {(fileToUpload.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ) : null}
          </div>

          <div className="admin-field">
            <span className="admin-field-label">Назва бренду</span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <span className="admin-field-label">Слаг</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <span className="admin-field-label">Повний заголовок</span>
            <input type="text" value={fullTitle} onChange={(e) => setFullTitle(e.target.value)} className="admin-input" />
          </div>

          <div className="admin-field">
            <span className="admin-field-label">Опис</span>
            <span className="text-xs text-slate-500">Використовуйте "|" для нового абзацу</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="admin-textarea" />
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            onClick={() => {
              cleanStates();
              onClose();
            }}
            className="admin-btn-secondary"
          >
            Закрити
          </button>

          <ButtonYellow
            onClick={initialData ? handleUpdate : handleCreate}
            disabled={isPendingCreate || isPendingUpdate}
            className="admin-btn-primary !px-4 !py-2 !text-sm"
          >
            {initialData ? (isPendingUpdate ? "Оновлення..." : "Оновити") : isPendingCreate ? "Створення..." : "Створити"}
          </ButtonYellow>
        </div>
      </div>
    </div>
  );
}
