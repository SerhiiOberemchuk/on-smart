import { Suspense } from "react";
import PageCategoria from "./PageCategoria";

export default function Page({ params }: { params: Promise<{ categoria: string }> }) {
  return (
    <Suspense>
      <PageCategoria params={params} />
    </Suspense>
  );
}
