import CheckoutStepsLinks from "./components/CheckoutStepsLinks";
import FormClientData from "./components/FormClientData";

export default function PageLayoutCheckout() {
  return (
    <div className="-mx-4 flex flex-col gap-6 bg-background p-3 md:mx-0">
      <CheckoutStepsLinks />
      <FormClientData />
    </div>
  );
}
