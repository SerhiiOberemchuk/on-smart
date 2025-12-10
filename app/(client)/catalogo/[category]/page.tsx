import { Suspense } from "react";
import ClientPageCategoryCatalogo from "./ClientPageCategory";

export default function CategoryPage(params: { category: string }) {
  return (
    <section>
      <Suspense fallback={<p>Carico...</p>}>
        <ClientPageCategoryCatalogo params={params} />
      </Suspense>
    </section>
  );
}
