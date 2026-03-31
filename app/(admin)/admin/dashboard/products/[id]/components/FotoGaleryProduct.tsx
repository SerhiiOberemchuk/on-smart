"use client";

import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { updateFotoGallery } from "@/app/actions/foto-galery/update-foto-gallery";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import { ProductType } from "@/db/schemas/product.schema";
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
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import ButtonXDellete from "../../../ButtonXDellete";

const updateGallery = async ({
  parent_product_id,
  images,
}: {
  parent_product_id: string;
  images: string[];
}) => {
  try {
    await updateFotoGallery({ parent_product_id, images });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

function SortableImage({
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
        <Image
          width={326}
          height={326}
          alt={url}
          src={url}
          className="h-32 w-full rounded-lg object-cover object-center"
        />
      </div>
    </div>
  );
}

export default function FotoGaleryProduct({ id }: { id: ProductType["id"] }) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setUploading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    const getFoto = async () => {
      const response = await getFotoFromGallery({ parent_product_id: id });
      if (response.data && response.data.images.length > 0) {
        setImages(response.data.images);
        return;
      }
      setImages([]);
    };

    getFoto();
  }, [id]);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    const uploadedUrls: string[] = [...images];

    for (const file of acceptedFiles) {
      try {
        const response = await uploadFile({
          file,
          sub_bucket: "products",
        });

        if (response?.fileUrl) {
          uploadedUrls.push(response.fileUrl);
        }
      } catch (error) {
        console.error("Помилка завантаження:", error);
      }
    }

    setImages([...uploadedUrls]);
    await updateGallery({ parent_product_id: id, images: uploadedUrls });
    setUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleDeleteFoto = async (url: string) => {
    const newUrl = images.filter((i) => i !== url);
    const d = await deleteFileFromS3(url);
    if (!d.success) {
      toast.error("Не вдалося видалити зображення");
      return;
    }

    await updateGallery({ parent_product_id: id, images: newUrl });
    setImages(newUrl);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
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
      await updateGallery({ parent_product_id: id, images: next });
      toast.success("Порядок фото оновлено");
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося оновити порядок фото");
      setImages(prev);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="admin-card admin-card-content">
      <h2 className="mb-2 text-base font-semibold">Галерея фото (рекомендовано 4 зображення)</h2>

      <div {...getRootProps()} className="admin-dropzone cursor-pointer">
        <input {...getInputProps()} />

        {isDragActive ? <p>Відпустіть файли тут...</p> : <p>Перетягніть фото або натисніть, щоб обрати</p>}

        {isUploading ? <p className="mt-2 text-yellow-300">Завантаження...</p> : null}
        {isReordering ? <p className="mt-2 text-yellow-300">Оновлення порядку...</p> : null}
      </div>

      {images.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="admin-media-grid mt-4">
              {images.map((url) => (
                <SortableImage key={url} url={url} onDelete={handleDeleteFoto} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}
    </div>
  );
}
