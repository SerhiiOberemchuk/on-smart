"use client";

import Script from "next/script";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSumUpCheckout } from "@/app/actions/sumup/action";
import { PAGES } from "@/types/pages.types";
import { toast } from "react-toastify";
import { useCheckoutStore } from "@/store/checkout-store";
import { getTotalPriceToPay } from "@/utils/get-prices";

export default function SumUpModalButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { totalPrice, orderNumber } = useCheckoutStore();
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setCheckoutId(null);
    if (containerRef.current) containerRef.current.innerHTML = "";
  };

  useEffect(() => {
    if (!open || !checkoutId) return;

    if (!window.SumUpCard) {
      toast.error("SumUp non disponibile, riprova.");
      (() => close())();
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    window.SumUpCard.mount({
      id: "sumUpIdContainer",
      checkoutId,
      onResponse: (type, body) => {
        if (type === "success" || body?.status === "PAID") {
          close();
          router.push(PAGES.CHECKOUT_PAGES.COMPLETED);
        }
      },
    });
  }, [open, checkoutId, router]);

  const openAndCreate = () => {
    if (!totalPrice) {
      return;
    }
    startTransition(async () => {
      setOpen(true);

      const baseRef = orderNumber;
      const checkoutReference = `${baseRef}-TRY-${attempt}`;
      setAttempt((p) => p + 1);

      const checkout = await createSumUpCheckout({
        amount: getTotalPriceToPay(totalPrice),
        checkout_reference: checkoutReference,
        description: "ffedvv  jffj kfkvnr",
      });

      if (!checkout.success) {
        console.error(checkout.error);
        toast.error("Prova più tardi");
        close();
        return;
      }

      setCheckoutId(checkout.data.id);
    });
  };

  return (
    <>
      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        strategy="afterInteractive"
      />

      <button
        type="button"
        onClick={openAndCreate}
        disabled={pending}
        className="w-full rounded-xl bg-[#F2C94C] px-6 py-3 font-semibold text-black disabled:opacity-60"
      >
        {pending ? "Apro…" : "Paga e procedi avanti"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl">
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 rounded-lg px-3 py-1 text-sm text-black/70 hover:bg-black/5"
              aria-label="Chiudi"
            >
              ✕
            </button>

            <div className="mb-3">
              <div className="text-lg font-semibold text-black">Pagamento con carta</div>
              <div className="text-sm text-black/60">Completa il pagamento con SumUp</div>
            </div>

            <div id="sumUpIdContainer" ref={containerRef} />
          </div>
        </div>
      )}
    </>
  );
}
