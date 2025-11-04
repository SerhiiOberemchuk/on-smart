"use client";
// import { useState } from "react";
// import { createCheckout } from "../actions/sumup/action";
import "./styles.css";
import Script from "next/script";
import type { CardFieldsOnApproveData } from "@paypal/paypal-js";

import {
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
  PayPalCardFieldsProvider,
  PayPalCardFieldsForm,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import { useState } from "react";
export default function CarrelloPage() {
  // const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const initialOptions: ReactPayPalScriptOptions = {
    // clientId: "AeD8gpqQhvgAEyIcZWxE0jyzwepZ92hlSD3etxkW0wci1avOUNiwH_08JJARKsgC88TuciU7P1ZVuvi9",
    clientId: "AduyjUJ0A7urUcWtGCTjanhRBSzOSn9_GKUzxWDnf51YaV1eZNA0ZAFhebIV_Eq-daemeI7dH05KjLWm",
    components: "card-fields",
    // Add other options as needed
  };
  async function createOrder() {
    return fetch("https://react-paypal-js-storybook.fly.dev/api/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [
          {
            sku: "1blwyeo8",
            quantity: 2,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((order) => {
        return order.id;
      })
      .catch((err) => {
        console.error(err);
      });
  }
  function onApprove(data: CardFieldsOnApproveData) {
    fetch("https://react-paypal-js-storybook.fly.dev/api/paypal/capture-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderID: data.orderID }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log({ data });

        setIsPaying(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js";
  //   script.async = true;
  //   document.body.appendChild(script);
  // }, []);

  // async function handlePay() {
  //   try {
  //     setIsLoading(true);

  //     const checkoutId = await createCheckout({ amount: 1, checkout_reference: "order_123" });
  //     if (!checkoutId?.id) return;

  //     SumUpCard.mount({
  //       id: "sumup-card",
  //       checkoutId: checkoutId.id,
  //       showAmount: true,
  //       // methods: ["card", "applepay", "googlepay"],

  //       currency: "EUR",
  //       locale: "it-IT",
  //       onResponse: function (type, body) {
  //         console.log("Type", type);
  //         console.log("Body", body);
  //       },
  //     });

  //     setIsLoading(false);
  //   } catch (err) {
  //     console.error("Payment error:", err);
  //     alert("Сталася помилка при створенні платежу");
  //     setIsLoading(false);
  //   }
  // }

  return (
    <section className="p-8">
      <h1 className="mb-4 text-2xl">Pagamento</h1>

      {/* <button
        type="button"
        disabled={isLoading}
        className="cursor-pointer rounded bg-amber-300 p-3 disabled:opacity-50"
        // onClick={handlePay}
      >
        {isLoading ? "Creazione checkout..." : "Paga con SumUp"}
      </button> */}

      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        strategy="afterInteractive"
      />
      <div id="sumup-card" className="mt-6" style={{ minHeight: 300 }} />

      <div className="p-10">
        <PayPalScriptProvider options={initialOptions}>
          {/* <PayPalButtons /> */}
          <PayPalCardFieldsProvider
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
              console.log(err);
            }}
          >
            <PayPalCardFieldsForm />
            {/* <PayPalHostedField
              id="card-number"
              hostedFieldType="number"
              options={{ selector: "#card-number" }}
            />
            <PayPalHostedField id="cvv" hostedFieldType="cvv" options={{ selector: "#cvv" }} />
            <PayPalHostedField
              id="expiration-date"
              hostedFieldType="expirationDate"
              options={{ selector: "#expiration-date" }}
            />
            <button type="submit">Paga con carta</button> */}
            <SubmitPayment isPaying={isPaying} setIsPaying={setIsPaying} />
          </PayPalCardFieldsProvider>
        </PayPalScriptProvider>
      </div>
    </section>
  );
}
const SubmitPayment: React.FC<{
  setIsPaying: React.Dispatch<React.SetStateAction<boolean>>;
  isPaying: boolean;
}> = ({ isPaying, setIsPaying }) => {
  const { cardFieldsForm, fields } = usePayPalCardFields();
  console.log(fields);

  const handleClick = async () => {
    if (!cardFieldsForm) {
      const childErrorMessage =
        "Unable to find any child components in the <PayPalCardFieldsProvider />";

      throw new Error(childErrorMessage);
    }
    const formState = await cardFieldsForm.getState();

    if (!formState.isFormValid) {
      return alert("The payment form is invalid");
    }
    setIsPaying(true);

    cardFieldsForm.submit().catch((err) => {
      console.error("Card Fields submit error:", err);
      setIsPaying(false);
    });
  };

  return (
    <button
      className={isPaying ? "btn" : "btn btn-primary"}
      style={{ float: "right" }}
      onClick={handleClick}
    >
      {isPaying ? <div className="spinner tiny" /> : "Pay"}
    </button>
  );
};
