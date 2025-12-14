"use client";

import { useEffect, useState } from "react";
import ButtonYellow from "@/components/BattonYellow";
import InputAdminStyle from "../../../../InputComponent";
import { updateOrCreateSpecifiche } from "@/app/actions/product-specifiche/update-or-create-specifiche";
import { uploadFile } from "@/app/actions/files/uploadFile";
import { toast } from "react-toastify";

import Image from "next/image";
import ButtonXDellete from "../../../../ButtonXDellete";
import { getProductSpecificheById } from "@/app/actions/product-specifiche/get-product-specifiche";
import { deleteProductSpecificheImage } from "@/app/actions/product-specifiche/delete-product-specifiche";

export default function SpecificheProductAdmin({ id }: { id: string }) {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [groups, setGroups] = useState<
    { groupTitle: string; items: { name: string; value: string }[] }[]
  >([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const res = await getProductSpecificheById(id);
      if (res.data) {
        setTitle(res.data.title);
        setImages(res.data.images || []);
        setGroups(res.data.groups);
      } else {
        setImages([]);
        setGroups([]);
      }
    };
    fetch();
  }, [id]);

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selectedFiles = Array.from(e.target.files);

    setFiles((prev) => [...prev, ...selectedFiles]);

    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setNewPreviews((prev) => [...prev, ...previews]);

    toast.info("Фото додані — натисніть Зберегти");
  };

  const handleDeleteImage = async (img: string) => {
    await deleteProductSpecificheImage(id, img);
    setImages(images.filter((i) => i !== img));
    toast.success("Фото видалено");
  };

  const handleDeleteNewPreview = (index: number) => {
    const updatedPreviews = [...newPreviews];
    updatedPreviews.splice(index, 1);

    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);

    setNewPreviews(updatedPreviews);
    setFiles(updatedFiles);
  };

  const addGroup = () => setGroups([...groups, { groupTitle: "", items: [] }]);

  const addItem = (gIndex: number) => {
    const newG = [...groups];
    newG[gIndex].items.push({ name: "", value: "" });
    setGroups(newG);
  };

  const updateGroupTitle = (index: number, value: string) => {
    const newG = [...groups];
    newG[index].groupTitle = value;
    setGroups(newG);
  };

  const updateItem = (gIndex: number, iIndex: number, field: "name" | "value", value: string) => {
    const newG = [...groups];
    newG[gIndex].items[iIndex][field] = value;
    setGroups(newG);
  };

  const handleSave = async () => {
    setLoading(true);

    const finalImages = [...images];

    try {
      for (const f of files) {
        const res = await uploadFile({ file: f, sub_bucket: "products" });
        if (res.fileUrl) finalImages.push(res.fileUrl);
      }

      await updateOrCreateSpecifiche({
        product_id: id,
        title,
        images: finalImages,
        groups,
      });

      setImages(finalImages);
      setFiles([]);
      setNewPreviews([]);

      toast.success("Специфікацію збережено");
    } catch (err) {
      console.error(err);
      toast.error("Помилка при збереженні");
    } finally {
      setLoading(false);
    }
  };
  const deleteGroup = (index: number) => {
    const updated = [...groups];
    updated.splice(index, 1);
    setGroups(updated);

    toast.info("Групу видалено");
  };
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-500 p-4">
      <h2 className="text-lg">Специфікація</h2>

      <div className="flex flex-col gap-2">
        <p className="text-sm">Фото специфікації</p>

        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img} className="relative w-40">
              <Image
                width={140}
                height={140}
                alt=""
                src={img}
                className="rounded-xl border border-gray-600"
              />
              <ButtonXDellete
                onClick={() => handleDeleteImage(img)}
                className="absolute -top-2 -right-2"
              />
            </div>
          ))}

          {newPreviews.map((url, idx) => (
            <div key={url} className="relative w-40 opacity-80">
              <Image
                width={140}
                height={140}
                alt=""
                src={url}
                className="rounded-xl border border-gray-600"
              />

              <ButtonXDellete
                onClick={() => handleDeleteNewPreview(idx)}
                className="absolute -top-2 -right-2"
              />
            </div>
          ))}
        </div>

        <InputAdminStyle
          input_title="Додати фото"
          type="file"
          multiple
          onChange={handleSelectFiles}
        />
      </div>

      <InputAdminStyle
        input_title="Заголовок секції"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {groups.map((g, gIndex) => (
        <div key={gIndex} className="flex flex-col gap-3 rounded-xl border border-gray-600 p-3">
          <div className="flex items-center justify-between">
            <InputAdminStyle
              input_title="Назва групи"
              value={g.groupTitle}
              onChange={(e) => updateGroupTitle(gIndex, e.target.value)}
            />

            <button
              type="button"
              onClick={() => deleteGroup(gIndex)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Видалити
            </button>
          </div>

          <h4>Параметри</h4>

          {g.items.map((item, iIndex) => (
            <div key={iIndex} className="grid grid-cols-2 gap-3">
              <InputAdminStyle
                input_title="Назва"
                value={item.name}
                onChange={(e) => updateItem(gIndex, iIndex, "name", e.target.value)}
              />
              <InputAdminStyle
                input_title="Значення"
                value={item.value}
                onChange={(e) => updateItem(gIndex, iIndex, "value", e.target.value)}
              />
            </div>
          ))}

          <ButtonYellow
            type="button"
            className="text-[14px] font-normal"
            onClick={() => addItem(gIndex)}
          >
            Додати параметр
          </ButtonYellow>
        </div>
      ))}

      <ButtonYellow type="button" className="text-[14px] font-normal" onClick={addGroup}>
        Додати групу
      </ButtonYellow>

      <ButtonYellow
        type="button"
        className="text-[14px] font-normal"
        disabled={loading}
        onClick={handleSave}
      >
        {loading ? "Збереження..." : "Зберегти специфікацію"}
      </ButtonYellow>
    </div>
  );
}
