"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createKlarnaSessionAction,
  KlarnaSessionResponseType,
} from "@/app/actions/klarna/create-session";
import KlarnaScript from "./KlarnaScript";
import { placeKlarnaOrder } from "@/app/actions/klarna/create-order";
import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";
import { redirect } from "next/navigation";
import { PAGES } from "@/types/pages.types";
import ButtonYellow from "@/components/BattonYellow";
import { twMerge } from "tailwind-merge";

const containerId = "klarna_container";

export default function KlarnaPaymentWidget() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const { orderNumber, dataFirstStep, dataCheckoutStepConsegna, totalPrice } = useCheckoutStore();
  const { productsInBasket, basket } = useBasketStore();

  const [sessionData, setSessionData] = useState<KlarnaSessionResponseType | null>(null);

  const selectedCategory = useMemo(
    () => sessionData?.payment_method_categories?.[0]?.identifier,
    [sessionData?.payment_method_categories],
  );

  useEffect(() => {
    if (!orderNumber || !dataFirstStep || !dataCheckoutStepConsegna || !totalPrice) {
      redirect(PAGES.MAIN_PAGES.HOME);
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await createKlarnaSessionAction({
          orderNumber,
          dataFirstStep,
          dataCheckoutStepConsegna,
          productsInBasket,
          totalPrice,
          basket,
        });

        setSessionData(data);
      } catch (e) {
        console.error("Klarna session error", e);
        setError("Klarna session error");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderNumber, dataFirstStep, dataCheckoutStepConsegna, productsInBasket, totalPrice, basket]);

  useEffect(() => {
    if (!sessionData?.client_token) return;
    if (!selectedCategory) return;

    const tick = setInterval(() => {
      const klarna = window.Klarna;
      if (klarna?.Payments) {
        clearInterval(tick);

        klarna.Payments.init({ client_token: sessionData.client_token });

        klarna.Payments.load(
          {
            container: `#${containerId}`,
            payment_method_category: selectedCategory,
          },
          (res) => {
            if (res?.show_form === false) {
              setError("Klarna: widget non disponibile (show_form=false)");
            }
          },
        );
      }
    }, 100);

    return () => clearInterval(tick);
  }, [sessionData?.client_token, selectedCategory]);

  const handleAuthorize = () => {
    const klarna = window.Klarna;
    if (!klarna?.Payments) return;

    if (!totalPrice || !sessionData || !selectedCategory) {
      setError("Klarna: dati mancanti per il pagamento");
      return;
    }

    setIsPaying(true);
    setError(null);

    klarna.Payments.authorize({ payment_method_category: selectedCategory }, {}, async (res) => {
      try {
        if (!res.approved || !res.authorization_token) {
          setError("Pagamento non approvato");
          return;
        }

        const orderResult = await placeKlarnaOrder({
          authorizationToken: res.authorization_token,
          orderNumber,
          dataFirstStep,
          dataCheckoutStepConsegna,
          productsInBasket,
          totalPrice,
          basket,
        });

        if (orderResult.redirectUrl) window.location.href = orderResult.redirectUrl;
        else redirect(PAGES.CHECKOUT_PAGES.COMPLETED);
      } catch (e) {
        console.error(e);
        setError("Errore durante il pagamento Klarna");
      } finally {
        setIsPaying(false);
      }
    });
  };

  const isReady = !!sessionData?.client_token && !!selectedCategory && !!window.Klarna?.Payments;
  const isButtonDisabled = !isReady || loading || isPaying;
  return (
    <div className="container space-y-4 py-5">
      <KlarnaScript />

      <h1 className="text-xl font-semibold">Klarna Payment</h1>

      {loading && <div>Creazione sessione...</div>}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div id={containerId} className="min-h-[180px] rounded-md border bg-amber-50 p-3" />
      <ButtonYellow
        className={twMerge(
          "ml-auto flex items-center gap-2",
          isButtonDisabled && "cursor-not-allowed opacity-60",
          isPaying && "animate-pulse",
        )}
        disabled={isButtonDisabled}
        onClick={handleAuthorize}
      >
        {(loading || isPaying) && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {loading
          ? "Preparazione pagamento..."
          : isPaying
            ? "Apertura Klarna..."
            : "Conferma e paga con Klarna"}
      </ButtonYellow>
    </div>
  );
}
