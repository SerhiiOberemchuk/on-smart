import {
  getAccountWithdrawalOrders,
  hasAccountWithdrawalOrders,
} from "@/app/actions/account/withdrawal/get-account-withdrawal-orders";
import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Suspense } from "react";
import RecessoClient from "./RecessoClient";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const metadata: Metadata = {
  title: "Diritto di recesso — On-Smart",
  robots: { index: false, follow: false },
};

// Account withdrawal function (art. 54-bis): the logged-in consumer finds the
// order and submits the statement on it (Dir. 2023/2673, recital 37).
export default function AccountRecessoPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="H2">Diritto di recesso</h1>
      <p className="helper_text">
        Hai 14 giorni dalla consegna per recedere dall&apos;acquisto senza indicarne il motivo
        (artt. 52 e ss. Codice del Consumo). Trova l&apos;ordine e premi «Richiedi recesso»:
        riceverai subito una email di conferma con data e ora di trasmissione.{" "}
        <Link href="/recesso" className="text-yellow-500 underline">
          Come funziona
        </Link>
      </p>
      <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-sm bg-white/10" />}>
        <RecessoContent />
      </Suspense>
    </section>
  );
}

async function RecessoContent() {
  // Per-user + current time → dynamic; opt in before reading Date.now().
  await connection();
  // Load only the last 30 days by default; the client fetches wider ranges on demand.
  const { nome, email, orders } = await getAccountWithdrawalOrders({
    fromMs: Date.now() - THIRTY_DAYS_MS,
    toMs: null,
  });
  const hasAny = orders.length > 0 ? true : await hasAccountWithdrawalOrders();

  if (!hasAny) {
    return (
      <p className="helper_text rounded-sm border border-stroke-grey p-4">
        Non hai ordini per i quali sia possibile esercitare il diritto di recesso.
      </p>
    );
  }

  return <RecessoClient nome={nome} email={email} orders={orders} />;
}
