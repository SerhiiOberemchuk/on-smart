export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return (
    <section>
      <h1>{category}</h1>
    </section>
  );
}
