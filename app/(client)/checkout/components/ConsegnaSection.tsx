"use client";

import { AddAddressForm } from "@/app/(client)/account/indirizzi/AddressManager";
import type { UserAddressType } from "@/db/schemas/user-addresses.schema";
import type { DeliveryMethod } from "@/types/orders.types";
import { useState } from "react";

export default function ConsegnaSection({
  deliveryMethod,
  onDeliveryMethodChange,
  deliveryPrice,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressSaved,
}: {
  deliveryMethod: DeliveryMethod;
  onDeliveryMethodChange: (method: DeliveryMethod) => void;
  deliveryPrice: number;
  addresses: UserAddressType[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  onAddressSaved: () => void;
}) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const isPickup = deliveryMethod === "RITIRO_NEGOZIO";

  return (
    <section className="flex flex-col gap-3 rounded-sm border border-stroke-grey p-4">
      <h2 className="H5">Consegna</h2>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="deliveryMethod"
          checked={deliveryMethod === "CONSEGNA_CORRIERE"}
          onChange={() => onDeliveryMethodChange("CONSEGNA_CORRIERE")}
        />
        Corriere ({deliveryPrice === 0 ? "gratuita" : `${deliveryPrice.toFixed(2)} €`})
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="deliveryMethod"
          checked={isPickup}
          onChange={() => onDeliveryMethodChange("RITIRO_NEGOZIO")}
        />
        Ritiro in negozio (Avellino, gratuito)
      </label>

      {!isPickup && (
        <div className="mt-2 flex flex-col gap-2">
          {addresses.map((address) => (
            <label key={address.id} className="flex items-start gap-2">
              <input
                type="radio"
                name="address"
                checked={selectedAddressId === address.id}
                onChange={() => onSelectAddress(address.id)}
              />
              <span className="helper_text">
                {address.label ? `${address.label} — ` : ""}
                {address.indirizzo} {address.numeroCivico}, {address.cap} {address.citta} (
                {address.provinciaRegione})
              </span>
            </label>
          ))}

          {showForm ? (
            <AddAddressForm
              onClose={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                onAddressSaved();
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="self-start rounded-sm border border-stroke-grey px-4 py-2 transition hover:bg-white/5"
            >
              + Nuovo indirizzo
            </button>
          )}
        </div>
      )}
    </section>
  );
}
