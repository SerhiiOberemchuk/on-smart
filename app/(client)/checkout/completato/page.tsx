import { Suspense } from "react";
import CompletatoPage from "./PageCompletato";

export default function Page() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <CompletatoPage />
    </Suspense>
  );
}
