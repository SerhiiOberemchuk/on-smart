export const SITE_BANNER_VARIANT_LIST = ["info", "warning", "success", "promo"] as const;

export type SiteBannerVariant = (typeof SITE_BANNER_VARIANT_LIST)[number];

export const SITE_BANNER_ICON_LIST = [
  "megaphone",
  "info",
  "warning",
  "gift",
  "calendar",
  "clock",
  "truck",
  "tag",
  "sparkles",
  "bell",
  "none",
] as const;

export type SiteBannerIcon = (typeof SITE_BANNER_ICON_LIST)[number];

export const SITE_BANNER_ICON_OPTIONS: { value: SiteBannerIcon; label: string }[] = [
  { value: "megaphone", label: "Рупор" },
  { value: "info", label: "Інформація" },
  { value: "warning", label: "Увага" },
  { value: "gift", label: "Подарунок" },
  { value: "calendar", label: "Календар" },
  { value: "clock", label: "Годинник" },
  { value: "truck", label: "Доставка" },
  { value: "tag", label: "Знижка" },
  { value: "sparkles", label: "Акція" },
  { value: "bell", label: "Дзвіночок" },
  { value: "none", label: "Без іконки" },
];

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
