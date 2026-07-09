import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import AccountNavIcon, { type AccountIconName } from "./components/AccountNavIcon";
import { ACCOUNT_LINKS } from "./components/account-nav";

export const metadata: Metadata = {
  title: "Il mio account — On-Smart",
  robots: { index: false, follow: false },
};

// Landing page for /account. It renders real content (a greeting) instead of
// redirecting: a render-time redirect() here crashes when the page is the
// target of the sign-in server action — the multipart body gets re-read in
// standalone mode → "Unexpected end of form" + a broken client navigation.
export default function AccountPage() {
  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="H2">
          <Suspense fallback="Ciao!">
            <Greeting />
          </Suspense>
        </h1>
        <p className="helper_text max-w-prose">
          Benvenuto nella tua area personale. Da qui puoi seguire i tuoi ordini, aggiornare i dati
          del profilo, gestire gli indirizzi di spedizione e ritrovare i prodotti che ami.
        </p>
      </header>

      <nav className="grid gap-4 sm:grid-cols-2">
        {ACCOUNT_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start gap-4 rounded-sm border border-stroke-grey p-4 transition hover:border-yellow-500/50 hover:bg-white/5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
              <AccountNavIcon name={link.icon} className="h-5 w-5" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium text-white transition group-hover:text-yellow-500">
                {link.label}
              </span>
              <span className="helper_text">{CARD_HINTS[link.icon]}</span>
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}

async function Greeting() {
  const session = await auth.api.getSession({ headers: await headers() });
  const firstName = session?.user?.name?.trim().split(/\s+/)[0];
  return <>Ciao{firstName ? `, ${firstName}` : ""}! 👋</>;
}

const CARD_HINTS: Record<AccountIconName, string> = {
  orders: "Storico e stato delle spedizioni",
  profile: "Dati personali e password",
  address: "Indirizzi di spedizione e fatturazione",
  heart: "I prodotti che hai salvato",
  return: "Diritto di recesso e rimborsi",
};
