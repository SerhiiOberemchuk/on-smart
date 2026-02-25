import { redirect } from "next/navigation";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { updateOrderInfoByOrderIDAction } from "@/app/actions/orders/udate-order-info";
import { sendMailOrders } from "@/app/actions/mail/mail-orders";
import { sendTelegramMessage } from "@/app/actions/telegram/send-message";
import { getSumUpCheckoutStatus } from "@/app/actions/sumup/action";
import { getOrderFullInfoById } from "@/app/actions/orders/get-order";

// TODO: заміни на свій реальний action який повертає order + все що треба для листів

type PageProps = {
  params: { orderNumber: string };
  searchParams: { checkout_id?: string; order_id?: string };
};

export default async function SumUpCallbackPage({ params, searchParams }: PageProps) {
  const orderNumber = params.orderNumber;
  const checkoutId = searchParams.checkout_id;
  const orderId = searchParams.order_id;

  // якщо SumUp не дав checkout_id — ведемо на загальну completed з помилкою
  if (!checkoutId) {
    redirect(`/checkout/completato/${orderNumber}?payment=sumup&status=missing_checkout_id`);
  }

  // 1) беремо order з БД
  if (!orderId) {
    redirect(`/checkout/completato/${orderNumber}?payment=sumup&status=missing_order_id`);
  }
  const info = await getOrderFullInfoById({ id: orderId }); // ти підставиш своє
  const order = info?.order;

  if (!order) {
    redirect(`/checkout/completato/${orderNumber}?payment=sumup&status=order_not_found`);
  }

  // 2) питаємо SumUp статус
  let status: "PAID" | "FAILED" | "PENDING" | "EXPIRED";
  try {
    const sumup = await getSumUpCheckoutStatus(checkoutId);
    status = sumup.status;
  } catch {
    // якщо API тимчасово недоступне — покажемо pending/verification
    redirect(`/checkout/completato/${orderNumber}?payment=sumup&status=verify_error`);
  }

  // 3) оновлюємо payment/order у БД
  if (status === "PAID") {
    await updateOrderPaymentAction({
      orderNumber,
      data: { status: "SUCCESS", providerOrderId: checkoutId },
    });

    await updateOrderInfoByOrderIDAction({
      orderId: order.id,
      dataToUpdate: { orderStatus: "PAID" },
    });

    // 4) нотифікації один раз (тут потрібна ідемпотентність!)
    // Найкраще: в БД мати поле notifiedAt і перевіряти його.
    // Якщо в тебе такого ще нема — мінімум: перевірити, що payment.status не SUCCESS до цього.
    // (Умову підставиш з твоїх даних)
    if (info?.payments?.status !== "SUCCESS") {
      try {
        await sendMailOrders({
          orderNumber,
          customerData: {
            userId: info.order?.userId ?? null,
            nome: info.order?.nome ?? null,
            cognome: info.order?.cognome ?? null,
            email: info.order?.email ?? "",
            clientType: info.order?.clientType ?? "privato",
            ragioneSociale: info.order?.ragioneSociale ?? null,
            deliveryMethod: info.order?.deliveryMethod ?? "CONSEGNA_CORRIERE",
            deliveryPrice: info.order?.deliveryPrice ?? 0,
            numeroTelefono: info.order?.numeroTelefono ?? "",
            referenteContatto: info.order?.referenteContatto ?? null,
            requestInvoice: info.order?.requestInvoice ?? false,
            orderStatus: info.order?.orderStatus ?? "PENDING_PAYMENT",
            indirizzo: info.order?.indirizzo ?? null,
            numeroCivico: info.order?.numeroCivico ?? null,
            citta: info.order?.citta ?? null,
            cap: info.order?.cap ?? null,
            nazione: info.order?.nazione ?? null,
            provinciaRegione: info.order?.provinciaRegione ?? null,
            codiceFiscale: info.order?.codiceFiscale ?? null,
            partitaIva: info.order?.partitaIva ?? null,
            pecAzzienda: info.order?.pecAzzienda ?? null,
            codiceUnico: info.order?.codiceUnico ?? null,
            paymentOrderID: info.payments?.providerOrderId ?? null,
            trackingNumber: info.order?.trackingNumber ?? null,
            carrier: info.order?.carrier ?? null,
            shippedAt: info.order?.shippedAt ?? null,
            deliveredAt: info.order?.deliveredAt ?? null,
          },
          dataCheckoutStepConsegna: {
            sameAsBilling: true,
            deliveryAdress: {
              referente_contatto: info.order?.referenteContatto ?? "--",
              ragione_sociale: info.order?.ragioneSociale ?? "--",
              indirizzo: info.order?.indirizzo ?? "--",
              citta: info.order?.citta ?? "--",
              cap: info.order?.cap ?? "--",
              nazione: info.order?.nazione ?? "--",
              provincia_regione: info.order?.provinciaRegione ?? "--",
              partita_iva: info.order?.partitaIva ?? "--",
            },
          },

          dataCheckoutStepPagamento: { paymentMethod: "sumup", title: "SumUp" },
          productsInBasket:
            info.orderItems?.map((item) => ({
              id: item.productId!,
              nameFull: item.title,
              quantity: item.quantity,
              price: item.unitPrice,
            })) ?? [],
          bascket:
            info.orderItems?.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })) ?? [],
        });

        await sendTelegramMessage({
          orderNumber,
          orderId: order.id,
          customerDisplayName:
            info.order?.nome && info.order?.cognome
              ? `${info.order.nome} ${info.order.cognome}`
              : "Cliente",
          total: info.payments?.amount ?? "",
          paymentMethod: "SumUp",
          deliveryMethod: info.order?.deliveryMethod ?? "",
          email: info.order?.email ?? "",
          numeroTelefono: info.order?.numeroTelefono ?? "",
        });
      } catch (e) {
        // не блокуємо користувача, але логувати варто
        console.error("Errore durante le notifiche post-pagamento:", e);
      }
    }

    redirect(`/checkout/completato/${orderNumber}?payment=sumup&status=paid`);
  }

  if (status === "FAILED" || status === "EXPIRED") {
    await updateOrderPaymentAction({
      orderNumber,
      data: { status: "FAILED", providerOrderId: checkoutId },
    });

    redirect(`/checkout/completato/${orderNumber}?payment=sumup&status=failed`);
  }

  // PENDING
  await updateOrderPaymentAction({
    orderNumber,
    data: { status: "PENDING", providerOrderId: checkoutId },
  });

  redirect(`/checkout/completato/${orderNumber}?payment=sumup&status=pending`);
}
