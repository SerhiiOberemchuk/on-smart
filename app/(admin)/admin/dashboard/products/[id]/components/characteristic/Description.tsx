"use client";

import { getProductDescriptionById } from "@/app/actions/admin/product-details/queries";
import { updateProductDescriptionById } from "@/app/actions/admin/characteristics/mutations";
import { deleteFileFromS3, uploadFile } from "@/app/actions/admin/files/mutations";
import Spiner from "@/components/Spiner";
import { ProductDescriptionType } from "@/db/schemas/product-details.schema";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import ButtonXDellete from "../../../../ButtonXDellete";
import InputAdminStyle from "../../../../InputComponent";
import TextAreaAdminComponent from "../../../../TextAreaAdminComponent";
import {
  PRODUCT_SAVE_ALL_EVENT,
  reportProductSaveAllActivity,
  reportProductSaveAllResult,
} from "../save-all.helpers";

const updateDescription = async (
  props: Pick<ProductDescriptionType, "product_id"> & Partial<Omit<ProductDescriptionType, "product_id">>,
  functionIsLoading: (props: boolean) => void,
) => {
  functionIsLoading(true);
  try {
    const response = await updateProductDescriptionById(props);
    if (!response?.success) {
      return { success: false as const, message: "Не вдалося оновити опис товару" };
    }
    return { success: true as const, message: "" };
  } catch (error) {
    console.error(error);
    return { success: false as const, message: "Не вдалося оновити опис товару" };
  } finally {
    functionIsLoading(false);
  }
};

function SortableDescriptionImage({
  url,
  onDelete,
}: {
  url: string;
  onDelete: (url: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-70" : undefined}
    >
      <div className="relative mx-auto w-fit rounded-lg border border-slate-600/55">
        <ButtonXDellete className="absolute top-2 right-2 h-8 w-8" onClick={() => onDelete(url)} />
        <button
          type="button"
          className="absolute top-2 left-2 z-10 cursor-grab rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] text-slate-100 active:cursor-grabbing"
          title="Перемістити фото"
          aria-label="Перемістити фото"
          {...attributes}
          {...listeners}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <circle cx="8" cy="6" r="1.7" />
            <circle cx="8" cy="12" r="1.7" />
            <circle cx="8" cy="18" r="1.7" />
            <circle cx="16" cy="6" r="1.7" />
            <circle cx="16" cy="12" r="1.7" />
            <circle cx="16" cy="18" r="1.7" />
          </svg>
        </button>
        <Image width={326} height={326} alt={url} src={url} className="h-32 w-full rounded-lg object-cover object-center" />
      </div>
    </div>
  );
}

export default function Description({ id }: { id: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isUploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    const getFoto = async () => {
      const response = await getProductDescriptionById({ id });
      if (response.data) {
        setImages(response.data.images ?? []);
        setTitle(response.data.title ?? "");
        setDescription(response.data.description ?? "");
      }
    };

    getFoto();
  }, [id]);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    const uploadedUrls: string[] = [...images];
    const newlyUploadedUrls: string[] = [];

    for (const file of acceptedFiles) {
      try {
        const response = await uploadFile({ file, sub_bucket: "products", imagePreset: "content" });
        if (response?.fileUrl) {
          uploadedUrls.push(response.fileUrl);
          newlyUploadedUrls.push(response.fileUrl);
        }
      } catch (error) {
        console.error("Помилка завантаження:", error);
      }
    }

    setImages([...uploadedUrls]);
    const response = await updateDescription({ product_id: id, images: uploadedUrls }, setIsLoading);
    if (!response.success) {
      setImages((prev) => prev.filter((url) => !newlyUploadedUrls.includes(url)));
      await Promise.allSettled(newlyUploadedUrls.map((url) => deleteFileFromS3(url)));
      toast.error(response.message);
    }
    setUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

  const handleDeleteFoto = async (url: string) => {
    const newUrl = images.filter((i) => i !== url);
    const d = await deleteFileFromS3(url);
    if (!d.success) {
      toast.error("Не вдалося видалити зображення");
      return;
    }

    await updateProductDescriptionById({ product_id: id, images: newUrl });
    setImages(newUrl);
    toast.success("Зображення видалено");
  };

  const handleImageDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((item) => item === active.id);
    const newIndex = images.findIndex((item) => item === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const prev = images;
    const next = arrayMove(images, oldIndex, newIndex);
    setImages(next);

    try {
      setIsReordering(true);
      const response = await updateProductDescriptionById({ product_id: id, images: next });
      if (!response.success) {
        setImages(prev);
        toast.error("Не вдалося оновити порядок фото");
        return;
      }
      toast.success("Порядок фото оновлено");
    } catch (error) {
      console.error(error);
      setImages(prev);
      toast.error("Не вдалося оновити порядок фото");
    } finally {
      setIsReordering(false);
    }
  };

  const saveAll = useCallback(() => {
    reportProductSaveAllActivity({
      emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
      delta: 1,
    });
    void updateDescription({ product_id: id, title, description }, setIsLoading)
      .then((response) => {
        reportProductSaveAllResult({
          emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
          status: response.success ? "success" : "error",
          message: response.success ? undefined : response.message,
        });
      })
      .finally(() => {
        reportProductSaveAllActivity({
          emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
          delta: -1,
        });
      });
  }, [description, id, title]);

  useEffect(() => {
    const listener = () => saveAll();
    document.addEventListener(PRODUCT_SAVE_ALL_EVENT, listener);
    return () => document.removeEventListener(PRODUCT_SAVE_ALL_EVENT, listener);
  }, [saveAll]);

  return (
    <div className="admin-card admin-card-content flex flex-col gap-4">
      <h2 className="text-base font-semibold">Опис товару</h2>

      <div {...getRootProps()} className="admin-dropzone cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? <p>Відпустіть файли тут...</p> : <p>Перетягніть фото або натисніть, щоб обрати</p>}
        {isUploading ? <p className="mt-2 text-yellow-300">Завантаження...</p> : null}
        {isReordering ? <p className="mt-2 text-yellow-300">Оновлення порядку...</p> : null}
      </div>

      {images.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="admin-media-grid mt-2">
              {images.map((url) => (
                <SortableDescriptionImage key={url} url={url} onDelete={handleDeleteFoto} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      <div className="space-y-2">
        <InputAdminStyle
          input_title="Заголовок опису"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="Заголовок опису"
        />
      </div>

      <div className="space-y-2">
        <TextAreaAdminComponent
          label_title="Опис"
          value={description}
          placeholder="Опис"
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
      </div>

      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <Spiner />
        </div>
      ) : null}
    </div>
  );
}

