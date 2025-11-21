import ButtonYellow from "@/components/BattonYellow";
import RiepilogoDatiConsegna from "./RepilogoDatiConsegna";
import RiepilogoDatiCliente from "./RiepilogoDatiCliente";
import RiepilogoDatiPagamento from "./RiepilogoPagamento";
import { redirect } from "next/navigation";

export default function CheckouteStep4Riepilogo() {
  const handleConfirmOrder = () => {
    console.log("Ordine confermato!");
    redirect("/checkout/completato");
  };
  return (
    <div className="flex flex-col gap-6">
      <RiepilogoDatiCliente />
      <RiepilogoDatiConsegna />
      <RiepilogoDatiPagamento />
      <ButtonYellow className="ml-auto" onClick={handleConfirmOrder}>
        Conferma Ordine
      </ButtonYellow>
    </div>
  );
}
