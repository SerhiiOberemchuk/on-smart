import LinkYellow from "@/components/YellowLink";

export default async function ProductsPage() {
  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <LinkYellow
        href="/admin/dashboard/products/new-product"
        className="mx-auto flex"
        title="Добавити новий товар"
      />
      <div className="flex-1">
        <h1>Список товарів</h1>
      </div>
    </div>
  );
}
