"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef } from "react";

// Runs before paint on the client, falls back to useEffect during SSR.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Pins the header + announcement banner to the top of every page and exposes
 * their height as the `--header-height` CSS var, so sticky page elements
 * (e.g. the account sidebar) can sit right below it. Adapts to the banner
 * being present or not; no scroll behaviour, no size changes.
 */
export default function StickyHeaderShell({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const setVar = () => {
      document.documentElement.style.setProperty("--header-height", `${el.offsetHeight}px`);
    };

    setVar();
    // Re-measure once layout settles (banner streamed in, fonts/images loaded).
    const raf = requestAnimationFrame(setVar);
    window.addEventListener("load", setVar);
    const observer = new ResizeObserver(setVar);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", setVar);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={shellRef} className="sticky top-0 z-50">
      {children}
    </div>
  );
}
