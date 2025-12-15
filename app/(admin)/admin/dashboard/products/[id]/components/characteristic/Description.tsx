"use client";

import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import ButtonXDellete from "../../../../ButtonXDellete";
import Image from "next/image";
import { ProductDescriptionType } from "@/db/schemas/product-details.schema";
import { getProductDescriptionById } from "@/app/actions/product-details.ts/get-product-description";
import { updateProductDescriptionById } from "@/app/actions/product-details.ts/update-product-description copy";
import InputAdminStyle from "../../../../InputComponent";
import TextAreaAdminComponent from "../../../../TextAreaAdminComponent";
import ButtonYellow from "@/components/BattonYellow";
import Spiner from "@/components/Spiner";

const updateDescription = async (
  props: Pick<ProductDescriptionType, "product_id"> &
    Partial<Omit<ProductDescriptionType, "product_id">>,
  functionIsLoading: (props: boolean) => void,
) => {
  functionIsLoading(true);
  try {
    await updateProductDescriptionById(props);
    toast.success("Опис оновлено");
    functionIsLoading(false);
  } catch (error) {
    toast.error("Помилка оновлення товару");
    console.error(error);
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
        return;
      }
      toast.warning("Опис товару відсутній");
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
      toast.error("Помилка видалення зображення");
    }
    await updateProductDescriptionById({ product_id: id, images: newUrl });
    setImages(newUrl);
    toast.success("Зображення успішно видалено");
  };
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-500 p-3">
      <h2>Опис товару </h2>
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
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="gap-3">
        <InputAdminStyle
          input_title="Заголовок для опису товару"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="Заголовок опису товару"
        />
        <ButtonYellow
          className="text-[14px] font-normal"
          onClick={() => updateDescription({ product_id: id, title }, setIsLoading)}
        >
          Зберегти заголовок
        </ButtonYellow>
      </div>
      <div>
        <TextAreaAdminComponent
          label_title="Опис товару"
          value={description}
          placeholder="Опис товару"
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <ButtonYellow
          className="text-[14px] font-normal"
          onClick={() => updateDescription({ product_id: id, description }, setIsLoading)}
        >
          Зберегти опис
        </ButtonYellow>
      </div>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <Spiner />
        </div>
      )}
    </div>
  );
}
