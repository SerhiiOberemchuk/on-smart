import { getAccountWithdrawalOrders } from "@/app/actions/account/withdrawal/get-account-withdrawal-orders";
import WithdrawalForm from "@/components/WithdrawalForm";
import { WITHDRAWAL_STATUS_LABEL_IT } from "@/types/withdrawal.types";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Diritto di recesso — On-Smart",
  robots: { index: false, follow: false },
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" }).format(
    new Date(value),
  );
}

// Account withdrawal function (art. 54-bis): the logged-in consumer picks the
// order instead of re-typing identification (Dir. 2023/2673, recital 37).
export default function AccountRecessoPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="H2">Diritto di recesso</h1>
      <p className="helper_text">
        Hai 14 giorni dalla consegna per recedere dall&apos;acquisto senza indicarne il motivo
        (artt. 52 e ss. Codice del Consumo). Seleziona l&apos;ordine e premi «Conferma recesso»:
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
  const { nome, email, orders } = await getAccountWithdrawalOrders();

  const eligible = orders.filter((order) => order.withdrawalStatus === null);
  const submitted = orders.filter((order) => order.withdrawalStatus !== null);

  return (
    <div className="flex flex-col gap-6">
      {eligible.length > 0 ? (
        <WithdrawalForm
          defaultNome={nome}
          defaultEmail={email}
          orderChoices={eligible.map((order) => ({
            orderNumber: order.orderNumber,
            label: `${formatDate(order.createdAt)}${order.summary ? ` — ${order.summary}` : ""}`,
          }))}
        />
      ) : (
        <p className="helper_text">
          Non ci sono ordini per i quali sia possibile inviare una nuova dichiarazione di recesso.
        </p>
      )}

      {submitted.length > 0 && (
        <div className="flex flex-col gap-2 rounded-sm border border-stroke-grey p-4">
          <h2 className="H5">Dichiarazioni inviate</h2>
          {submitted.map((order) => (
            <p key={order.orderNumber} className="helper_text">
              <Link
                href={`/account/ordini/${order.orderNumber}`}
                className="text-yellow-500 underline"
              >
                {order.orderNumber}
              </Link>{" "}
              — stato: <strong>{WITHDRAWAL_STATUS_LABEL_IT[order.withdrawalStatus!]}</strong>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
