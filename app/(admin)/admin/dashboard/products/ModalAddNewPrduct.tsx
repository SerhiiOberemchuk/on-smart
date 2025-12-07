import { SubmitHandler, useForm } from "react-hook-form";
import { useModalStore } from "../../store/modal-store";
import InputAdminStyle from "../InputComponent";
import { Product } from "@/db/schemas/product-schema";
import ButtonYellow from "@/components/BattonYellow";
import { useEffect, useState, useTransition } from "react";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { toast } from "react-toastify";
import { CategoryTypes } from "@/types/category.types";
import { getAllBrands } from "@/app/actions/brands/brand-actions";
import SelectComponentAdmin from "../SelectComponent";
import slugify from "@sindresorhus/slugify";
import { createNewProduct } from "@/app/actions/product/create-new-product";
import { BrandTypes } from "@/types/brands.types";
import { FILE_MAX_SIZE } from "../categories/ModalCategoryForm";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { deleteFileFromS3, uploadFile } from "@/app/actions/files/uploadFile";
import { useRouter } from "next/navigation";
import ButtonXDellete from "../ButtonXDellete";

export default function ModalAddNewPrduct({ isEditProd }: { isEditProd?: boolean }) {
  const { type, isOpen, closeModal } = useModalStore();
  const { register, handleSubmit, setValue } = useForm<Product>();
  const [isPendingCreate, startTransitionCreateProduct] = useTransition();
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const router = useRouter();
  const onSubmit: SubmitHandler<Product> = (data) => {
    if (!image || !fileToUpload) {
      toast.warning("неохбхідно завантажити головне фото товару");
      return;
    }

    startTransitionCreateProduct(async () => {
      try {
        const resp = await uploadFile({ file: fileToUpload, sub_bucket: "products" });
        if (!resp.fileUrl) {
          toast.error("Не вдалося вивантажити фото2");
          console.error(resp.$metadata.httpStatusCode);
        }
        const res = await createNewProduct({ ...data, imgSrc: resp.fileUrl });
        if (res.error) {
          toast.error(res.error.toString());
          await deleteFileFromS3(resp.fileUrl);
          return;
        }
        if (res.success) {
          toast.success(`Новий товар додано у базу даних ${res.id}`);
          router.push(`/admin/dashboard/products/${res.id}`);
          closeModal();
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const [categories, setCategories] = useState<CategoryTypes[]>([]);
  const [bradns, setBrands] = useState<BrandTypes[]>([]);

  const [isPendengCategories, startTransitionCategory] = useTransition();

  const [image, setImage] = useState<string | null>(null);
  const [isPendengBrands, startTransitionBrands] = useTransition();

  const generateSlug = (text: string) => {
    setValue("slug", slugify(text));
  };

  useEffect(() => {
    startTransitionCategory(async () => {
      const res = await getAllCategoryProducts();
      if (!res.success) {
        toast.error("Error fetch categories");
        return;
      }
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    startTransitionBrands(async () => {
      const res = await getAllBrands();
      if (!res.success) {
        toast.error("Error fetch brands");
        return;
      }
      setBrands(res.data);
    });
  }, []);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    if (file.size > FILE_MAX_SIZE) {
      toast.error("Розмір файлу перевищує 2 МБ");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setFileToUpload(file);
  };

  if (!isOpen || type !== "product") return null;
  return (
    <div className="fixed inset-0 flex h-screen w-full items-start justify-start overflow-y-auto bg-black">
      <div className="w-[90%] rounded-lg bg-background p-6 shadow-lg">
        <ButtonXDellete
          type="button"
          onClick={() => closeModal()}
          className="fixed top-10 right-10"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-5">
          <div className="row-span-6 py-3">
            {image && (
              <div className="relative w-fit">
                <ButtonXDellete
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-0 right-0"
                />

                <Image
                  src={image}
                  alt="Image to upload"
                  className="aspect-square h-auto w-[310px] rounded-sm object-cover object-center"
                  width={310}
                  height={310}
                />
              </div>
            )}

            <InputAdminStyle
              type="file"
              accept="image/*"
              input_title="Завантажити файл"
              multiple
              onChange={handleFileUpload}
              className="mt-5 w-fit rounded-xl border border-gray-500 p-3 [&>input]:hidden"
            />
            <span className="text-gray-600">розмір зображення 310px x 310px</span>
          </div>
          <InputAdminStyle
            {...register("name")}
            required
            input_title="Назва товару"
            onChange={(e) => {
              setValue("nameFull", e.currentTarget.value);
              generateSlug(e.currentTarget.value);
            }}
          />
          <InputAdminStyle
            required
            {...register("nameFull", { required: true })}
            input_title="Повна назва товару"
            onChange={(v) => generateSlug(v.currentTarget.value)}
          />
          <InputAdminStyle {...register("slug")} required input_title="Slug товару" />
          {isPendengBrands ? (
            <p>Завантадення...</p>
          ) : (
            <SelectComponentAdmin
              selectTitle="Бренд товару"
              optionsTitle="--Виберіть бренд--"
              options={bradns.map((item) => ({
                value: item.brand_slug as string,
                name: item.name,
              }))}
              required
              defaultValue={undefined}
              {...register("brand_slug", { required: true })}
            />
          )}
          {isPendengCategories ? (
            <p>Завантаження...</p>
          ) : (
            <SelectComponentAdmin
              selectTitle="Категорія товару"
              optionsTitle="-- Виберіть категорію --"
              options={categories.map((item) => ({
                value: item.category_slug as string,
                name: item.name,
              }))}
              required
              defaultValue={undefined}
              {...register("category_slug", { required: true })}
            />
          )}
          <InputAdminStyle
            required
            type="number"
            min={0}
            step={0.01}
            {...register("price", { required: true, valueAsNumber: true })}
            input_title="Актуальна ціна товару"
          />
          <InputAdminStyle
            {...register("oldPrice", { valueAsNumber: true })}
            step={0.01}
            min={0}
            input_title="Стара ціна товару"
            type="number"
          />
          <InputAdminStyle
            className="my-auto ml-3"
            {...register("inStock")}
            type="checkbox"
            defaultChecked={true}
            input_title="Показувати на сайті"
          />
          <InputAdminStyle
            className="my-auto ml-3"
            {...register("toOrder")}
            type="checkbox"
            input_title="Товар під замовлення"
          />
          <ButtonYellow
            type="submit"
            disabled={isPendingCreate}
            className={twMerge("col-start-2 col-end-4", isPendingCreate && "animate-pulse")}
          >
            {isPendingCreate ? "Створення ..." : "Додати товар"}
          </ButtonYellow>
        </form>
      </div>
    </div>
  );
}
