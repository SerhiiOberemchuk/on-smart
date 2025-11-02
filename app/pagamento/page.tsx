"use client";
import { useEffect, useState } from "react";
import { createCheckout } from "../actions/sumup/action";
import "./styles.css";
export default function CarrelloPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function handlePay() {
    try {
      setIsLoading(true);

      const checkoutId = await createCheckout({ amount: 1, checkout_reference: "order_123" });
      if (checkoutId?.id) setCheckoutId(checkoutId?.id);

      const waitForSDK = () =>
        new Promise<void>((resolve) => {
          const check = () => {
            // @ts-ignore
            if (window.SumUpCard) resolve();
            else setTimeout(check, 200);
          };
          check();
        });
      await waitForSDK();

      // @ts-ignore
      window.SumUpCard.mount({
        id: "sumup-card",
        checkoutId,
        methods: ["card", "applepay", "googlepay"],
        amount: "65",
        currency: "EUR",
        locale: "it-IT",
        onResponse: (result: any) => {
          console.log("Payment result:", result);
          if (result.status === "PAID") {
            alert("✅ Оплата успішна!");
            window.location.href = "/thank-you";
          } else if (result.status === "FAILED") {
            alert("❌ Помилка при оплаті, спробуйте ще раз");
          } else {
            console.log("📦 Інший статус:", result.status);
          }
        },
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Сталася помилка при створенні платежу");
      setIsLoading(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="mb-4 text-2xl">Pagamento</h1>

      <button
        type="button"
        disabled={isLoading}
        className="cursor-pointer rounded bg-amber-300 p-3 disabled:opacity-50"
        onClick={handlePay}
      >
        {isLoading ? "Creazione checkout..." : "Paga con SumUp"}
      </button>

      {/* контейнер для вставки iframe SumUp */}
      <div id="sumup-card" className="mt-6" style={{ minHeight: 300 }} />
    </section>
  );
}
