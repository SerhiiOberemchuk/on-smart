import type { Metadata } from "next";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import { getCustomerProfile } from "@/app/actions/account/profile/get-customer-profile";
import { auth } from "@/lib/auth";
import type { DeliveryMethod } from "@/types/orders.types";
import { headers } from "next/headers";
import CardSection from "./components/CardSection";
import ProductSuspensedListCarello from "./ProductSuspensedListCarello";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Carrello",
  description: "Carrello acquisti OnSmart.",
  robots: {
    index: false,
    follow: false,
  },
};

function CartRecommendations() {
  const productsAction = getAllProducts({ includeHidden: false });
  return <ProductSuspensedListCarello productsAction={productsAction} />;
}

// Reflect the customer's saved delivery preference in the cart summary (e.g.
// store pickup → no shipping estimate). Guests default to courier.
async function CartMain() {
  const session = await auth.api.getSession({ headers: await headers() });
  let defaultDeliveryMethod: DeliveryMethod = "CONSEGNA_CORRIERE";
  if (session?.user) {
    const profile = await getCustomerProfile();
    defaultDeliveryMethod = profile?.defaultDeliveryMethod ?? "CONSEGNA_CORRIERE";
  }
  return <CardSection defaultDeliveryMethod={defaultDeliveryMethod} />;
}

export default function CarrelloPage() {
  return (
    <>
      <Suspense fallback={null}>
        <CartMain />
      </Suspense>
      <Suspense fallback={null}>
        <CartRecommendations />
      </Suspense>
    </>
  );
}
