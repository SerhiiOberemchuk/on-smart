import { uploadFile } from "@/app/actions/files/uploadFile";
import { toast } from "react-toastify";

export const uploadFotoProduct = async (file: File) => {
  try {
    if (!file) {
      toast.warning("Немає фото для вивантаження");
      return;
    }
    const resp = await uploadFile({ sub_bucket: "products", file });
    return resp.fileUrl;
  } catch (error) {}
};
