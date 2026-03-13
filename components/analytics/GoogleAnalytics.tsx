"use client";

import { GoogleAnalytics as NextGoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import { useEffect, useState } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentState,
} from "@/components/cookie-consent/constants";

declare global {
  interface Window {
    google_tag_manager?: Record<string, unknown>;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

type GoogleAnalyticsProps = {
  gtagId?: string;
};

function getStoredConsent(): CookieConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const consent = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  return consent === "accepted" || consent === "rejected" ? consent : null;
}

function deleteCookie(name: string, domain?: string) {
  const domainAttribute = domain ? ` domain=${domain};` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;${domainAttribute} SameSite=Lax`;
}

function deleteGoogleAnalyticsCookies() {
  const hostname = window.location.hostname;
  const hostnameParts = hostname.split(".");
  const candidateDomains = new Set<string | undefined>([undefined, hostname, `.${hostname}`]);

  if (hostnameParts.length >= 2) {
    candidateDomains.add(`.${hostnameParts.slice(-2).join(".")}`);
  }

  if (hostnameParts.length >= 3) {
    candidateDomains.add(`.${hostnameParts.slice(-3).join(".")}`);
  }

  const gaCookieNames = document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter(
      (name) =>
        name === "_ga" ||
        name === "_gid" ||
        name === "_gat" ||
        name.startsWith("_ga_") ||
        name.startsWith("_gat_") ||
        name.startsWith("_dc_gtm_"),
    );

  for (const cookieName of new Set(gaCookieNames)) {
    for (const domain of candidateDomains) {
      deleteCookie(cookieName, domain);
    }
  }
}

function updateConsent(granted: boolean) {
  sendGAEvent("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    personalization_storage: "denied",
  });
}

function sendConfig(gtagId: string) {
  sendGAEvent("config", gtagId, {
    anonymize_ip: true,
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search,
  });
}

export default function GoogleAnalytics({ gtagId }: GoogleAnalyticsProps) {
  const [hasMountedAnalytics, setHasMountedAnalytics] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);

  useEffect(() => {
    if (!gtagId || typeof window === "undefined") {
      return;
    }

    const storedConsent = getStoredConsent();
    const disableFlag = `ga-disable-${gtagId}` as const;

    window[disableFlag] = storedConsent !== "accepted";
    setConsent(storedConsent);
    setHasMountedAnalytics(storedConsent === "accepted");

    const handleConsentChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ consent?: CookieConsentState }>).detail;
      const nextConsent = detail?.consent ?? getStoredConsent();

      window[disableFlag] = nextConsent !== "accepted";
      setConsent(nextConsent);
      if (nextConsent === "accepted") {
        setHasMountedAnalytics(true);
      }
      if (nextConsent !== "accepted") {
        deleteGoogleAnalyticsCookies();
      }
    };

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);
    };
  }, [gtagId]);

  useEffect(() => {
    if (!gtagId || !hasMountedAnalytics || typeof window === "undefined") {
      return;
    }

    const applyAccepted = () => {
      updateConsent(true);
      sendConfig(gtagId);
    };

    const applyRejected = () => {
      updateConsent(false);
      deleteGoogleAnalyticsCookies();
    };

    if (consent === "accepted") {
      const timeoutId = window.setTimeout(applyAccepted, 0);
      return () => window.clearTimeout(timeoutId);
    }

    if (consent === "rejected") {
      applyRejected();
    }
  }, [consent, gtagId, hasMountedAnalytics]);

  if (!gtagId || !hasMountedAnalytics) {
    return null;
  }

  return <NextGoogleAnalytics gaId={gtagId} />;
}
