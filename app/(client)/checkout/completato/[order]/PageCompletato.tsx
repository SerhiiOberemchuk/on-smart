"use client";

import { use, useEffect } from "react";

import Image from "next/image";
import icon_success from "@/assets/icons/icon_success.svg";

import { GetOrderResponseType } from "@/app/actions/orders/get-order";
import RiepilogoDatiCliente from "@/components/CheckoutPagesComponents/components/RiepilogoDatiCliente";
import { GetOrderPayInfoResponseType } from "@/app/actions/payments/payment-order-actions";
import RiepilogoDatiConsegna from "@/components/CheckoutPagesComponents/components/RepilogoDatiConsegna";
import RiepilogoDatiPagamento from "@/components/CheckoutPagesComponents/components/RiepilogoPagamento";
import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";
import { getSumUpCheckoutStatus } from "@/app/actions/sumup/action";
import { log } from "console";

export default function CompletatoPage({
  order,
  paymentInfo,
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  order: GetOrderResponseType;
  paymentInfo: GetOrderPayInfoResponseType;
}) {
  const orderInfo = use(order);
  const paymantInfoState = use(paymentInfo);
  const searchParamsState = use(searchParams);
  const { clearAllCheckoutData } = useCheckoutStore();
  const { clearBasketStore } = useBasketStore();
  console.log("searchParamsState: ", searchParamsState);

  useEffect(() => {
    if (searchParamsState.checkout_id) {
      (async () => {
        const resp = await getSumUpCheckoutStatus(searchParamsState.checkout_id as string);
        log("SumUp status: ", resp);
      })();
    }
    if (searchParamsState?.payment === "sumup") {
      alert(
        "Il pagamento è in fase di verifica. Se il pagamento è andato a buon fine, lo stato dell'ordine sarà aggiornato a breve. Se hai domande, contatta il supporto.",
      );
    }
  }, [searchParamsState]);

  useEffect(() => {
    const clear = setTimeout(() => {
      clearAllCheckoutData();
      clearBasketStore();
    }, 1000);
    return () => clearTimeout(clear);
  }, [clearAllCheckoutData, clearBasketStore]);

  return (
    <section className="flex flex-col gap-4 rounded-sm bg-background p-4">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-2">
          <Image src={icon_success} alt="success icon" />
          <h1 className="H3 text-green">Ordine Completato</h1>
        </div>

        <p className="btn_small">
          Numero ordine: <span className="body_R_20">{orderInfo.order?.orderNumber}</span>
        </p>
        <p className="btn_small">
          Data dell`ordine:{" "}
          <span className="body_R_20">{orderInfo.order?.createdAt.toLocaleDateString()}</span>
        </p>

        {orderInfo.order?.deliveryMethod === "CONSEGNA_CORRIERE" && (
          <>
            <p className="btn_small">
              Totale:{" "}
              <span className="body_R_20">
                {(
                  Number(paymantInfoState.paymentInfo?.amount) +
                  Number(orderInfo.order.deliveryPrice)
                ).toFixed(2)}{" "}
                €
              </span>
            </p>
            <p className="btn_small">
              Consegna:{" "}
              <span className="body_R_20">{orderInfo.order?.deliveryPrice.toFixed(2)} €</span>
            </p>
          </>
        )}
        {orderInfo.order?.deliveryMethod === "RITIRO_NEGOZIO" && (
          <>
            <p className="btn_small">
              Totale:{" "}
              <span className="body_R_20">
                {Number(paymantInfoState.paymentInfo?.amount).toFixed(2)} €
              </span>
            </p>
            <p className="btn_small">Ritiro presto negozzio</p>
          </>
        )}
        <p className="helper_text mt-2 w-full text-left text-text-grey">
          L`Ordine è stato correttamente inviato. Riceverai una mail di conferma con i dettagli
          dell`ordine e la fattura. Per qualsiasi domanda o assistenza, non esitare a contattarci.
        </p>
      </div>

      {orderInfo.order && (
        <RiepilogoDatiCliente isModifica={false} externalData={orderInfo.order} />
      )}
      {orderInfo.order && (
        <RiepilogoDatiConsegna
          isModifica={false}
          externalDataConsegna={{
            deliveryAdress: orderInfo.order.deliveryAdress,
            // deliveryMethod: orderInfo.order.deliveryMethod,
            sameAsBilling: orderInfo.order.sameAsBilling,
          }}
          externalDataCustomer={orderInfo.order}
        />
      )}
      <RiepilogoDatiPagamento
        isModifica={false}
        externalDataPayment={{ paymentMethod: paymantInfoState.paymentInfo?.provider }}
      />
    </section>
  );
}
