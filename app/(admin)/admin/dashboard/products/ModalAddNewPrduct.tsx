import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { uploadFile } from "@/app/actions/files/uploadFile";
import { createNewProduct } from "@/app/actions/product/create-new-product";
import ButtonYellow from "@/components/BattonYellow";
import { ProductType } from "@/db/schemas/product.schema";
import { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import slugify from "@sindresorhus/slugify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import ButtonXDellete from "../ButtonXDellete";
import { FILE_MAX_SIZE } from "../categories/ModalCategoryForm";
import InputAdminStyle from "../InputComponent";
import SelectComponentAdmin from "../SelectComponent";
import { useModalStore } from "../../store/modal-store";

export default function ModalAddNewPrduct() {
  const { type, isOpen, closeModal } = useModalStore();
  const { register, handleSubmit, setValue, watch } = useForm<ProductType>();
  const [isPendingCreate, startTransitionCreateProduct] = useTransition();
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryTypes[]>([]);
  const [bradns, setBrands] = useState<BrandTypes[]>([]);
  const [isPendengCategories, startTransitionCategory] = useTransition();
  const [isPendengBrands, startTransitionBrands] = useTransition();
  const [image, setImage] = useState<string | null>(null);

  const onSubmit: SubmitHandler<ProductType> = (data) => {
    if (!image || !fileToUpload) {
      toast.warning("Спочатку завантажте головне фото товару");
      return;
    }

    const slug = watch("category_slug");
    const [category_id] = categories.filter((i) => i.category_slug === slug);

    startTransitionCreateProduct(async () => {
      try {
        const resp = await uploadFile({ file: fileToUpload, sub_bucket: "products" });
        if (!resp.fileUrl) {
          toast.error("Не вдалося завантажити зображення");
          return;
        }

        const res = await createNewProduct({
          ...data,
          imgSrc: resp.fileUrl,
          category_id: category_id.id,
        });

        if (res.error) {
          toast.error(res.error.toString());
          return;
        }

        if (res.success) {
          toast.success(`Товар створено: ${res.id}`);
          router.push(`/admin/dashboard/products/${res.id}`);
          closeModal();
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const generateSlug = (text: string) => {
    setValue("slug", slugify(text));
  };

  useEffect(() => {
    startTransitionCategory(async () => {
      const res = await getAllCategoryProducts();
      if (!res.success) {
        toast.error("Помилка завантаження категорій");
        return;
      }
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    startTransitionBrands(async () => {
      const res = await getAllBrands();
      if (!res.success) {
        toast.error("Помилка завантаження брендів");
        return;
      }
      setBrands(res.data);
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    if (file.size > FILE_MAX_SIZE) {
      toast.error("Файл перевищує 2 МБ");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setFileToUpload(file);
  };

  if (!isOpen || type !== "product") return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h2 className="text-base font-semibold">Створити новий товар</h2>
          <ButtonXDellete type="button" onClick={() => closeModal()} className="h-8 w-8" />
        </div>

        <div className="admin-modal-content">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
            <div className="space-y-3">
              {image ? (
                <div className="relative w-fit">
                  <ButtonXDellete
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setFileToUpload(null);
                    }}
                    className="absolute top-2 right-2 h-8 w-8"
                  />
                  <Image
                    src={image}
                    alt="Зображення для завантаження"
                    className="aspect-square h-auto w-[300px] rounded-lg border border-slate-600/55 object-cover object-center"
                    width={300}
                    height={300}
                  />
                </div>
              ) : null}

              <InputAdminStyle
                type="file"
                accept="image/*"
                input_title="Завантажити зображення"
                multiple
                onChange={handleFileUpload}
              />
              <p className="text-xs text-slate-500">Рекомендований розмір: 310 x 310 px</p>
            </div>

            <div className="space-y-4">
              <div className="admin-grid-2">
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
              </div>

              <InputAdminStyle {...register("slug")} required input_title="Слаг товару" />

              <div className="admin-grid-2">
                {isPendengBrands ? (
                  <p className="text-sm text-slate-400">Завантаження брендів...</p>
                ) : (
                  <SelectComponentAdmin
                    selectTitle="Бренд"
                    optionsTitle="-- Виберіть бренд --"
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
                  <p className="text-sm text-slate-400">Завантаження категорій...</p>
                ) : (
                  <SelectComponentAdmin
                    selectTitle="Категорія"
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
              </div>

              <div className="admin-grid-3">
                <InputAdminStyle
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  {...register("price", { required: true, valueAsNumber: true })}
                  input_title="Поточна ціна"
                />

                <InputAdminStyle
                  {...register("oldPrice", { valueAsNumber: true })}
                  step={0.01}
                  min={0}
                  input_title="Стара ціна"
                  type="number"
                />

                <InputAdminStyle
                  {...register("inStock")}
                  type="number"
                  min={0}
                  defaultValue={1}
                  input_title="Кількість в наявності"
                />
              </div>

              <InputAdminStyle
                {...register("isOnOrder")}
                type="checkbox"
                input_title="Товар під замовлення"
              />

              <div className="admin-actions justify-end border-t border-slate-600/45 pt-3">
                <ButtonYellow
                  type="submit"
                  disabled={isPendingCreate}
                  className="admin-btn-primary !px-4 !py-2 !text-sm"
                >
                  {isPendingCreate ? "Створення..." : "Створити товар"}
                </ButtonYellow>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
