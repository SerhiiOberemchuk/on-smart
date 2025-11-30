"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import slugify from "@sindresorhus/slugify";
import clsx from "clsx";
import { toast } from "react-toastify";

import ButtonYellow from "@/components/BattonYellow";

import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";

import { uploadBrandImage } from "./helpers/uploadBrandImage";
import { buildBrandPayload } from "./helpers/buildBrandPayload";
import { BrandTypes } from "@/types/brands.types";
import { createBrand, updateBrandById } from "@/app/actions/brands/brand-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BrandTypes | null;
  onCreate: (data: BrandTypes) => void;
  onUpdate: (data: BrandTypes) => void;
}

const FILE_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

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
    const init = () => {
      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.brand_slug);
        setFullTitle(initialData.title_full);
        setDescription(initialData.description);
        setImage(initialData.image);
      } else {
        cleanStates();
      }
    };
    init();
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    if (file.size > FILE_MAX_SIZE) {
      toast.error("Розмір файлу перевищує 2 МБ");
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
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="flex max-h-svh w-full max-w-[90%] flex-col rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-xl">
        <h2 className="mb-4 border-b text-xl font-semibold">
          {initialData ? "Редагувати категорію" : "Нова категорія"}
        </h2>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <div>
            <label className="mb-1 block text-sm">Зображення (max 2mb)</label>

            {image && (
              <Image
                src={image}
                alt="Category"
                width={164}
                height={164}
                className="mb-3 h-auto w-3xs rounded border border-neutral-700 p-4"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-neutral-300 file:cursor-pointer file:rounded-md file:border-none file:bg-neutral-700 file:px-4 file:py-2 file:hover:bg-neutral-600"
            />

            {fileToUpload && (
              <p
                className={clsx(
                  "text-green-400",
                  fileToUpload.size > FILE_MAX_SIZE / 2 && "text-yellow-300",
                  fileToUpload.size > FILE_MAX_SIZE && "text-red-500",
                )}
              >
                {(fileToUpload.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm">Назва бренду</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              className="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Повний Title</label>
            <input
              type="text"
              value={fullTitle}
              onChange={(e) => setFullTitle(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Опис</label>
            <span>Щоб зробити новий абзац, використовуйте символ |</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-28 w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              cleanStates();
              onClose();
            }}
            className="rounded-md bg-neutral-700 px-4 py-2 text-white transition hover:bg-neutral-600"
          >
            Закрити
          </button>

          <ButtonYellow
            onClick={initialData ? handleUpdate : handleCreate}
            disabled={isPendingCreate || isPendingUpdate}
          >
            {initialData
              ? isPendingUpdate
                ? "Оновлення..."
                : "Оновити"
              : isPendingCreate
                ? "Створення..."
                : "Створити"}
          </ButtonYellow>
        </div>
      </div>
    </div>
  );
}
