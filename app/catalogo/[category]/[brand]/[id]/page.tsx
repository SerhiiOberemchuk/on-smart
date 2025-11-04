export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; id: string }>;
}) {
  const { category, brand, id } = await params;
  return (
    <div>
      Product page:
      <br />
      Category: {category}, Brand: {brand}, ID: {id}
    </div>
  );
}
