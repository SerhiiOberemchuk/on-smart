import { getAddresses } from "@/app/actions/account/addresses/get-addresses";
import type { Metadata } from "next";
import { Suspense } from "react";
import AddressManager from "./AddressManager";

export const metadata: Metadata = {
  title: "I miei indirizzi — On-Smart",
  robots: { index: false, follow: false },
};

export default function IndirizziPage() {
  return (
    <section>
      <h1 className="H2 mb-6">I miei indirizzi</h1>
      <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-sm bg-white/10" />}>
        <AddressLoader />
      </Suspense>
    </section>
  );
}

async function AddressLoader() {
  const addresses = await getAddresses();
  return <AddressManager addresses={addresses} />;
}
