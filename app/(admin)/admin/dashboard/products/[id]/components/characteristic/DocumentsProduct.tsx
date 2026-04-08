"use client";

import { getProductDocumentsById } from "@/app/actions/admin/product-details/queries";
import { updateProductDocumentsById } from "@/app/actions/admin/characteristics/mutations";
import { deleteFileFromS3, uploadFile } from "@/app/actions/admin/files/mutations";
import { ProductDocumentsType } from "@/db/schemas/product-documents.schema";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FILE_MAX_SIZE } from "../../../../categories/ModalCategoryForm";
import ButtonXDellete from "../../../../ButtonXDellete";
import InputAdminStyle from "../../../../InputComponent";
import {
  PRODUCT_SAVE_ALL_EVENT,
  reportProductSaveAllActivity,
  reportProductSaveAllResult,
} from "../save-all.helpers";

function getDocumentDisplayName(link: string, title?: string) {
  const normalizedTitle = title?.trim();
  if (normalizedTitle) return normalizedTitle;

  try {
    const pathname = new URL(link).pathname;
    const fileName = pathname.split("/").pop()?.trim();
    return fileName || "Файл документа";
  } catch {
    const fileName = link.split("/").pop()?.trim();
    return fileName || "Файл документа";
  }
}

export default function DocumentsProduct({ id }: { id: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documents, setDocuments] = useState<ProductDocumentsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDirtyTitles, setIsDirtyTitles] = useState(false);

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

  useEffect(() => {
    const listener = () => {
      if ((file && title.trim()) || isDirtyTitles) {
        void handleSubmit();
      }
    };
    document.addEventListener(PRODUCT_SAVE_ALL_EVENT, listener);
    return () => document.removeEventListener(PRODUCT_SAVE_ALL_EVENT, listener);
  }, [file, title, isDirtyTitles, documents]);

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
      setIsDirtyTitles(false);
      toast.success("Документ видалено");
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося видалити документ");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmit = async () => {
    if (!documents) {
      toast.error("Документи ще не завантажені");
      return;
    }

    const hasPendingUpload = Boolean(file && title.trim());
    const hasEditableTitles = documents.documents.some(
      (doc) => doc.title.trim().length > 0 && doc.link.trim().length > 0,
    );

    if (!hasPendingUpload && !isDirtyTitles) {
      return;
    }

    if (file && !title.trim()) {
      toast.warning("Заповніть усі поля");
      return;
    }

    if (!hasPendingUpload && !hasEditableTitles) {
      toast.warning("Документи ще не додані");
      return;
    }

    reportProductSaveAllActivity({
      emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
      delta: 1,
    });
    let uploadedDocumentUrl: string | null = null;
    try {
      setIsLoading(true);

      let updatedDocuments = documents.documents.map((doc) => ({
        title: doc.title.trim(),
        link: doc.link.trim(),
      }));

      if (hasPendingUpload && file) {
        const upload = await uploadFile({ file, sub_bucket: "files" });
        if (!upload.fileUrl) {
          toast.error("Помилка завантаження");
          return;
        }
        uploadedDocumentUrl = upload.fileUrl;

        const newDoc = {
          title: title.trim(),
          link: uploadedDocumentUrl,
        };

        updatedDocuments = [...updatedDocuments, newDoc];
      }

      await updateProductDocumentsById({
        product_id: id,
        documents: updatedDocuments,
      });

      setDocuments({
        product_id: id,
        documents: updatedDocuments,
      });

      reportProductSaveAllResult({
        emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
        status: "success",
      });
      setFile(null);
      setTitle("");
      setIsDirtyTitles(false);
    } catch (error) {
      console.error(error);
      reportProductSaveAllResult({
        emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
        status: "error",
        message: "Помилка збереження документа",
      });
      if (typeof uploadedDocumentUrl === "string") {
        await deleteFileFromS3(uploadedDocumentUrl);
      }
    } finally {
      setIsLoading(false);
      reportProductSaveAllActivity({
        emit: (eventName, detail) => document.dispatchEvent(new CustomEvent(eventName, { detail })),
        delta: -1,
      });
    }
  };

  const handleChangeExistingTitle = (link: string, value: string) => {
    setDocuments((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        documents: prev.documents.map((doc) => (doc.link === link ? { ...doc, title: value } : doc)),
      };
    });
    setIsDirtyTitles(true);
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
                className="flex flex-col gap-2 border-b border-slate-600/45 pb-2"
              >
                <div className="min-w-0 flex-1">
                  <InputAdminStyle
                    input_title="Назва документа"
                    value={doc.title}
                    onChange={(event) => handleChangeExistingTitle(doc.link, event.currentTarget.value)}
                  />
                  <a href={doc.link} target="_blank" className="block break-all text-xs text-amber-300 hover:underline">
                    {getDocumentDisplayName(doc.link, doc.title)}
                  </a>
                </div>

                <div className="flex justify-end">
                  <ButtonXDellete
                    onClick={() => handleDelete(doc.link)}
                    disabled={isDeleting === doc.link}
                    className="h-8 w-8 rounded-md"
                  />
                </div>
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

        {file && title.trim() ? (
          <p className="text-xs text-amber-300">Документ буде збережено кнопкою "Зберегти все".</p>
        ) : null}

        {isDirtyTitles ? (
          <p className="text-xs text-amber-300">Оновлені назви документів будуть збережені кнопкою "Зберегти все".</p>
        ) : null}
      </form>
    </div>
  );
}



