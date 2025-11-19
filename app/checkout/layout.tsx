import { ReactNode } from "react";
import HeaderCart from "../carrello/components/HeaderCart";
import LayoutRepilogoComponent from "@/components/CheckoutPagesComponents/components/LayoutRepilogoComponent";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      <HeaderCart />
      <div className="container flex flex-col gap-5 pt-3 pb-6 lg:flex-row">
        <div className="flex-1">{children}</div>
        <LayoutRepilogoComponent className="-mx-4 md:mx-0" />
      </div>
    </section>
  );
}
