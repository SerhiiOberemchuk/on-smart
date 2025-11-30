import { uploadFile } from "@/app/actions/files/uploadFile";
import { toast } from "react-toastify";

export async function uploadCategoryImage(file: File) {
  const res = await uploadFile({ file, sub_bucket: "categories" });

  if (res.$metadata.httpStatusCode !== 200) {
    toast.error("Помилка завантаження зображення");
    return null;
  }

  return res.fileUrl;
}
