"use client";

import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { updateFotoGallery } from "@/app/actions/foto-galery/update-foto-gallery";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import { ProductType } from "@/db/schemas/product.schema";
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
    toast.success("Галерею оновлено");
  } catch (error) {
    console.error(error);
  }
};

export default function FotoGaleryProduct({ id }: { id: ProductType["id"] }) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setUploading] = useState(false);

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

  return (
    <div className="admin-card admin-card-content">
      <h2 className="mb-2 text-base font-semibold">Галерея фото (рекомендовано 4 зображення)</h2>

      <div {...getRootProps()} className="admin-dropzone cursor-pointer">
        <input {...getInputProps()} />

        {isDragActive ? (
          <p>Відпустіть файли тут...</p>
        ) : (
          <p>Перетягніть фото або натисніть, щоб обрати</p>
        )}

        {isUploading ? <p className="mt-2 text-yellow-300">Завантаження...</p> : null}
      </div>

      {images.length > 0 ? (
        <div className="admin-media-grid mt-4">
          {images.map((url) => (
            <div key={url}>
              <div className="relative mx-auto w-fit rounded-lg border border-slate-600/55">
                <ButtonXDellete className="absolute top-2 right-2 h-8 w-8" onClick={() => handleDeleteFoto(url)} />
                <Image
                  width={326}
                  height={326}
                  alt={url}
                  src={url}
                  className="h-32 w-full rounded-lg object-cover object-center"
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
