import Link from "next/link";

import { getActiveSiteBanner } from "@/app/actions/site-banner/get-site-banner";
import { SITE_BANNER_VARIANT_STYLES } from "@/types/site-banner.types";

function MegaphoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <path d="M3 11v2a1 1 0 0 0 1 1h2l4 3V7L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M10 7 18 4v16l-8-3" />
      <path d="M18 9a3 3 0 0 1 0 6" />
    </svg>
  );
}

export default async function TopBanner() {
  const banner = await getActiveSiteBanner();

  if (!banner || !banner.message) return null;

  const variantClass = SITE_BANNER_VARIANT_STYLES[banner.variant] ?? SITE_BANNER_VARIANT_STYLES.info;

  return (
    <div className={`w-full ${variantClass}`} role="region" aria-label="Оголошення">
      <div className="container flex items-center justify-center gap-3 px-4 py-2.5 text-center text-sm font-medium sm:text-[15px]">
        <MegaphoneIcon />

        <p className="max-w-4xl leading-snug">
          {banner.message}
          {banner.linkUrl ? (
            <Link
              href={banner.linkUrl}
              className="ml-2 inline-flex items-center gap-1 whitespace-nowrap font-semibold underline decoration-2 underline-offset-2 transition-opacity hover:opacity-80"
            >
              {banner.linkLabel?.trim() || "Докладніше"}
              <span aria-hidden>→</span>
            </Link>
          ) : null}
        </p>
      </div>
    </div>
  );
}
