"use client";

import Script from "next/script";

export default function KlarnaScript() {
  return <Script src="https://x.klarnacdn.net/kp/lib/v1/api.js" strategy="afterInteractive" />;
}
