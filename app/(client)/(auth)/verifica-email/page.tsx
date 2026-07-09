import { auth } from "@/lib/auth";
import { safeRedirect } from "@/utils/safe-redirect";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import ResendVerification from "../components/ResendVerification";

export const metadata: Metadata = {
  title: "Conferma email — On-Smart",
  robots: { index: false, follow: false },
};

export default async function VerificaEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const redirectTarget = safeRedirect(sp.redirect, "");
  const backToCart = redirectTarget === "/carrello";

  if (sp.error) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="H5">Link non valido o scaduto</h1>
        <p className="helper_text">
          Il link di conferma non è più valido. Richiedine uno nuovo qui sotto.
        </p>
        {sp.email ? (
          <ResendVerification email={sp.email} redirect={redirectTarget} />
        ) : (
          <Link href="/accedi" className="text-yellow-500 underline">
            Vai al login
          </Link>
        )}
      </div>
    );
  }

  // Verification auto-signs the user in, so the session is available here.
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.role === "admin";

  const primaryHref = backToCart ? "/carrello" : isAdmin ? "/admin/dashboard" : "/account";
  const primaryLabel = backToCart
    ? "Torna al carrello"
    : isAdmin
      ? "Vai all'amministrazione"
      : "Vai al mio account";

  return (
    <div className="flex flex-col gap-4 text-center">
      <h1 className="H5">Email confermata!</h1>
      <p className="helper_text">Il tuo account è attivo.</p>
      <Link
        href={primaryHref}
        className="rounded-sm bg-yellow-500 px-4 py-3 text-center font-medium text-black transition hover:bg-yellow-400"
      >
        {primaryLabel}
      </Link>
      {(backToCart || isAdmin) && (
        <Link href="/account" className="text-yellow-500 underline">
          Vai al mio account
        </Link>
      )}
    </div>
  );
}
