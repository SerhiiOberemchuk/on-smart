import { uploadFile } from "@/app/actions/admin/files/mutations";
import { toast } from "react-toastify";

export async function uploadBrandImage(file: File) {
  const res = await uploadFile({ file, sub_bucket: "brands" });

  if (res.$metadata.httpStatusCode !== 200) {
    toast.error("Помилка завантаження зображення");
    return null;
  }

  return res.fileUrl;
}
