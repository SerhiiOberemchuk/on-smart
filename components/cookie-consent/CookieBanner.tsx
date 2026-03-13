"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ButtonYellow from "@/components/BattonYellow";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_STORAGE_KEY,
  MANAGE_COOKIES_EVENT,
  type CookieConsentState,
} from "@/components/cookie-consent/constants";

function persistConsent(consent: CookieConsentState) {
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, consent);

  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${consent}; path=/; max-age=31536000; SameSite=Lax`;

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, {
      detail: { consent },
    }),
  );
}

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem(
      COOKIE_CONSENT_STORAGE_KEY,
    ) as CookieConsentState | null;

    if (!storedConsent) {
      setAnalyticsEnabled(false);
      setIsCustomizing(false);
      setIsOpen(true);
      return;
    }

    setAnalyticsEnabled(storedConsent === "accepted");
  }, []);

  useEffect(() => {
    const openBanner = () => {
      const storedConsent = localStorage.getItem(
        COOKIE_CONSENT_STORAGE_KEY,
      ) as CookieConsentState | null;

      setAnalyticsEnabled(storedConsent === "accepted");
      setIsCustomizing(true);
      setIsOpen(true);
    };

    window.addEventListener(MANAGE_COOKIES_EVENT, openBanner);

    return () => window.removeEventListener(MANAGE_COOKIES_EVENT, openBanner);
  }, []);

  const handleDecision = (consent: CookieConsentState) => {
    persistConsent(consent);
    setAnalyticsEnabled(consent === "accepted");
    setIsCustomizing(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-[28rem] rounded-2xl border border-stroke-grey bg-[linear-gradient(180deg,rgba(51,51,51,0.96)_0%,rgba(18,18,18,0.98)_100%)] p-5 text-white shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur md:inset-x-6 md:bottom-6 md:max-w-[34rem]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500">
          Cookie
        </p>
        <span className="rounded-full border border-green/40 bg-green/10 px-2 py-1 text-[11px] font-medium text-green-400">
          Essenziali attivi
        </span>
      </div>

      <p className="mb-2 text-lg font-semibold leading-tight">
        Usiamo cookie tecnici e, previo consenso, Google Analytics per migliorare il sito.
      </p>

      <p className="text-sm leading-6 text-text-grey">
        I cookie essenziali restano attivi per carrello, sicurezza e checkout. Puoi accettare o
        rifiutare i cookie analitici. Dettagli nella{" "}
        <Link className="text-yellow-500 underline-offset-4 hover:underline" href="/cookies">
          Cookie Policy
        </Link>
        .
      </p>

      {isCustomizing ? (
        <>
          <div className="mt-5 rounded-xl border border-stroke-grey/80 bg-black/20 p-4">
            <div className="flex items-start gap-3">
              <input checked disabled readOnly type="checkbox" />
              <div>
                <p className="font-medium text-white">Cookie essenziali</p>
                <p className="text-sm text-text-grey">
                  Sempre attivi per funzionamento, sicurezza e checkout.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <input
                checked={analyticsEnabled}
                onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                type="checkbox"
              />
              <div>
                <p className="font-medium text-white">Cookie analitici</p>
                <p className="text-sm text-text-grey">
                  Google Analytics:{" "}
                  <span className={analyticsEnabled ? "text-green-400" : "text-yellow-500"}>
                    {analyticsEnabled ? "attivi" : "disattivati"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonYellow
              className="sm:flex-1"
              onClick={() => handleDecision(analyticsEnabled ? "accepted" : "rejected")}
            >
              Salva preferenze
            </ButtonYellow>
            <button
              className="rounded-sm border border-stroke-grey px-4 py-2 text-white hover:border-yellow-500 hover:text-yellow-500 sm:flex-1"
              onClick={() => setIsCustomizing(false)}
              type="button"
            >
              Indietro
            </button>
          </div>
        </>
      ) : (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonYellow className="sm:flex-1" onClick={() => handleDecision("accepted")}>
            Accetta tutti
          </ButtonYellow>
          <button
            className="rounded-sm border border-stroke-grey px-4 py-2 text-white hover:border-yellow-500 hover:text-yellow-500 sm:flex-1"
            onClick={() => handleDecision("rejected")}
            type="button"
          >
            Rifiuta
          </button>
          <button
            className="rounded-sm border border-stroke-grey bg-black/20 px-4 py-2 text-white hover:border-yellow-500 hover:text-yellow-500 sm:basis-full"
            onClick={() => setIsCustomizing(true)}
            type="button"
          >
            Personalizza
          </button>
        </div>
      )}
    </aside>
  );
}
