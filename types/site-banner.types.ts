export const SITE_BANNER_VARIANT_LIST = ["info", "warning", "success", "promo"] as const;

export type SiteBannerVariant = (typeof SITE_BANNER_VARIANT_LIST)[number];

export const SITE_BANNER_VARIANT_OPTIONS: { value: SiteBannerVariant; label: string }[] = [
  { value: "info", label: "Інформація (синій)" },
  { value: "warning", label: "Увага (жовтий)" },
  { value: "success", label: "Успіх (зелений)" },
  { value: "promo", label: "Промо (акцент)" },
];

/**
 * Presentation styles per variant for the public announcement bar.
 * Kept here so the admin preview and the live banner stay in sync.
 */
export const SITE_BANNER_VARIANT_STYLES: Record<SiteBannerVariant, string> = {
  info: "bg-[#2882b6] text-white",
  warning: "bg-yellow-500 text-black",
  success: "bg-green-500 text-white",
  promo: "bg-header-footer-100 text-white ring-1 ring-inset ring-yellow-500/70",
};
