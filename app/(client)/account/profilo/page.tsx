import { getCustomerProfile } from "@/app/actions/account/profile/get-customer-profile";
import { requireCustomerSession } from "@/app/actions/account/_shared/require-customer-session";
import type { Metadata } from "next";
import { Suspense } from "react";
import PasswordForm from "./PasswordForm";
import ProfiloForm from "./ProfiloForm";

export const metadata: Metadata = {
  title: "Il mio profilo — On-Smart",
  robots: { index: false, follow: false },
};

export default function ProfiloPage() {
  return (
    <section className="flex max-w-xl flex-col gap-10">
      <div>
        <h1 className="H2 mb-6">Il mio profilo</h1>
        <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-md bg-black/10" />}>
          <ProfiloLoader />
        </Suspense>
      </div>

      <div>
        <h2 className="H5 mb-4">Cambia password</h2>
        <PasswordForm />
      </div>
    </section>
  );
}

async function ProfiloLoader() {
  const session = await requireCustomerSession();
  const profile = await getCustomerProfile();
  return <ProfiloForm profile={profile} email={session.user.email} />;
}
