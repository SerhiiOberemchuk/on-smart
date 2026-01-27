"use client";

import ButtonYellow from "@/components/BattonYellow";
import RiepilogoDatiConsegna from "./RepilogoDatiConsegna";
import RiepilogoDatiCliente from "./RiepilogoDatiCliente";
import RiepilogoDatiPagamento from "./RiepilogoPagamento";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function CheckouteStep4Riepilogo() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleConfirmOrder = () => {
    setIsButtonDisabled(true);
    redirect("/checkout/completato");
  };

  return (
    <div className="flex flex-col gap-6">
      <RiepilogoDatiCliente />
      <RiepilogoDatiConsegna />
      <RiepilogoDatiPagamento />
      <ButtonYellow className="ml-auto" disabled={isButtonDisabled} onClick={handleConfirmOrder}>
        Conferma Ordine
      </ButtonYellow>
    </div>
  );
}
