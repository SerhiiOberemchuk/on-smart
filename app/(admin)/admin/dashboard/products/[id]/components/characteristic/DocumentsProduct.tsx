"use client";

import { getProductDocumentsById } from "@/app/actions/product-documents/get-product-documents";
import { updateProductDocumentsById } from "@/app/actions/product-documents/update-product-documents";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import ButtonYellow from "@/components/BattonYellow";
import { ProductDocumentsType } from "@/db/schemas/product-documents.schema";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FILE_MAX_SIZE } from "../../../../categories/ModalCategoryForm";
import InputAdminStyle from "../../../../InputComponent";

export default function DocumentsProduct({ id }: { id: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documents, setDocuments] = useState<ProductDocumentsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProductDocumentsById({ product_id: id });

        if (res.data) {
          setDocuments(res.data);
        } else {
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

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selected = e.target.files[0];

    if (selected.size > FILE_MAX_SIZE) {
      toast.error("Файл перевищує 2 МБ");
      return;
    }

    setFile(selected);
  };

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
        toast.error("Помилка завантаження");
        return;
      }

      const newDoc = {
        title,
        link: upload.fileUrl,
      };

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
      toast.error("Помилка збереження документа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-card admin-card-content flex flex-col gap-3">
      <h2 className="text-base font-semibold">Документи товару</h2>

      {documents ? (
        <ul className="flex flex-col gap-2">
          {documents.documents.length === 0 ? (
            <p className="text-sm text-slate-400">Документів поки немає</p>
          ) : (
            documents.documents.map((doc) => (
              <li
                key={doc.link}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-600/45 pb-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium">{doc.title}</span>
                  <a href={doc.link} target="_blank" className="block break-all text-xs text-amber-300 hover:underline">
                    {doc.link}
                  </a>
                </div>

                <button
                  onClick={() => handleDelete(doc.link)}
                  disabled={isDeleting === doc.link}
                  className="admin-btn-danger !px-3 !py-1.5 !text-xs"
                >
                  {isDeleting === doc.link ? "..." : "Видалити"}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      <form className="mt-3 flex flex-col gap-3">
        <InputAdminStyle input_title="Оберіть документ" required type="file" onChange={handleSelectFile} />

        <InputAdminStyle
          input_title="Назва документа"
          placeholder="Назва документа"
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />

        <ButtonYellow
          type="button"
          onClick={handleSubmit}
          className="admin-btn-secondary !px-4 !py-2 !text-sm"
          disabled={isLoading}
        >
          {isLoading ? "Збереження..." : "Зберегти документ"}
        </ButtonYellow>
      </form>
    </div>
  );
}
