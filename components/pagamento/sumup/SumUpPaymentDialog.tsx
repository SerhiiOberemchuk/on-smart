"use client";

import InlineSpinner from "@/components/InlineSpinner";
import type { Ref } from "react";

export default function SumUpPaymentDialog({
  isProcessingResponse,
  isClosing,
  onClose,
  containerRef,
}: {
  isProcessingResponse: boolean;
  isClosing: boolean;
  onClose: () => Promise<void>;
  containerRef: Ref<HTMLDivElement>;
}) {
  return (
    <div
      className="fixed inset-0 z-1000 flex justify-center overflow-y-scroll bg-black/60 py-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (isProcessingResponse) return;
        if (e.target === e.currentTarget) void onClose();
      }}
    >
      <div className="relative w-full max-w-2xl shadow-2xl">
        <button
          type="button"
          onClick={() => void onClose()}
          disabled={isProcessingResponse || isClosing}
          className="absolute top-3 right-3 rounded-lg px-3 py-1 text-sm text-black/70 hover:bg-black/5 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Chiudi"
        >
          {isClosing ? <InlineSpinner /> : "x"}
        </button>

        {isProcessingResponse ? (
          <div className="px-4 pt-4 text-sm text-white">
            Conferma del pagamento in corso. Non chiudere questa finestra.
          </div>
        ) : null}
        <div id="sumUpIdContainer" ref={containerRef} className="pb-4" />
      </div>
    </div>
  );
}
