"use client";

import Clarity from "@microsoft/clarity";
import { useEffect } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
} from "@/components/cookie-consent/constants";

const CLARITY_PROJECT_ID = "yf44pg3x6f";

export default function MicrosoftClarity() {
  useEffect(() => {
    let isInitialized = false;

    const syncConsent = () => {
      try {
        const isAccepted = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted";

        if (isAccepted && !isInitialized) {
          // The SDK deduplicates its script, including during Strict Mode effect replays.
          Clarity.init(CLARITY_PROJECT_ID);
          isInitialized = true;
        }

        if (isInitialized) {
          Clarity.consentV2({
            ad_Storage: "denied",
            analytics_Storage: isAccepted ? "granted" : "denied",
          });
        }
      } catch (error) {
        console.error("[MicrosoftClarity] Unable to synchronize analytics consent", error);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_STORAGE_KEY || event.key === null) {
        syncConsent();
      }
    };

    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
