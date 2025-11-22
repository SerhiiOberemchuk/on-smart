export default async function PageCategoria({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  return (
    <section>
      <h1>Categoria: {categoria}</h1>
    </section>
  );
}
