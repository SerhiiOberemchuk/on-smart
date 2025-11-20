import CheckoutStepsLinks from "./components/CheckoutStepsLinks";
import CheckouteStep1FormClientData from "./components/CheckouteStep1FormClientData";
import CheckouteStep2ConsegnaDati from "./components/CheckouteStep2ConsegnaDati";
import CheckouteStep3Pagamento from "./components/CheckouteStep3Pagamento";

export default function PageLayoutCheckout({
  page,
}: {
  page: "client-data" | "consegna" | "pagamento";
}) {
  return (
    <div className="-mx-4 flex flex-col gap-6 bg-background p-3 md:mx-0">
      <CheckoutStepsLinks />
      {page === "client-data" && <CheckouteStep1FormClientData />}
      {page === "consegna" && <CheckouteStep2ConsegnaDati />}
      {page === "pagamento" && <CheckouteStep3Pagamento />}
    </div>
  );
}
