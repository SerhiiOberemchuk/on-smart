import { ReactNode, Suspense } from "react";
import HeaderCart from "../carrello/components/HeaderCart";
import LayoutRepilogoComponent from "@/components/CheckoutPagesComponents/components/LayoutRepilogoComponent";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      <Suspense fallback={null}>
        <HeaderCart />
      </Suspense>
      <div className="container flex flex-col gap-5 pt-3 pb-6 lg:flex-row">
        <div className="flex-1">{children}</div>
        <Suspense fallback={null}>
          <LayoutRepilogoComponent className="-mx-4 md:mx-0" />
        </Suspense>
      </div>
    </section>
  );
}
