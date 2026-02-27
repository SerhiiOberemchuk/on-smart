import { getProductById } from "@/app/actions/product/get-product-by-id";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageProductAdmin from "./components/PageProductAdmin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductPage({ params }: Props) {
  const { id } = await params;

  const productPromise = getProductById(id).then((res) => {
    if (!res.success || !res.data) {
      notFound();
    }
    return res.data;
  });

  return (
    <Suspense fallback={<p className="admin-muted">Завантаження...</p>}>
      <PageProductAdmin dataAction={productPromise} />
    </Suspense>
  );
}
