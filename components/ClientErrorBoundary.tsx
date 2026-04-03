"use client";

import { ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

function DefaultFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="fixed right-4 bottom-4 z-[1100] max-w-sm rounded-sm border border-red-500/40 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-xl">
      <p>Si e verificato un errore in questo componente.</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-3 rounded-sm border border-yellow-500 px-3 py-2 text-xs text-white hover:bg-yellow-500 hover:text-black"
      >
        Riprova
      </button>
    </div>
  );
}

export default function ClientErrorBoundary({
  children,
  fallback,
  onReset,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}) {
  return (
    <ErrorBoundary
      onReset={onReset}
      fallbackRender={({ resetErrorBoundary }) =>
        fallback ?? <DefaultFallback resetErrorBoundary={resetErrorBoundary} error={new Error()} />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
