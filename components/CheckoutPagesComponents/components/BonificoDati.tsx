import { useCheckoutStore } from "@/store/checkout-store";
import { bonificoData } from "@/types/bonifico.data";
import { toast } from "react-toastify";

export default function BonificoDati() {
  const notify = () => toast("Testo copiato negli appunti", { autoClose: 2000 });
  const { orderNumber } = useCheckoutStore();
  return (
    <div className="mt-4 pl-8 text-sm text-text-grey">
      <p>Per completare il pagamento tramite bonifico bancario, utilizza i seguenti dati:</p>
      <ul className="mt-2 gap-1 text-white">
        {bonificoData.map((item, index) => {
          const textToCopy =
            bonificoData.length !== index + 1 ? item.value : `${item.value} ${orderNumber}`;
          return (
            <li key={index} className="flex items-center gap-2">
              <span className="text-text-grey">{item.title}:</span> {textToCopy}
              <button
                className="stroke-white hover:stroke-yellow-600"
                onClick={() => {
                  navigator.clipboard.writeText(textToCopy);
                  notify();
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 11.2353C8 9.23906 8 8.24024 8.586 7.62047C9.17133 7 10.1147 7 12 7H14C15.8853 7 16.8287 7 17.414 7.62047C18 8.24024 18 9.23906 18 11.2353V14.7647C18 16.7609 18 17.7598 17.414 18.3795C16.8287 19 15.8853 19 14 19H12C10.1147 19 9.17133 19 8.586 18.3795C8 17.7598 8 16.7609 8 14.7647V11.2353Z"
                    // stroke="#D9D9D9"
                  />
                  <path
                    d="M8 17C7.46957 17 6.96086 16.7769 6.58579 16.3798C6.21071 15.9826 6 15.444 6 14.8824V10.6471C6 7.98518 6 6.65388 6.78133 5.82729C7.56267 5.00071 8.81933 5 11.3333 5H14C14.5304 5 15.0391 5.22311 15.4142 5.62024C15.7893 6.01738 16 6.55601 16 7.11765"
                    // stroke="#D9D9D9"
                  />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
