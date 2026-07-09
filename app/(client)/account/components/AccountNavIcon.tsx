export type AccountIconName = "orders" | "profile" | "address" | "heart" | "return";

// Shared so the (server) sidebar fallback and the (client) SidebarNav render
// identical icons — no layout shift when the nav hydrates.
export default function AccountNavIcon({
  name,
  className,
}: {
  name: AccountIconName;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "orders":
      return (
        <svg {...common}>
          <path d="M6 3h12a1 1 0 0 1 1 1v16l-3.5-2-3.5 2-3.5-2L5 20V4a1 1 0 0 1 1-1Z" />
          <path d="M9 8h6M9 12h6" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
        </svg>
      );
    case "address":
      return (
        <svg {...common}>
          <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case "return":
      return (
        <svg {...common}>
          <path d="M9 14 4 9l5-5" />
          <path d="M4 9h11a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5H8" />
        </svg>
      );
    default:
      return null;
  }
}
