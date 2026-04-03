import { getAllBrands } from "@/app/actions/admin/brands/queries";
import { getAllCategoryProducts } from "@/app/actions/admin/categories/queries";
import { uploadFile } from "@/app/actions/admin/files/mutations";
import { createNewProduct } from "@/app/actions/admin/products/mutations";
import ButtonYellow from "@/components/BattonYellow";
import { ProductType } from "@/db/schemas/product.schema";
import { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import slugify from "@sindresorhus/slugify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useModalStore } from "../../store/modal-store";
import ButtonXDellete from "../ButtonXDellete";
import { FILE_MAX_SIZE } from "../categories/ModalCategoryForm";
import InputAdminStyle from "../InputComponent";
import SelectComponentAdmin from "../SelectComponent";

type CreateProductFormValues = ProductType & {
  searchKeywordsInput?: string;
};

export default function ModalAddNewPrduct() {
  const { type, isOpen, closeModal } = useModalStore();
  const { register, handleSubmit, setValue } = useForm<CreateProductFormValues>();
  const [isPendingCreate, startTransitionCreateProduct] = useTransition();
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryTypes[]>([]);
  const [brands, setBrands] = useState<BrandTypes[]>([]);
  const [isPendingCategories, startTransitionCategory] = useTransition();
  const [isPendingBrands, startTransitionBrands] = useTransition();
  const [image, setImage] = useState<string | null>(null);

  const onSubmit: SubmitHandler<CreateProductFormValues> = (data) => {
    if (!image || !fileToUpload) {
      toast.warning("Спочатку завантажте головне фото товару");
      return;
    }

    const hasValue = (value: unknown) =>
      value !== null && value !== undefined && `${value}`.trim() !== "";

    if (
      !hasValue(data.ean) ||
      !hasValue(data.lengthCm) ||
      !hasValue(data.widthCm) ||
      !hasValue(data.heightCm) ||
      !hasValue(data.weightKg)
    ) {
      toast.warning("Заповніть EAN, габарити та вагу товару");
      return;
    }

    const [category] = categories.filter((item) => item.category_slug === data.category_slug);

    startTransitionCreateProduct(async () => {
      try {
        const response = await uploadFile({ file: fileToUpload, sub_bucket: "products" });
        if (!response.fileUrl) {
          toast.error("Не вдалося завантажити зображення");
          return;
        }

        const result = await createNewProduct({
          ...data,
          ean: data.ean.trim(),
          searchKeywords: Array.from(
            new Set(
              (data.searchKeywordsInput ?? "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          ),
          imgSrc: response.fileUrl,
          category_id: category?.id ?? "",
        });

        if (result.error) {
          toast.error(result.error.toString());
          return;
        }

        if (result.success) {
          toast.success(`Товар створено: ${result.id}`);
          router.push(`/admin/dashboard/products/${result.id}`);
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
      const response = await getAllCategoryProducts();
      if (!response.success) {
        toast.error("Помилка завантаження категорій");
        return;
      }
      setCategories(response.data);
    });
  }, []);

  useEffect(() => {
    startTransitionBrands(async () => {
      const response = await getAllBrands();
      if (!response.success) {
        toast.error("Помилка завантаження брендів");
        return;
      }
      setBrands(response.data);
    });
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];

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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]"
          >
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
                  onChange={(event) => {
                    setValue("nameFull", event.currentTarget.value);
                    generateSlug(event.currentTarget.value);
                  }}
                />

                <InputAdminStyle
                  required
                  {...register("nameFull", { required: true })}
                  input_title="Повна назва товару"
                  onChange={(event) => generateSlug(event.currentTarget.value)}
                />
              </div>

              <InputAdminStyle {...register("slug")} required input_title="Слаг товару" />

              <div className="admin-grid-2">
                {isPendingBrands ? (
                  <p className="text-sm text-slate-400">Завантаження брендів...</p>
                ) : (
                  <SelectComponentAdmin
                    selectTitle="Бренд"
                    optionsTitle="-- Виберіть бренд --"
                    options={brands.map((item) => ({
                      value: item.brand_slug as string,
                      name: item.name,
                    }))}
                    required
                    defaultValue={undefined}
                    {...register("brand_slug", { required: true })}
                  />
                )}

                {isPendingCategories ? (
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

              <div className="admin-grid-2">
                <InputAdminStyle
                  required
                  type="text"
                  maxLength={14}
                  {...register("ean", { required: true })}
                  input_title="EAN (штрихкод)"
                  placeholder="Напр. 4820000000000"
                />
                <InputAdminStyle
                  type="text"
                  {...register("searchKeywordsInput")}
                  input_title="Ключові слова для пошуку"
                  placeholder="dahua, 4 canali, відеореєстратор"
                />
              </div>

              <div className="admin-grid-3">
                <InputAdminStyle
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  {...register("lengthCm", { required: true })}
                  input_title="Довжина, см"
                />
                <InputAdminStyle
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  {...register("widthCm", { required: true })}
                  input_title="Ширина, см"
                />
                <InputAdminStyle
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  {...register("heightCm", { required: true })}
                  input_title="Висота, см"
                />
              </div>

              <div className="admin-grid-3">
                <InputAdminStyle
                  required
                  type="number"
                  min={0}
                  step={0.001}
                  {...register("weightKg", { required: true })}
                  input_title="Вага, кг"
                />
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

              <InputAdminStyle
                {...register("isHidden")}
                type="checkbox"
                input_title="Приховати товар на сайті"
              />

              <div className="admin-actions justify-end border-t border-slate-600/45 pt-3">
                <ButtonYellow
                  type="submit"
                  disabled={isPendingCreate}
                  className="admin-btn-primary px-4! py-2! text-sm!"
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
