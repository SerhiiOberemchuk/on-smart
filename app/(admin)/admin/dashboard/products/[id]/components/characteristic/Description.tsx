"use client";

import { getProductDescriptionById } from "@/app/actions/product-details.ts/get-product-description";
import { updateProductDescriptionById } from "@/app/actions/product-details.ts/update-product-description copy";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import ButtonYellow from "@/components/BattonYellow";
import Spiner from "@/components/Spiner";
import { ProductDescriptionType } from "@/db/schemas/product-details.schema";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import ButtonXDellete from "../../../../ButtonXDellete";
import InputAdminStyle from "../../../../InputComponent";
import TextAreaAdminComponent from "../../../../TextAreaAdminComponent";

const updateDescription = async (
  props: Pick<ProductDescriptionType, "product_id"> & Partial<Omit<ProductDescriptionType, "product_id">>,
  functionIsLoading: (props: boolean) => void,
) => {
  functionIsLoading(true);
  try {
    await updateProductDescriptionById(props);
    toast.success("Опис оновлено");
  } catch (error) {
    toast.error("Не вдалося оновити опис");
    console.error(error);
  } finally {
    functionIsLoading(false);
  }
};

export default function Description({ id }: { id: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isUploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getFoto = async () => {
      const response = await getProductDescriptionById({ id });
      if (response.data && response.data.images.length > 0) {
        setImages(response.data.images);
        setTitle(response.data.title);
        setDescription(response.data.description);
      }
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
    updateDescription({ product_id: id, images: uploadedUrls }, setIsLoading);
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

    await updateProductDescriptionById({ product_id: id, images: newUrl });
    setImages(newUrl);
    toast.success("Зображення видалено");
  };

  return (
    <div className="admin-card admin-card-content flex flex-col gap-4">
      <h2 className="text-base font-semibold">Опис товару</h2>

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
        <div className="admin-media-grid mt-2">
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

      <div className="space-y-2">
        <InputAdminStyle
          input_title="Заголовок опису"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="Заголовок опису"
        />
        <ButtonYellow
          className="admin-btn-secondary !px-4 !py-2 !text-sm"
          onClick={() => updateDescription({ product_id: id, title }, setIsLoading)}
        >
          Зберегти заголовок
        </ButtonYellow>
      </div>

      <div className="space-y-2">
        <TextAreaAdminComponent
          label_title="Опис"
          value={description}
          placeholder="Опис"
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <ButtonYellow
          className="admin-btn-secondary !px-4 !py-2 !text-sm"
          onClick={() => updateDescription({ product_id: id, description }, setIsLoading)}
        >
          Зберегти опис
        </ButtonYellow>
      </div>

      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <Spiner />
        </div>
      ) : null}
    </div>
  );
}
