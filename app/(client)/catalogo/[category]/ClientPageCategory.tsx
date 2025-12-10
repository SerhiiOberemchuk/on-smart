export default function ClientPageCategoryCatalogo({ params }: { params: { category: string } }) {
  return (
    <div>
      <h1>{params.category}</h1>
    </div>
  );
}
