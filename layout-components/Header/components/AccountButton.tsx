import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import AccountMenu from "./AccountMenu";

// First letter of the first + last token (handles "Nome Cognome", single names,
// and non-Latin scripts). Falls back to "?" for an empty name.
function getInitials(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0].charAt(0).toUpperCase();
  return (tokens[0].charAt(0) + tokens[tokens.length - 1].charAt(0)).toUpperCase();
}

export default async function AccountButton() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <Link
        href="/accedi"
        className="flex items-center gap-2.5 p-3 text-white md:px-4 md:py-2"
        aria-label="Accedi"
      >
        <UserIcon />
        <span className="btn hidden xs:block">Account</span>
      </Link>
    );
  }

  const name = session.user.name?.trim() || "Account";
  const firstName = name.split(/\s+/)[0];
  const isAdmin = session.user.role === "admin";
  return <AccountMenu firstName={firstName} initials={getInitials(name)} isAdmin={isAdmin} />;
}

// Inline (not next/image) so it inherits the header's white text via
// currentColor — the SVG file itself has a near-black stroke.
function UserIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
    </svg>
  );
}

export function AccountButtonSkeleton() {
  return (
    <div className="flex items-center p-2 md:px-3">
      <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}
