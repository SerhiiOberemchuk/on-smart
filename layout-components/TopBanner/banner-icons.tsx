import type { ReactElement } from "react";

import type { SiteBannerIcon } from "@/types/site-banner.types";

type IconProps = { className?: string };

const SVG_BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Megaphone({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l4 3V7L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M10 7 18 4v16l-8-3" />
      <path d="M18 9a3 3 0 0 1 0 6" />
    </svg>
  );
}

function Info({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function Warning({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function Gift({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      <path d="M12 8C12 8 11 4 8.5 4a2.5 2.5 0 0 0 0 5H12Z" />
      <path d="M12 8s1-4 3.5-4a2.5 2.5 0 0 1 0 5H12Z" />
    </svg>
  );
}

function Calendar({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

function Clock({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function Truck({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

function Tag({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Sparkles({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" />
      <path d="M18 15l.7 1.9L20.6 17.6l-1.9.7L18 20l-.7-1.7L15.4 17.6l1.9-.7L18 15Z" />
    </svg>
  );
}

function Bell({ className }: IconProps) {
  return (
    <svg {...SVG_BASE} className={className}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

/**
 * Registry of selectable banner icons, shared by the public banner and the
 * admin picker. "none" renders nothing so the message can stand alone.
 */
export const BANNER_ICONS: Record<SiteBannerIcon, ((props: IconProps) => ReactElement) | null> =
  {
    megaphone: Megaphone,
    info: Info,
    warning: Warning,
    gift: Gift,
    calendar: Calendar,
    clock: Clock,
    truck: Truck,
    tag: Tag,
    sparkles: Sparkles,
    bell: Bell,
    none: null,
  };
