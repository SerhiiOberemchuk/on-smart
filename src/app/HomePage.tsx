"use client";

import { useState } from "react";

export default function HomePage({ children }: { children?: React.ReactNode }) {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8">
      <h1>
        La videosorveglianza è uno dei modi più affidabili per proteggere la tua
        proprietà. Dopotutto, se non una registrazione video di tutto ciò che
        accade, se necessario, sarà la migliore prova in una situazione
        controversa. Le telecamere di sorveglianza sono installate sul
        territorio delle case di campagna, negli uffici, nei centri commerciali
        e persino negli appartamenti. Tuttavia, a seconda del compito specifico,
        è necessario scegliere i dispositivi più adatti che soddisfino le vostre
        esigenze e le condizioni in cui dovrete condurre le osservazioni.
      </h1>
      <button
        type="button"
        className=" bg-blue-400 p-5"
        onClick={() => {
          setCount((c) => c + 1);
        }}
      >
        On clil home page component
      </button>
      <span className=" bg-blue-400 p-5">{count}</span>
      {children}
    </div>
  );
}
