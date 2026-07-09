import { getAddresses } from "@/app/actions/account/addresses/get-addresses";
import { getCustomerProfile } from "@/app/actions/account/profile/get-customer-profile";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AccountCheckoutClient from "./AccountCheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — On-Smart",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-md bg-black/10" />}>
      <CheckoutLoader />
    </Suspense>
  );
}

async function CheckoutLoader() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Checkout is account-only (the proxy also gates /checkout/* for guests).
  if (!session?.user) {
    redirect("/accedi?redirect=/checkout");
  }

  const [profile, addresses] = await Promise.all([getCustomerProfile(), getAddresses()]);

  return (
    <AccountCheckoutClient email={session.user.email} profile={profile} addresses={addresses} />
  );
}
