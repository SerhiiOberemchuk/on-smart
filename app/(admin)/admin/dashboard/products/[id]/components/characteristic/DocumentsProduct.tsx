"use client";

import ButtonYellow from "@/components/BattonYellow";
import InputAdminStyle from "../../../../InputComponent";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FILE_MAX_SIZE } from "../../../../categories/ModalCategoryForm";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import { updateProductDocumentsById } from "@/app/actions/product-documents/update-product-documents";
import { getProductDocumentsById } from "@/app/actions/product-documents/get-product-documents";
import { ProductDocumentsType } from "@/db/schemas/product-documents.schema";

export default function DocumentsProduct({ id }: { id: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documents, setDocuments] = useState<ProductDocumentsType | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // ---- GET DOCUMENTS ----
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProductDocumentsById({ product_id: id });

        // res.data може бути null або об'єктом
        if (res.data) {
          setDocuments(res.data);
        } else {
          // ⬅ якщо запису немає — створюємо локально порожню структуру
          setDocuments({
            product_id: id,
            documents: [],
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
  }, [id]);

  // ---- SELECT FILE ----
  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selected = e.target.files[0];

    if (selected.size > FILE_MAX_SIZE) {
      toast.error("Розмір файлу перевищує 2 МБ");
      return;
    }
    setFile(selected);
  };

  // ---- DELETE DOCUMENT ----
  const handleDelete = async (link: string) => {
    if (!documents) return;

    try {
      setIsDeleting(link);

      await deleteFileFromS3(link);

      const updatedList = documents.documents.filter((doc) => doc.link !== link);

      await updateProductDocumentsById({
        product_id: id,
        documents: updatedList,
      });

      setDocuments({ product_id: id, documents: updatedList });

      toast.success("Документ видалено");
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося видалити документ");
    } finally {
      setIsDeleting(null);
    }
  };

  // ---- SAVE DOCUMENT ----
  const handleSubmit = async () => {
    if (!file || !title.trim()) {
      toast.warning("Заповніть усі поля");
      return;
    }

    if (!documents) {
      toast.error("Документи ще не завантажені");
      return;
    }

    try {
      setIsLoading(true);

      const upload = await uploadFile({ file, sub_bucket: "files" });

      if (!upload.fileUrl) {
        toast.error("Помилка при завантаженні файлу");
        return;
      }

      const newDoc = {
        title,
        link: upload.fileUrl,
      };

      // ⬅ ГАРАНТОВАНО маємо масив, навіть якщо його не було у БД
      const updatedDocuments = [...(documents.documents ?? []), newDoc];

      await updateProductDocumentsById({
        product_id: id,
        documents: updatedDocuments,
      });

      setDocuments({
        product_id: id,
        documents: updatedDocuments,
      });

      toast.success("Документ збережено");

      setFile(null);
      setTitle("");
    } catch (error) {
      console.error(error);
      toast.error("Помилка при збереженні документа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-500 p-3">
      <h2>Допоміжні документи для товару</h2>

      {/* DOCUMENTS LIST */}
      {documents && (
        <ul className="flex flex-col gap-2">
          {documents.documents.length === 0 && (
            <p className="text-sm text-gray-400">Документів ще немає</p>
          )}

          {documents.documents.map((doc) => (
            <li
              key={doc.link}
              className="flex items-center justify-between border-b border-gray-700 pb-1"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{doc.title}</span>
                <a
                  href={doc.link}
                  target="_blank"
                  className="text-xs break-all text-amber-400 hover:underline"
                >
                  {doc.link}
                </a>
              </div>

              <button
                onClick={() => handleDelete(doc.link)}
                disabled={isDeleting === doc.link}
                className="text-sm text-red-400 hover:text-red-500"
              >
                {isDeleting === doc.link ? "..." : "Видалити"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* FORM */}
      <form className="mt-3 flex flex-col gap-3">
        <InputAdminStyle
          input_title="Виберіть документ"
          required
          type="file"
          onChange={handleSelectFile}
        />

        <InputAdminStyle
          input_title="Назва документу"
          placeholder="Назва документу"
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />

        <ButtonYellow
          type="button"
          onClick={handleSubmit}
          className="text-[14px] font-normal"
          disabled={isLoading}
        >
          {isLoading ? "Збереження..." : "Зберегти"}
        </ButtonYellow>
      </form>
    </div>
  );
}
