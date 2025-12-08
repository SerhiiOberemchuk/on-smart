import { Suspense } from "react";
import PageProductAdmin from "./components/PageProductAdmin";
import { getProductById } from "@/app/actions/product/get-product-by-id";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductPage({ params }: Props) {
  const { id } = await params;
  // console.log({ id });

  const productPromise = getProductById(id).then((res) => {
    if (!res.success || !res.data) {
      throw new Error("Product not found");
    }
    return res.data;
  });

  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <PageProductAdmin dataAction={productPromise} />
    </Suspense>
  );
}
