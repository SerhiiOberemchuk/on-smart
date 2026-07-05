import userIcon from "@/assets/icons/user.svg";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import AccountMenu from "./AccountMenu";

export default async function AccountButton() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <Link
        href="/accedi"
        className="flex items-center gap-2.5 p-3 md:px-4 md:py-2"
        aria-label="Accedi"
      >
        <Image src={userIcon} width={24} alt="" title="Account" />
        <span className="btn hidden xs:block">Account</span>
      </Link>
    );
  }

  const firstName = session.user.name?.split(" ")[0] || "Account";
  const isAdmin = session.user.role === "admin";
  return <AccountMenu name={firstName} isAdmin={isAdmin} />;
}

export function AccountButtonSkeleton() {
  return (
    <div className="flex items-center gap-2.5 p-3 md:px-4 md:py-2">
      <div className="h-6 w-6 animate-pulse rounded-full bg-black/10" />
      <span className="hidden h-4 w-14 animate-pulse rounded bg-black/10 xs:block" />
    </div>
  );
}
