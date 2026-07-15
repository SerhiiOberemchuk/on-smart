import Link from "next/link";

import { getActiveSiteBanner } from "@/app/actions/site-banner/get-site-banner";
import { SITE_BANNER_VARIANT_STYLES } from "@/types/site-banner.types";

import { BANNER_ICONS } from "./banner-icons";

export default async function TopBanner() {
  const banner = await getActiveSiteBanner();

  if (!banner || !banner.message) return null;

  const variantClass = SITE_BANNER_VARIANT_STYLES[banner.variant] ?? SITE_BANNER_VARIANT_STYLES.info;
  // `none` maps to null on purpose — don't `??` it back to a default icon.
  const Icon = banner.icon in BANNER_ICONS ? BANNER_ICONS[banner.icon] : BANNER_ICONS.megaphone;

  return (
    <div
      className={`w-full border-t border-black/10 ${variantClass}`}
      role="region"
      aria-label="Оголошення"
    >
      <div className="container flex items-center justify-center gap-3 px-4 py-2.5 text-center text-sm font-medium sm:text-[15px]">
        {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}

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
