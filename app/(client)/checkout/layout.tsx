import type { Metadata } from "next";
import { ReactNode, Suspense } from "react";
import HeaderCart from "../carrello/components/HeaderCart";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      <Suspense fallback={null}>
        <HeaderCart />
      </Suspense>
      <div className="container pt-3 pb-6">{children}</div>
    </section>
  );
}
