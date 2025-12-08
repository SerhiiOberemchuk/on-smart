"use client";

import { Product } from "@/db/schemas/product-schema";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

// import { saveProductImages } from "@/app/actions/products/save-images"; // (приклад)
import { uploadFile } from "@/app/actions/files/uploadFile";
import Image from "next/image";
import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { toast } from "react-toastify";
import { updateFotoGallery } from "@/app/actions/foto-galery/update-foto-gallery";
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

export default function FotoGaleryProduct({ id }: { id: Product["id"] }) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setUploading] = useState(false);

  useEffect(() => {
    const getFoto = async () => {
      const response = await getFotoFromGallery({ parent_product_id: id });
      if (response.data && response.data.images.length > 0) {
        setImages(response.data.images);
        return;
      }
      toast.warning("Галерея порожня");
      setImages([]);
    };
    getFoto();
  }, [id]);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);

    const uploadedUrls: string[] = images;

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
        console.error("Upload failed:", error);
      }
    }

    setImages([...uploadedUrls]);
    updateGallery({ parent_product_id: id, images: uploadedUrls });
    setUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleDeleteFoto = async (url: string) => {
    const newUrl = images.filter((i) => i !== url);
    await updateGallery({ parent_product_id: id, images: newUrl });
    setImages(newUrl);
  };

  return (
    <div className="mt-3 rounded-xl border border-gray-500 p-3">
      <h2 className="mb-2 text-lg font-semibold">Галерея фото (бажано 4 фото)</h2>

      <div
        {...getRootProps()}
        className="cursor-pointer rounded-xl border border-dashed bg-background p-4 text-center"
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <p>Покладіть файли сюди...</p>
        ) : (
          <p>Перетягніть фото сюди або натисніть, щоб обрати</p>
        )}

        {isUploading && <p className="mt-2 text-yellow-400">Завантаження...</p>}
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((url) => (
            <div key={url} className="">
              <div className="relative mx-auto w-fit rounded-lg border">
                <ButtonXDellete
                  className="absolute top-0 right-0"
                  onClick={() => handleDeleteFoto(url)}
                />
                <Image
                  width={326}
                  height={326}
                  alt={url}
                  src={url}
                  className="w-40 rounded-lg object-cover object-center"
                />{" "}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
