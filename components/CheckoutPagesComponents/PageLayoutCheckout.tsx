import CheckoutStepsLinks from "./components/CheckoutStepsLinks";
import CheckouteStep1FormClientData from "./components/CheckouteStep1FormClientData";
import CheckouteStep2ConsegnaDati from "./components/CheckouteStep2ConsegnaDati";
import CheckouteStep3Pagamento from "./components/CheckouteStep3Pagamento";
import CheckouteStep4Riepilogo from "./components/CheckouteStep4Riepilogo";

export default function PageLayoutCheckout({
  page,
}: {
  page: "informazioni" | "consegna" | "pagamento" | "riepilogo";
}) {
  return (
    <div className="-mx-4 flex flex-col gap-6 bg-background p-3 md:mx-0">
      <CheckoutStepsLinks />
      {page === "informazioni" && <CheckouteStep1FormClientData />}
      {page === "consegna" && <CheckouteStep2ConsegnaDati />}
      {page === "pagamento" && <CheckouteStep3Pagamento />}
      {page === "riepilogo" && <CheckouteStep4Riepilogo />}
    </div>
  );
}
