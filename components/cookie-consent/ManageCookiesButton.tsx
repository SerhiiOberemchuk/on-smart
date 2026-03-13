"use client";

import { MANAGE_COOKIES_EVENT } from "@/components/cookie-consent/constants";

export default function ManageCookiesButton() {
  return (
    <button
      className="hover:text-yellow-500"
      onClick={() => window.dispatchEvent(new Event(MANAGE_COOKIES_EVENT))}
      type="button"
    >
      Gestisci cookie
    </button>
  );
}
