"use client";

import { useSyncExternalStore } from "react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentState,
} from "@/components/cookie-consent/constants";

function subscribe(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): CookieConsentState | null {
  const consent = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  return consent === "accepted" || consent === "rejected" ? consent : null;
}

function getServerSnapshot(): undefined {
  return undefined;
}

export function useCookieConsent() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
