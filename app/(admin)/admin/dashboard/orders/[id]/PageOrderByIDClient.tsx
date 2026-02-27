"use client";

import type { GetOrderFullInfoByIdResponseType } from "@/app/actions/orders/get-order";
import { updateOrderInfoByOrderIDAction } from "@/app/actions/orders/udate-order-info";
import type { OrderStatusTypes } from "@/types/orders.types";
import { use, useState, useTransition } from "react";
import { toast } from "react-toastify";
import {
  InvoiceActionsCard,
  OrderCustomerCard,
  OrderHeader,
  OrderManagementCard,
  OrderPaymentsCard,
  OrderProductsCard,
  OrderShippingCard,
  buildBillingCityLine,
  buildBillingLine,
  buildCityLine,
  buildClientDisplayName,
  buildDeliveryLine,
  calculateOrderTotals,
  canGenerateInvoice,
  downloadInvoicePdf,
  getDeliveryAddressEntries,
  getInvoiceAvailabilityReason,
  toDateTimeLocalValue,
} from "./_order-details";

export default function PageOrderByID({
  orderInfoAction,
}: {
  orderInfoAction: GetOrderFullInfoByIdResponseType;
}) {
  const { order, orderItems, payments, error } = use(orderInfoAction);

  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const [status, setStatus] = useState<OrderStatusTypes | "">(order?.orderStatus ?? "");
  const [carrier, setCarrier] = useState<string>(order?.carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState<string>(order?.trackingNumber ?? "");
  const [requestInvoice, setRequestInvoice] = useState<boolean>(order?.requestInvoice ?? false);
  const [shippedAt, setShippedAt] = useState<string>(() => toDateTimeLocalValue(order?.shippedAt));
  const [deliveredAt, setDeliveredAt] = useState<string>(() => toDateTimeLocalValue(order?.deliveredAt));
  const totals = calculateOrderTotals(orderItems, order);

  if (error) {
    return (
      <section className="admin-page">
        <h1 className="admin-title">Замовлення</h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          Помилка завантаження замовлення
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="admin-page">
        <h1 className="admin-title">Замовлення</h1>
        <div className="admin-empty">Замовлення не знайдено</div>
      </section>
    );
  }

  const currentOrder = order;
  const clientDisplayName = buildClientDisplayName(currentOrder);
  const deliveryLine = buildDeliveryLine(currentOrder);
  const cityLine = buildCityLine(currentOrder);
  const billingLine = buildBillingLine(currentOrder);
  const billingCityLine = buildBillingCityLine(currentOrder);
  const deliveryAddressEntries = getDeliveryAddressEntries(currentOrder.deliveryAdress);

  const invoiceAllowed = canGenerateInvoice(currentOrder.clientType, requestInvoice);
  const invoiceReason = getInvoiceAvailabilityReason(currentOrder.clientType, requestInvoice);

  function onSave() {
    setSaveError(null);

    startTransition(async () => {
      const response = await updateOrderInfoByOrderIDAction({
        orderId: currentOrder.id,
        dataToUpdate: {
          orderStatus: status || undefined,
          carrier: carrier.trim() ? carrier.trim() : null,
          trackingNumber: trackingNumber.trim() ? trackingNumber.trim() : null,
          requestInvoice,
          shippedAt: shippedAt ? new Date(shippedAt) : null,
          deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
        },
      });

      if (!response.succes) {
        const message = String(response.error ?? "Помилка збереження");
        setSaveError(message);
        toast.error(message);
        return;
      }

      toast.success("Збережено");
    });
  }

  function onGenerateInvoice() {
    if (!invoiceAllowed) {
      toast.info(invoiceReason ?? "Генерація рахунку недоступна для цього замовлення.");
      return;
    }

    try {
      setIsGeneratingInvoice(true);
      downloadInvoicePdf({
        order: currentOrder,
        orderItems: orderItems ?? [],
        payment: payments ?? null,
        requestInvoice,
      });
      toast.success("PDF-рахунок згенеровано");
    } catch (invoiceError) {
      const message = invoiceError instanceof Error ? invoiceError.message : "Помилка генерації рахунку";
      toast.error(message);
    } finally {
      setIsGeneratingInvoice(false);
    }
  }

  return (
    <section className="admin-page">
      <OrderHeader
        orderNumber={currentOrder.orderNumber}
        orderStatus={currentOrder.orderStatus}
        createdAt={currentOrder.createdAt}
        updatedAt={currentOrder.updatedAt}
        pending={pending}
        onSave={onSave}
      />

      {saveError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {saveError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <OrderProductsCard orderItems={orderItems} totals={totals} />
          <OrderPaymentsCard payment={payments} />
        </div>

        <div className="space-y-4">
          <OrderManagementCard
            status={status}
            onStatusChange={setStatus}
            carrier={carrier}
            onCarrierChange={setCarrier}
            trackingNumber={trackingNumber}
            onTrackingNumberChange={setTrackingNumber}
            shippedAt={shippedAt}
            onShippedAtChange={setShippedAt}
            deliveredAt={deliveredAt}
            onDeliveredAtChange={setDeliveredAt}
            requestInvoice={requestInvoice}
            onRequestInvoiceChange={setRequestInvoice}
            pending={pending}
            onSave={onSave}
          />

          <InvoiceActionsCard
            canGenerateInvoice={invoiceAllowed}
            blockReason={invoiceReason}
            generating={isGeneratingInvoice}
            onGenerateInvoice={onGenerateInvoice}
          />

          <OrderCustomerCard
            order={currentOrder}
            clientDisplayName={clientDisplayName}
            billingLine={billingLine}
            billingCityLine={billingCityLine}
            requestInvoice={requestInvoice}
          />

          <OrderShippingCard
            order={currentOrder}
            deliveryLine={deliveryLine}
            cityLine={cityLine}
            deliveryAddressEntries={deliveryAddressEntries}
          />
        </div>
      </div>
    </section>
  );
}
